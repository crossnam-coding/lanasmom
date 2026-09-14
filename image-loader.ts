/**
 * 정적 export(GitHub Pages) 전용 이미지 로더.
 *
 * next/image 는 `images.unoptimized: true` 일 때 basePath 를 src 에 붙여주지 않는다.
 * 그래서 하위경로 배포(/lanasmom)에서 public/ 이미지가 전부 404 가 된다.
 * 이 로더가 basePath 를 직접 붙인다. 최적화는 하지 않는다(정적 호스팅이라 서버가 없음).
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function imageLoader({ src }: { src: string }): string {
  if (/^https?:\/\//.test(src)) return src; // 외부 이미지는 그대로
  return `${BASE_PATH}${src}`;
}
