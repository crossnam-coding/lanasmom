# 배포 — 라나엄마 브랜드 사이트

> 2026-10-13 갱신. **이 파일이 배포 정본이다.**

## 지금 배포 방식 = Cloudflare Pages (2026-10-13 이사)
- 주소: **https://lanasmom.com** (2026-10-13 연결 · `www` 도 같은 내용 · http→https 301) · 원본 `https://lanasmom.pages.dev`
- Cloudflare 계정 = 대시보드 표기 `Crossnam@naver.com's Account` · 도메인도 같은 계정에서 구매(등록처 Cloudflare · 만료 2027-10-13 전후 자동갱신 확인 필요)
- Cloudflare Pages 프로젝트 `lanasmom` (production branch `main`) · 직접 업로드 방식(깃 연동 아님)
- 배포 명령은 하나다.
  ```bash
  ./deploy.sh
  ```
  빌드 → 올리기 전 검사(하위경로 잔존 · 섞인 파일 · 색인 차단) → `out/` 업로드.
  토큰은 `~/존버맵/.env` 의 `CLOUDFLARE_API_TOKEN` · `CLOUDFLARE_ACCOUNT_ID` 를 읽는다(`CF_ENV` 로 바꿀 수 있음).
- 🚫 **`wrangler pages deploy .` 금지.** wrangler 는 `.gitignore` 를 보지 않는다 → 소스·비밀 파일이 통째로 공개된다. 반드시 `out/` 만.
- **`git push` 는 배포가 아니다.** 소스 보관일 뿐이다.

### 왜 옮겼나
- GitHub Pages 약관은 온라인 비즈니스·전자상거래 목적 사이트를 금지한다. 브랜드 사이트 + 구매 링크라 걸릴 수 있다.
- Cloudflare Pages 무료 한도(2026-10-13 공식 문서): 빌드 월 500 · 파일 2만 개 · 파일당 25MiB · 사용자 도메인 100개. 현재 673파일.

### 옛 배포처
| 곳 | 상태 |
|---|---|
| GitHub Pages `crossnam-coding.github.io/lanasmom/` | ✅ **2026-10-13 내림**(`gh api -X DELETE repos/crossnam-coding/lanasmom/pages` → 404 확인). `deploy-pages.yml` 은 수동 실행만 남아 있으나 Pages 가 꺼져 있어 쓰지 않는다 |
| Vercel `lanasmom.vercel.app` | HTTP 402(결제 잠김)로 죽음(2026-09-14). `vercel --prod` 금지 |

## 빌드 원리 (깨지기 쉬운 곳)
- `next.config.ts` = `output: "export"` (정적) · `basePath` 는 `NEXT_PUBLIC_BASE_PATH` 환경변수 — **Cloudflare 에선 비워 둔다**(루트 배포)
- 이미지는 `image-loader.ts` 를 쓴다. `images.unoptimized` 로 바꾸면 하위경로 배포에서 이미지 전부 404 (2026-09-14 실측 사고)
- `robots.ts`·`sitemap.ts` 는 `dynamic = "force-static"` 이 있어야 export 된다
- `NEXT_PUBLIC_SITE_URL` 기본값 = `https://lanasmom.com` (canonical · sitemap · JSON-LD 가 이 주소로 나간다)

## 배포 후 확인 (curl 로, 브라우저 캐시 믿지 말 것)
- 새 배포 직후 별칭(`lanasmom.pages.dev`)이 잠깐 옛 것을 줄 수 있다 → 바뀐 문구를 grep 하거나 로컬 `out/` 과 해시 대조
- 🔴 해시 대조는 **깔끔한 주소**(`/story/`)로 한다. `/story/index.html` 은 308 로 넘어가 빈 응답이 나온다(해시 `d41d8cd9…` = 빈 파일 → 검사 쪽 오류다)
- 배포본 고유 주소(`<해시>.lanasmom.pages.dev`)는 인증서가 몇 분 늦게 붙는다 — HTTP 000 이 나와도 배포 실패가 아니다

## 🔒 색인은 막혀 있다
- `NEXT_PUBLIC_INDEXABLE` 가 `"true"` 가 아니면 `robots.txt` = `Disallow: /` + meta `noindex`
- **푸는 시점 = 스토어 명의가 법인으로 넘어가고 사업자정보를 채운 날** (`Ai Docu/라나맘/CLAUDE.md` K9③)
  ```bash
  NEXT_PUBLIC_INDEXABLE=true ./deploy.sh
  ```
- 그날 같이 할 것: 푸터·소개 `●●●` 채우기 · 쿠키 없는 방문 분석 · **개인정보처리방침**(분석 넣는 순간 필요)

## 도메인 `lanasmom.com` 연결 — ✅ 2026-10-13 완료 (아래는 했던 순서·다시 할 때 참고)
> 🔴 API 로 Pages 에 도메인을 붙여도 DNS 레코드는 **자동으로 안 생겼다**(토큰에 DNS 권한 없음) → 대시보드 DNS 에서 `@`·`www` CNAME → `lanasmom.pages.dev`(프록시 켬) 를 손으로 넣고 재검증하니 1~2분 만에 active
> 연결은 색인과 별개다. **연결해도 색인은 계속 막혀 있다** → 먼저 연결해도 된다.

1. **구매** — Cloudflare 대시보드 → Domain Registration → Register Domains → `lanasmom.com` (결제 = 오빠)
   Cloudflare 에서 사면 영역(zone)과 네임서버가 자동으로 잡힌다. 등록처 DNS 를 따로 만질 일이 없다.
2. **Pages 에 도메인 붙이기** — 대시보드 Workers & Pages → `lanasmom` → Custom domains → `lanasmom.com`, `www.lanasmom.com`
   (API: `POST /accounts/<계정>/pages/projects/lanasmom/domains` `{"name":"lanasmom.com"}` — 2026-10-13 현재 연결된 도메인 0개 확인)
   ⚠️ 지금 토큰으로 영역 목록이 0개로 나온다. 영역이 없어서인지 DNS 권한이 없어서인지는 **구매 후 확인 필요**. 권한이 없으면 대시보드에서 붙인다.
3. `www` → 루트로 넘기는 규칙(Redirect Rule) 하나
4. 검증: `curl -I https://lanasmom.com` 200 · 인증서 · `www` 넘김 · `robots.txt` 가 여전히 `Disallow: /`
5. GitHub Pages 내리기 (위 표)

## 롤백
- Cloudflare 대시보드 → `lanasmom` → Deployments → 이전 배포 → **Rollback** (재빌드 없음)
- 또는 `git revert <커밋>` 뒤 `./deploy.sh`
