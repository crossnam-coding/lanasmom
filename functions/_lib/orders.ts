import { fetchPayment } from "./portone";
import { notifyOwner } from "./notify";
import { logEvent, nowIso, type Env } from "./env";
import type { OrderLine } from "./catalog";

export interface OrderRow {
  id: string; access_key: string; created_at: string; status: string;
  name: string; phone: string; email: string | null;
  zipcode: string; address1: string; address2: string | null; memo: string | null;
  items_json: string; subtotal: number; shipping: number; total: number;
  paid_at: string | null; pg_provider: string | null; receipt_url: string | null;
  tracking_no: string | null; shipped_at: string | null; admin_note: string | null; agree_at: string;
}

export const getOrder = (env: Env, id: string) =>
  env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<OrderRow>();

/**
 * 결제 확정 — /complete 와 웹훅이 같이 부른다. 몇 번 불려도 한 번만 paid 가 되고 알림도 한 번만 간다.
 * 돈 걸린 곳: 포트원에서 다시 조회한 금액이 주문 금액과 정확히 같을 때만 확정.
 */
export async function confirmPayment(env: Env, orderId: string): Promise<{ ok: boolean; status: string; reason?: string }> {
  const order = await getOrder(env, orderId);
  if (!order) return { ok: false, status: "missing", reason: "order_not_found" };
  if (order.status !== "pending") return { ok: order.status !== "failed", status: order.status };

  const pay = await fetchPayment(env, orderId);
  const currency = pay.currency ?? pay.amount.currency;
  if (pay.status !== "PAID") {
    await logEvent(env, "confirm_not_paid", orderId, pay.status);
    if (pay.status === "FAILED" || pay.status === "CANCELLED") {
      await env.DB.prepare("UPDATE orders SET status = 'failed' WHERE id = ? AND status = 'pending'").bind(orderId).run();
      return { ok: false, status: "failed", reason: pay.status };
    }
    return { ok: false, status: "pending", reason: pay.status };
  }
  if (pay.amount.total !== order.total || (currency && currency !== "KRW")) {
    // 금액 불일치 = 위변조 의심. 확정하지 않고 사장님이 보시도록 남긴다
    await logEvent(env, "amount_mismatch", orderId, { paid: pay.amount.total, expected: order.total, currency });
    await env.DB.prepare("UPDATE orders SET status = 'review', admin_note = ? WHERE id = ? AND status = 'pending'")
      .bind(`금액 불일치: 결제 ${pay.amount.total} / 주문 ${order.total} — 환불 검토 필요`, orderId).run();
    return { ok: false, status: "review", reason: "amount_mismatch" };
  }

  const res = await env.DB.prepare(
    "UPDATE orders SET status = 'paid', paid_at = ?, pg_provider = ?, receipt_url = ? WHERE id = ? AND status = 'pending'",
  ).bind(pay.paidAt ?? nowIso(), pay.channel?.pgProvider ?? null, pay.receiptUrl ?? null, orderId).run();

  if (res.meta.changes === 1) {
    const lines = JSON.parse(order.items_json) as OrderLine[];
    const summary = lines.length > 1 ? `${lines[0].name} 외 ${lines.length - 1}건` : `${lines[0].name} ${lines[0].qty}개`;
    await logEvent(env, "paid", orderId, { total: order.total });
    await notifyOwner(env, { id: orderId, name: order.name, total: order.total, summary });
  }
  return { ok: true, status: "paid" };
}
