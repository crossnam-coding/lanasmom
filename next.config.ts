import type { NextConfig } from "next";

/**
 * GitHub Pages = 정적 호스팅.
 * 서버가 없으므로 ①정적 export ②이미지 최적화 끄기 ③하위경로(basePath) 처리가 필요하다.
 *
 * 도메인(lanasmom.com)을 붙일 때 할 일:
 *   1) BASE_PATH 를 빈 문자열로 (환경변수 미설정이면 자동으로 빈 값)
 *   2) src/app/robots.ts 의 noindex 해제
 *   3) vercel.json 삭제 (DEPLOY.md 참고)
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  images: { unoptimized: true },
  trailingSlash: true, // Pages 의 디렉터리 색인(/menu/ → /menu/index.html) 대응
};

export default nextConfig;
