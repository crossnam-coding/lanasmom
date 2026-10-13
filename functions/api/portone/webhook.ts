import { json, logEvent, type Env } from "../../_lib/env";
import { verifyWebhook } from "../../_lib/portone";
import { confirmPayment } from "../../_lib/orders";

/** 포트원 웹훅 — 브라우저가 중간에 닫혀도 결제가 확정되게 하는 안전망. 서명이 맞아야만 처리 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const raw = await request.text();
  const ok = await verifyWebhook(env, raw, {
    id: request.headers.get("webhook-id"),
    ts: request.headers.get("webhook-timestamp"),
    sig: request.headers.get("webhook-signature"),
  });
  if (!ok) {
    await logEvent(env, "webhook_bad_signature", null, raw.slice(0, 200));
    return json({ error: "invalid signature" }, 401);
  }
  const evt = JSON.parse(raw) as { type?: string; data?: { paymentId?: string } };
  const paymentId = evt.data?.paymentId;
  if (!paymentId || !evt.type?.startsWith("Transaction.")) return json({ ok: true, ignored: true });
  try {
    const r = await confirmPayment(env, paymentId);
    await logEvent(env, "webhook", paymentId, { type: evt.type, ...r });
    return json({ ok: true });
  } catch (e) {
    await logEvent(env, "webhook_error", paymentId, String(e));
    return json({ error: "retry" }, 500); // 포트원이 다시 보낸다
  }
};
