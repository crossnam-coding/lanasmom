/** 사장님께 새 주문 알림 — 어드민 페이지를 켠 폰(웹 푸시) + 메일(설정돼 있으면). 실패는 events 에 남긴다. */
import { buildPushPayload, type PushSubscription, type VapidKeys } from "@block65/webcrypto-web-push";
import { logEvent, type Env } from "./env";

export interface NoticeOrder {
  id: string;
  name: string;
  total: number;
  summary: string;
}

export async function notifyOwner(env: Env, o: NoticeOrder): Promise<{ push: number; pushFailed: number; email: boolean }> {
  const title = "새 주문이 들어왔어요";
  const body = `${o.summary} · ${o.total.toLocaleString("ko-KR")}원 · ${o.name}님`;
  const url = `/admin/?order=${encodeURIComponent(o.id)}`;
  const push = await sendPushAll(env, { title, body, url, tag: o.id });
  let email = false;
  if (env.RESEND_API_KEY && env.NOTIFY_EMAIL && env.MAIL_FROM) {
    try {
      const site = env.SITE_URL ?? "https://lanasmom.com";
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.MAIL_FROM,
          to: env.NOTIFY_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
          subject: `[라나엄마] ${title} — ${o.id}`,
          text: `${body}\n\n주문 보기: ${site}${url}`,
        }),
      });
      email = r.ok;
      if (!r.ok) await logEvent(env, "notify_email_failed", o.id, `${r.status} ${(await r.text()).slice(0, 200)}`);
    } catch (e) {
      await logEvent(env, "notify_email_failed", o.id, String(e));
    }
  }
  await logEvent(env, "notify", o.id, { ...push, email });
  return { ...push, email };
}

export async function sendPushAll(
  env: Env,
  msg: { title: string; body: string; url: string; tag?: string },
): Promise<{ push: number; pushFailed: number }> {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return { push: 0, pushFailed: 0 };
  const vapid: VapidKeys = {
    subject: env.VAPID_SUBJECT ?? "mailto:hello@lanasmom.com",
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  };
  const { results } = await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions").all<{
    endpoint: string; p256dh: string; auth: string;
  }>();
  let ok = 0, failed = 0;
  for (const s of results ?? []) {
    const sub: PushSubscription = { endpoint: s.endpoint, expirationTime: null, keys: { p256dh: s.p256dh, auth: s.auth } };
    try {
      const payload = await buildPushPayload({ data: JSON.stringify(msg), options: { ttl: 60 * 60 * 24, urgency: "high" } }, sub, vapid);
      const r = await fetch(s.endpoint, payload);
      if (r.ok) ok++;
      else {
        failed++;
        // 404·410 = 구독이 사라짐(앱 삭제·권한 해제) → 정리
        if (r.status === 404 || r.status === 410) {
          await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(s.endpoint).run();
        }
        await logEvent(env, "push_failed", msg.tag ?? null, `${r.status} ${new URL(s.endpoint).host}`);
      }
    } catch (e) {
      failed++;
      await logEvent(env, "push_failed", msg.tag ?? null, String(e));
    }
  }
  return { push: ok, pushFailed: failed };
}
