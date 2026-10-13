import { json, type Env } from "../../../_lib/env";
import { getOrder } from "../../../_lib/orders";

/** 주문자 본인 확인용 — 주문번호 + 비밀키가 맞을 때만, 필요한 것만 돌려준다 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const key = new URL(request.url).searchParams.get("key");
  const o = await getOrder(env, String(params.id));
  if (!o || !key || key !== o.access_key) return json({ error: "주문을 찾을 수 없어요." }, 404);
  return json({
    id: o.id, status: o.status, createdAt: o.created_at, total: o.total, subtotal: o.subtotal, shipping: o.shipping,
    items: JSON.parse(o.items_json), name: o.name, receiptUrl: o.receipt_url, trackingNo: o.tracking_no,
  });
};
