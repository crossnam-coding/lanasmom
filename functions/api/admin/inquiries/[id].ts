import { json, logEvent, type Env } from "../../../_lib/env";
import { KINDS, addMessage, getInquiry, mailCustomer, thread } from "../../../_lib/cs";
import { getOrder } from "../../../_lib/orders";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const q = await getInquiry(env, String(params.id));
  if (!q) return json({ error: "문의를 찾을 수 없어요." }, 404);
  const o = q.order_id ? await getOrder(env, q.order_id) : null;
  const site = env.SITE_URL ?? new URL(request.url).origin;
  const { access_key, ...rest } = q;
  return json({
    inquiry: { ...rest, kindLabel: KINDS[q.kind] ?? q.kind, link: `${site}/inquiry/?id=${q.id}&key=${access_key}` },
    messages: await thread(env, q.id),
    order: o ? (({ access_key: _k, items_json, ...x }) => ({ ...x, items: JSON.parse(items_json) }))(o) : null,
  });
};

/** 답장 / 닫기 / 다시 열기 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params, data }) => {
  const q = await getInquiry(env, String(params.id));
  if (!q) return json({ error: "문의를 찾을 수 없어요." }, 404);
  const b = (await request.json().catch(() => ({}))) as { action?: string; body?: string };
  if (b.action === "reply") {
    const body = String(b.body ?? "").trim().slice(0, 4000);
    if (!body) return json({ error: "답장 내용을 적어 주세요." }, 400);
    await addMessage(env, q.id, "admin", body, "answered");
    const mailed = await mailCustomer(env, q);
    await logEvent(env, "cs_reply", q.order_id, { id: q.id, by: (data as Record<string, unknown>).adminEmail, mailed });
    return json({ ok: true, mailed, phone: q.phone });
  }
  if (b.action === "close" || b.action === "reopen") {
    await env.DB.prepare("UPDATE inquiries SET status = ? WHERE id = ?").bind(b.action === "close" ? "closed" : "open", q.id).run();
    return json({ ok: true });
  }
  return json({ error: "알 수 없는 요청" }, 400);
};
