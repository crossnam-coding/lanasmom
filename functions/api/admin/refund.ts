import { json, type Env } from "../../_lib/env";
import { refundOrder } from "../../_lib/refund";

export const onRequestPost: PagesFunction<Env> = async ({ request, env, data }) => {
  const b = (await request.json().catch(() => ({}))) as { id?: string; amount?: number; reason?: string };
  if (!b.id) return json({ error: "주문번호가 없어요." }, 400);
  const r = await refundOrder(env, b.id, Number(b.amount), String(b.reason ?? ""), String((data as Record<string, unknown>).adminEmail));
  return json(r, r.ok ? 200 : 400);
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const id = new URL(request.url).searchParams.get("id");
  const { results } = await env.DB.prepare("SELECT * FROM refunds WHERE (? IS NULL OR order_id = ?) ORDER BY id DESC LIMIT 200").bind(id, id).all();
  return json({ refunds: results ?? [] });
};
