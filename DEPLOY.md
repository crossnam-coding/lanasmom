# 배포 — 라나엄마 브랜드 사이트

> 2026-10-13 갱신. **이 파일이 배포 정본이다.**

## 지금 배포 방식 = GitHub Pages
- 주소: https://crossnam-coding.github.io/lanasmom/
- repo: `crossnam-coding/lanasmom` (public) · 워크플로 `.github/workflows/deploy-pages.yml`
- **`main` 에 push 하면 자동으로 빌드·배포된다.** 따로 명령 없음.
- 🚫 **Vercel 은 쓰지 않는다.** `lanasmom.vercel.app` 은 HTTP 402(결제 잠김)로 죽었다(2026-09-14). `vercel --prod` 금지.
  `vercel.json` 은 정적 호스팅에선 무시되므로 남아 있어도 아무 효과가 없다.

## 빌드 원리 (깨지기 쉬운 곳)
- `next.config.ts` = `output: "export"` (정적) · `basePath` 는 `NEXT_PUBLIC_BASE_PATH` 환경변수
- 이미지는 `image-loader.ts` 를 쓴다. `images.unoptimized` 로 바꾸면 **basePath 가 안 붙어 이미지 전부 404** (2026-09-14 실측 사고)
- `robots.ts`·`sitemap.ts` 는 `dynamic = "force-static"` 이 있어야 export 된다

## 🔒 색인은 막혀 있다
- `NEXT_PUBLIC_INDEXABLE` 가 `"true"` 가 아니면 `robots.txt` = `Disallow: /` + meta `noindex`
- **푸는 시점 = 스토어 명의가 법인으로 넘어가고 사업자정보를 채운 날** (`Ai Docu/라나맘/CLAUDE.md` K9③)
- 그날 같이 할 것: 푸터·소개 `●●●` 채우기 · 쿠키 없는 방문 분석 · **개인정보처리방침**(분석 넣는 순간 필요)

## 도메인 `lanasmom.com` 연결 (2026-10-13 확정 · 구매 후)
> 연결은 색인과 별개다. **연결해도 색인은 계속 막혀 있다** → 먼저 연결해도 된다.

1. **등록처 DNS** (값은 GitHub 공식 문서 2026-10-13 확인)
   - apex `@` **A** ×4: `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`
   - apex `@` **AAAA** ×4: `2606:50c0:8000::153` `2606:50c0:8001::153` `2606:50c0:8002::153` `2606:50c0:8003::153`
   - `www` **CNAME** → `crossnam-coding.github.io` (repo 이름 붙이지 말 것)
2. **Pages 에 도메인 지정** — Actions 배포라 `CNAME` 파일은 **필요 없고 무시된다**
   ```bash
   gh api -X PUT repos/crossnam-coding/lanasmom/pages -f cname=lanasmom.com
   ```
3. **워크플로 env 수정** (`deploy-pages.yml`)
   - `NEXT_PUBLIC_BASE_PATH` 줄 삭제 (루트 배포가 되므로)
   - `NEXT_PUBLIC_SITE_URL: https://lanasmom.com`
4. push → 배포 확인 → 인증서 발급되면 **HTTPS 강제**
   ```bash
   gh api -X PUT repos/crossnam-coding/lanasmom/pages -F https_enforced=true
   ```
5. 검증: `curl -I https://lanasmom.com` 200 · 이미지 경로에 `/lanasmom` 이 **안** 붙었는지 · `www` 리다이렉트

## 롤백
```bash
git revert <커밋>   # 이력 보존
git push            # 자동 재배포
```
