/**
 * 환불 = 포트원 결제 취소. 돈이 나가는 곳이라 이중으로 막는다.
 *  ① 금액: 1원 이상, (결제 금액 − 이미 환불한 금액) 이하
 *  ② 포트원에 currentCancellableAmount 를 같이 보내 → 우리 장부와 포트원 잔액이 다르면 포트원이 거절
 *  ③ 사유 필수 · 누가 했는지 기록 · 실패도 기록
 */
import { logEvent, nowIso, type Env } from "./env";
import { getOrder } from "./orders";

const API_BASE = "https://api.portone.io";

export async function refundOrder(env: Env, orderId: string, amount: number, reason: string, by: string) {
  const o = await getOrder(env, orderId);
  if (!o) return { ok: false, error: "주문을 찾을 수 없어요." };
  if (!["paid", "preparing", "shipped", "review"].includes(o.status)) return { ok: false, error: "결제된 주문만 환불할 수 있어요." };
  const left = o.total - (o.refunded ?? 0);
  if (!Number.isInteger(amount) || amount < 1 || amount > left) return { ok: false, error: `환불 금액은 1원 ~ ${left.toLocaleString("ko-KR")}원 사이여야 해요.` };
  if (!reason.trim()) return { ok: false, error: "환불 사유를 적어 주세요." };
  if (!env.PORTONE_API_SECRET) return { ok: false, error: "결제 키가 아직 설정되지 않았어요." };

  const base = env.PORTONE_API_BASE && /^http:\/\/(localhost|127\.0\.0\.1):/.test(env.PORTONE_API_BASE) ? env.PORTONE_API_BASE : API_BASE;
  const r = await fetch(`${base}/payments/${encodeURIComponent(orderId)}/cancel`, {
    method: "POST",
    headers: { Authorization: `PortOne ${env.PORTONE_API_SECRET}`, "content-type": "application/json" },
    body: JSON.stringify({ amount, reason: reason.slice(0, 200), requester: "ADMIN", currentCancellableAmount: left }),
  });
  const d = (await r.json().catch(() => ({}))) as { cancellation?: { status?: string; id?: string; totalAmount?: number }; message?: string; type?: string };
  const status = r.ok ? (d.cancellation?.status === "SUCCEEDED" ? "succeeded" : "requested") : "failed";
  await env.DB.prepare("INSERT INTO refunds (order_id, amount, reason, status, portone_id, by_email, at, detail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(orderId, amount, reason, status, d.cancellation?.id ?? null, by, nowIso(), r.ok ? null : `${r.status} ${d.type ?? ""} ${d.message ?? ""}`.slice(0, 300)).run();
  if (!r.ok) {
    await logEvent(env, "refund_failed", orderId, { status: r.status, type: d.type, message: d.message });
    return { ok: false, error: `환불이 거절됐어요: ${d.message ?? r.status}` };
  }
  const refunded = (o.refunded ?? 0) + amount;
  // 전액이면 "refunded", 일부면 지금 상태(새 주문·만드는 중·보냄)를 그대로 둔다 — 환불 금액은 refunded 칸에 쌓인다
  const newStatus = refunded >= o.total ? "refunded" : o.status;
  // 상태가 바뀌지 않았을 때만(동시 클릭 방지) 반영
  await env.DB.prepare("UPDATE orders SET refunded = ?, status = ? WHERE id = ? AND refunded = ?").bind(refunded, newStatus, orderId, o.refunded ?? 0).run();
  await logEvent(env, "refund", orderId, { amount, by, status });
  return { ok: true, refunded, status: newStatus, cancellation: status };
}
