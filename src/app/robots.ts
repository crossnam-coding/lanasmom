import type { MetadataRoute } from "next";

/** 정적 export(GitHub Pages)에서 빌드 시각에 한 번만 생성한다 */
export const dynamic = "force-static";

/**
 * ⚠️ 지금은 색인을 막아둔다.
 *   사업자등록번호·영업신고번호가 아직 비어 있고(`●●●`), 상품 상세도 일부 미완이다.
 *   미완성 상태가 검색에 잡히면 되돌리기 어렵다.
 *
 * 🔓 도메인(lanasmom.com) 붙이고 사업자정보 채우면 아래 INDEXABLE 을 true 로 바꾼다.
 *   그때 AI 크롤러(GPTBot·ClaudeBot·PerplexityBot 등)를 열어주는 것이 GEO 의 전제다.
 *   ⚠️ 막으면 생성형 검색에 인용될 수 없다 — 도메인 붙이면 반드시 푼다.
 */
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lanasmom.com";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Yeti", allow: "/" }, // 네이버
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
