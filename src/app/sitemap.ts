import type { MetadataRoute } from "next";
import { POSTS } from "@/data/journal";
import { PRODUCTS, slugOf } from "@/data/products";

const SITE = "https://lanasmom.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticPages = ["", "/story", "/menu", "/recipes", "/journal", "/about"].map((p) => ({
    url: `${SITE}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.8,
  }));

  const recipes = ["hanwoo-jangjorim", "suji-sonjil", "gomtang"].map((r) => ({
    url: `${SITE}/recipes/${r}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const posts = POSTS.map((p) => ({
    url: `${SITE}/journal/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const products = PRODUCTS.map((p) => ({
    url: `${SITE}/menu/${slugOf(p)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p.hero ? 0.95 : 0.75,
  }));

  return [...staticPages, ...products, ...recipes, ...posts];
}
