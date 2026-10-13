import { json, type Env } from "../../_lib/env";
import { currentUser } from "../../_lib/auth";
import type { OrderRow } from "../../_lib/orders";

/** 내 주문 — 로그인한 상태에서 주문한 것만 (비회원 주문은 주문 완료 화면 주소로 본다) */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const u = await currentUser(request, env);
  if (!u) return json({ error: "로그인이 필요해요." }, 401);
  const { results } = await env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? AND status NOT IN ('pending','failed') ORDER BY created_at DESC LIMIT 100",
  ).bind(u.id).all<OrderRow>();
  return json({
    user: u,
    orders: (results ?? []).map((o) => ({
      id: o.id, key: o.access_key, status: o.status, createdAt: o.created_at, total: o.total,
      items: JSON.parse(o.items_json), trackingNo: o.tracking_no,
    })),
  });
};
