import { json, type Env } from "../../../_lib/env";
import { KINDS, addMessage, getInquiry, thread } from "../../../_lib/cs";
import { sendPushAll } from "../../../_lib/notify";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const q = await getInquiry(env, String(params.id));
  if (!q || q.access_key !== new URL(request.url).searchParams.get("key")) return json({ error: "문의를 찾을 수 없어요." }, 404);
  return json({ id: q.id, kind: KINDS[q.kind] ?? q.kind, status: q.status, orderId: q.order_id, name: q.name, messages: await thread(env, q.id) });
};

/** 손님 추가 메시지 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const b = (await request.json().catch(() => ({}))) as { key?: string; body?: string };
  const q = await getInquiry(env, String(params.id));
  if (!q || q.access_key !== b.key) return json({ error: "문의를 찾을 수 없어요." }, 404);
  const body = String(b.body ?? "").trim().slice(0, 2000);
  if (!body) return json({ error: "내용을 적어 주세요." }, 400);
  await addMessage(env, q.id, "customer", body, "open");
  await sendPushAll(env, { title: "문의에 손님 답글", body: body.slice(0, 60), url: `/admin/cs/?id=${q.id}`, tag: q.id });
  return json({ ok: true });
};
