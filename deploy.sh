#!/usr/bin/env bash
# 라나엄마 사이트 → Cloudflare Pages 배포
#   ./deploy.sh                              색인 열고 배포 (기본 · 2026-11-05 오빠 결정: 이미 영업 중이라 막을 이유 없음)
#   NEXT_PUBLIC_INDEXABLE=false ./deploy.sh  색인 다시 막고 배포 (비상용)
#
# 반드시 out/ 만 올린다. `wrangler pages deploy .` 는 .gitignore 를 보지 않아
# 소스·비밀 파일이 통째로 올라간다 (2026-08-03 타 프로젝트 사고).
set -euo pipefail
cd "$(dirname "$0")"

ENV_FILE="${CF_ENV:-$HOME/존버맵/.env}"   # CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID
[ -f "$ENV_FILE" ] || { echo "❌ Cloudflare 토큰 파일 없음: $ENV_FILE"; exit 1; }
set -a; . "$ENV_FILE"; set +a

# 주문·결제·어드민(functions + D1)이 아직 준비 전이면 «글·사진만» 올린다.
#   - wrangler.toml 의 D1 id 가 가짜인 동안은 자동으로 STATIC_ONLY=1
#   - 이때 functions/ 와 wrangler.toml 을 빼고, 주문·어드민 화면(/admin /cart /checkout …)도 out 에서 뺀다
STATIC_ONLY="${STATIC_ONLY:-}"
if grep -q '00000000-0000-0000-0000-000000000000' wrangler.toml 2>/dev/null; then
  if [ "$STATIC_ONLY" = "0" ]; then echo "❌ D1 id 가 가짜인데 STATIC_ONLY=0 — D1 을 먼저 만든다"; exit 1; fi
  STATIC_ONLY=1
fi

export NEXT_PUBLIC_INDEXABLE="${NEXT_PUBLIC_INDEXABLE:-true}"

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
if [ "$NEXT_PUBLIC_INDEXABLE" = "true" ]; then
  # 열기로 했는데 막혀 있거나, 사이트맵이 robots 에 안 실리면 검색엔진이 못 찾는다
  ! grep -q 'Disallow: /$' out/robots.txt || { echo "❌ 색인을 열기로 했는데 robots.txt 가 막혀 있다"; exit 1; }
  grep -q 'Sitemap: https://lanasmom.com/sitemap.xml' out/robots.txt || { echo "❌ robots.txt 에 사이트맵 주소가 없다"; exit 1; }
  ! grep -q '<meta name="robots" content="noindex' out/index.html || { echo "❌ 홈에 noindex 가 남아 있다"; exit 1; }
elif ! grep -q 'Disallow: /' out/robots.txt; then
  echo "❌ 색인을 막기로 했는데 robots.txt 가 열려 있다"; exit 1
fi
echo "✅ 검사 통과 · 파일 $(find out -type f | wc -l | tr -d ' ')개 · 색인 $([ "$NEXT_PUBLIC_INDEXABLE" = "true" ] && echo 열림 || echo 차단)"

if [ "$STATIC_ONLY" = "1" ]; then
  for r in admin cart checkout login my contact inquiry order; do rm -rf "out/$r"; done
  [ ! -e out/admin ] && [ ! -e out/checkout ] || { echo "❌ 주문·어드민 화면이 out 에 남았다"; exit 1; }
  STAGE="$(mktemp -d)"; trap 'rm -rf "$STAGE"' EXIT
  cp -R out "$STAGE/out"           # functions/·wrangler.toml 이 없는 곳에서 올린다 = 글·사진만
  echo "ℹ️  글·사진만 배포 (functions·D1 제외) · 파일 $(find "$STAGE/out" -type f | wc -l | tr -d ' ')개"
  (cd "$STAGE" && npx --yes wrangler@4 pages deploy out --project-name lanasmom --branch main --commit-dirty=true)
else
  npx --yes wrangler@4 pages deploy out --project-name lanasmom --branch main --commit-dirty=true
fi
