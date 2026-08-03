# 배포 메모

## 지금 상태
- 임시 URL: **https://lanasmom.vercel.app** (Vercel · 계정 crossnam-3296)
- ⚠️ **`vercel.json` 으로 전 페이지에 `X-Robots-Tag: noindex, nofollow` 를 걸어 두었다.**
  미완성 상태(사업자정보 `●●●`)가 검색에 잡히지 않게 하기 위한 임시 조치.

## 진짜 도메인(lanasmom.com) 붙일 때 반드시 할 것
1. **`vercel.json` 의 headers 블록을 삭제한다.** ← 안 지우면 영원히 검색에 안 잡힌다
2. `src/app/layout.tsx` 의 `SITE` 상수와 `sitemap.ts`·`robots.ts` 의 도메인을 확인
3. 네이버 서치어드바이저 + 구글 서치콘솔에 사이트 등록, 사이트맵 제출
4. `/about` 과 푸터의 `●●●` 를 실제 사업자정보로 교체

## 명령
```bash
cd /Users/ros/lanasmom
vercel          # 프리뷰 배포
vercel --prod   # 프로덕션 반영
```
