import { json, logEvent, nowIso, type Env } from "../../_lib/env";
import { KINDS } from "../../_lib/cs";
import { getOrder } from "../../_lib/orders";
import { sendPushAll } from "../../_lib/notify";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** 손님 문의 남기기 (주문 문의 · 일반 문의) */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (str(b.website, 100)) return json({ ok: true }); // 봇 함정 칸
  const name = str(b.name, 30), email = str(b.email, 100), phone = str(b.phone, 20).replace(/[^0-9]/g, "");
  const message = str(b.message, 2000), kind = str(b.kind, 20) in KINDS ? str(b.kind, 20) : "etc";
  if (!name || !message) return json({ error: "이름과 문의 내용을 적어 주세요." }, 400);
  if (!email && !phone) return json({ error: "답변 받으실 이메일이나 휴대폰 번호를 적어 주세요." }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "이메일 주소를 확인해 주세요." }, 400);
  if (b.agree !== true) return json({ error: "개인정보 수집·이용에 동의해 주셔야 문의를 남길 수 있어요." }, 400);

  let orderId: string | null = null;
  if (b.orderId) {
    const o = await getOrder(env, str(b.orderId, 40));
    if (!o || o.access_key !== str(b.orderKey, 80)) return json({ error: "주문을 확인할 수 없어요." }, 400);
    orderId = o.id;
  }
  const id = `Q-${Date.now().toString(36).toUpperCase()}-${crypto.getRandomValues(new Uint8Array(2)).join("")}`;
  const key = crypto.randomUUID(), now = nowIso();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO inquiries (id, access_key, order_id, name, email, phone, kind, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)")
      .bind(id, key, orderId, name, email || null, phone || null, kind, now, now),
    env.DB.prepare("INSERT INTO inquiry_messages (inquiry_id, sender, body, at) VALUES (?, 'customer', ?, ?)").bind(id, message, now),
  ]);
  await logEvent(env, "cs_new", orderId, { id, kind });
  await sendPushAll(env, { title: `새 문의 · ${KINDS[kind]}`, body: message.slice(0, 60), url: `/admin/cs/?id=${id}`, tag: id });
  return json({ id, key });
};
