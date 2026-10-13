#!/usr/bin/env bash
# 라나엄마 사이트 → Cloudflare Pages 배포
#   ./deploy.sh                       색인 차단 상태로 배포 (기본)
#   NEXT_PUBLIC_INDEXABLE=true ./deploy.sh   색인 열고 배포 (사업자정보·스토어 법인 이전 후에만)
#
# 반드시 out/ 만 올린다. `wrangler pages deploy .` 는 .gitignore 를 보지 않아
# 소스·비밀 파일이 통째로 올라간다 (2026-08-03 타 프로젝트 사고).
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="${CF_ENV:-$HOME/존버맵/.env}"   # CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
[ -f "$ENV_FILE" ] || { echo "❌ Cloudflare 토큰 파일 없음: $ENV_FILE"; exit 1; }
set -a; . "$ENV_FILE"; set +a

# 실제 D1 을 만들기 전에는 배포하지 않는다 (가짜 id 로 올리면 주문 API 가 깨진다)
if grep -q '00000000-0000-0000-0000-000000000000' wrangler.toml 2>/dev/null; then
  echo "❌ wrangler.toml 의 D1 id 가 아직 가짜다 — Cloudflare 에서 D1 'lanasmom' 을 만들고 id 를 넣은 뒤 배포"; exit 1
fi

rm -rf out
# 홈페이지 결제 화면은 NEXT_PUBLIC_CHECKOUT=on 일 때만 보인다 (서버 쪽 스위치 = Cloudflare 환경변수 CHECKOUT_ENABLED)
NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://lanasmom.com}" NEXT_PUBLIC_CHECKOUT="${NEXT_PUBLIC_CHECKOUT:-off}" npx next build

# ── 올리기 전 검사 ───────────────────────────────────────────
[ -f out/index.html ] || { echo "❌ out/index.html 없음 — 빌드 실패"; exit 1; }
if grep -rlq '"/lanasmom/' out --include='*.html'; then
  echo "❌ 하위경로(/lanasmom/)가 남아 있다 — NEXT_PUBLIC_BASE_PATH 를 끄고 다시 빌드"; exit 1
fi
bad=$(find out -type f \( -name '*.md' -o -name '.env*' -o -name '*.bak' -o -name '*.toml' -o -name '*.ts' -o -name '*.log' \) | head -1)
[ -z "$bad" ] || { echo "❌ 올리면 안 되는 파일이 섞였다: $bad"; exit 1; }
if [ "${NEXT_PUBLIC_INDEXABLE:-}" != "true" ] && ! grep -q 'Disallow: /' out/robots.txt; then
  echo "❌ 색인 차단이 풀려 있다 — 의도한 게 아니면 중단"; exit 1
fi
echo "✅ 검사 통과 · 파일 $(find out -type f | wc -l | tr -d ' ')개 · 색인 $([ "${NEXT_PUBLIC_INDEXABLE:-}" = "true" ] && echo 열림 || echo 차단)"

npx --yes wrangler@4 pages deploy out --project-name lanasmom --branch main --commit-dirty=true
