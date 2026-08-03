import type { MetadataRoute } from "next";

/**
 * ⚠️ AI 크롤러를 막지 않는다 — 그게 GEO(생성형엔진 최적화)의 전제다.
 * ChatGPT·Claude·Perplexity가 라나엄마를 인용하려면 먼저 읽을 수 있어야 한다.
 */
export default function robots(): MetadataRoute.Robots {
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
    sitemap: "https://lanasmom.com/sitemap.xml",
  };
}
