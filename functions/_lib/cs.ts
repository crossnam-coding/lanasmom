import { nowIso, logEvent, type Env } from "./env";

export const KINDS: Record<string, string> = {
  order: "주문", delivery: "배송", refund: "취소·환불", product: "상품", etc: "기타",
};

export interface Inquiry {
  id: string; access_key: string; order_id: string | null; name: string; email: string | null; phone: string | null;
  kind: string; status: string; created_at: string; updated_at: string;
}

export const getInquiry = (env: Env, id: string) => env.DB.prepare("SELECT * FROM inquiries WHERE id = ?").bind(id).first<Inquiry>();

export async function thread(env: Env, id: string) {
  const { results } = await env.DB.prepare("SELECT sender, body, at FROM inquiry_messages WHERE inquiry_id = ? ORDER BY id").bind(id).all<{ sender: string; body: string; at: string }>();
  return results ?? [];
}

export async function addMessage(env: Env, id: string, sender: "customer" | "admin", body: string, status: string) {
  const now = nowIso();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO inquiry_messages (inquiry_id, sender, body, at) VALUES (?, ?, ?, ?)").bind(id, sender, body, now),
    env.DB.prepare("UPDATE inquiries SET status = ?, updated_at = ? WHERE id = ?").bind(status, now, id),
  ]);
}

/** 손님께 답장 알림 메일 (메일 설정이 있을 때만). 본문엔 답장 내용 대신 확인 링크만 — 메일로 개인정보가 덜 돌게 */
export async function mailCustomer(env: Env, inq: Inquiry) {
  if (!inq.email || !env.RESEND_API_KEY || !env.MAIL_FROM) return false;
  const site = env.SITE_URL ?? "https://lanasmom.com";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [inq.email],
      subject: "[라나엄마] 문의하신 내용에 답변을 드렸어요",
      text: `${inq.name}님, 남겨 주신 문의에 답변을 드렸어요.\n아래 링크에서 확인하실 수 있어요.\n\n${site}/inquiry/?id=${inq.id}&key=${inq.access_key}\n\n라나엄마 드림`,
    }),
  });
  if (!r.ok) await logEvent(env, "cs_mail_failed", inq.order_id, `${r.status}`);
  return r.ok;
}
