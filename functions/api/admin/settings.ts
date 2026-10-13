import { json, logEvent, type Env } from "../../_lib/env";
import { CARRIERS, getSettings, saveSettings, type Settings } from "../../_lib/settings";
import { PRODUCTS, slugOf } from "../../../src/data/products";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const costs = Object.fromEntries(((await env.DB.prepare("SELECT slug, cost FROM product_costs").all<{ slug: string; cost: number }>()).results ?? []).map((c) => [c.slug, c.cost]));
  return json({
    settings: await getSettings(env),
    carriers: Object.fromEntries(Object.entries(CARRIERS).map(([k, v]) => [k, v.name])),
    products: PRODUCTS.filter((p) => typeof p.price === "number").map((p) => ({ slug: slugOf(p), name: p.name, size: p.size, price: p.price, soldOut: !!p.soldOut, cost: costs[slugOf(p)] ?? null })),
  });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, data }) => {
  const b = (await request.json().catch(() => ({}))) as { settings?: Partial<Settings>; costs?: Record<string, number | null> };
  const out: Record<string, unknown> = {};
  if (b.settings) out.settings = await saveSettings(env, b.settings);
  if (b.costs) {
    const valid = new Set(PRODUCTS.map(slugOf));
    const stmts = Object.entries(b.costs).filter(([slug]) => valid.has(slug)).map(([slug, cost]) =>
      cost === null || cost === undefined || (cost as unknown) === ""
        ? env.DB.prepare("DELETE FROM product_costs WHERE slug = ?").bind(slug)
        : env.DB.prepare("INSERT INTO product_costs (slug, cost) VALUES (?, ?) ON CONFLICT(slug) DO UPDATE SET cost = excluded.cost").bind(slug, Math.max(0, Math.round(Number(cost)))),
    );
    if (stmts.length) await env.DB.batch(stmts);
  }
  await logEvent(env, "settings", null, { by: (data as Record<string, unknown>).adminEmail });
  return json({ ok: true, ...out });
};
