import { json, logEvent, nowIso, type Env } from "../../_lib/env";
import type { OrderRow } from "../../_lib/orders";

const STATUSES = ["pending", "paid", "preparing", "shipped", "cancelled", "failed", "review"] as const;
/** 사장님이 손으로 바꿀 수 있는 흐름. 결제 확정(paid)은 포트원 확인으로만 */
const NEXT: Record<string, string[]> = {
  paid: ["preparing", "shipped", "cancelled"],
  preparing: ["shipped", "paid", "cancelled"],
  shipped: ["preparing"],
  review: ["cancelled"],
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = new URL(request.url);
  const status = u.searchParams.get("status");
  const showPending = u.searchParams.get("pending") === "1";
  let sql = "SELECT * FROM orders";
  const args: string[] = [];
  if (status && (STATUSES as readonly string[]).includes(status)) {
    sql += " WHERE status = ?";
    args.push(status);
  } else if (!showPending) {
    sql += " WHERE status NOT IN ('pending','failed')"; // 결제 안 끝난 주문은 기본으로 숨긴다
  }
  sql += " ORDER BY created_at DESC LIMIT 200";
  const { results } = await env.DB.prepare(sql).bind(...args).all<OrderRow>();
  const counts = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM orders GROUP BY status").all<{ status: string; n: number }>();
  return json({
    orders: (results ?? []).map(({ access_key: _k, ...o }) => ({ ...o, items: JSON.parse(o.items_json) })),
    counts: Object.fromEntries((counts.results ?? []).map((c) => [c.status, c.n])),
  });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, data }) => {
  const b = (await request.json().catch(() => ({}))) as { id?: string; status?: string; trackingNo?: string; note?: string };
  if (!b.id) return json({ error: "주문번호가 없어요." }, 400);
  const o = await env.DB.prepare("SELECT status FROM orders WHERE id = ?").bind(b.id).first<{ status: string }>();
  if (!o) return json({ error: "주문을 찾을 수 없어요." }, 404);

  const sets: string[] = [];
  const args: (string | null)[] = [];
  if (b.status && b.status !== o.status) {
    if (!(NEXT[o.status] ?? []).includes(b.status)) return json({ error: `「${o.status}」에서 「${b.status}」로는 바꿀 수 없어요.` }, 400);
    sets.push("status = ?"); args.push(b.status);
    if (b.status === "shipped") { sets.push("shipped_at = ?"); args.push(nowIso()); }
  }
  if (typeof b.trackingNo === "string") { sets.push("tracking_no = ?"); args.push(b.trackingNo.trim().slice(0, 40) || null); }
  if (typeof b.note === "string") { sets.push("admin_note = ?"); args.push(b.note.trim().slice(0, 500) || null); }
  if (!sets.length) return json({ ok: true, unchanged: true });
  await env.DB.prepare(`UPDATE orders SET ${sets.join(", ")} WHERE id = ?`).bind(...args, b.id).run();
  await logEvent(env, "admin_update", b.id, { by: (data as Record<string, unknown>).adminEmail, from: o.status, ...b });
  return json({ ok: true });
};
