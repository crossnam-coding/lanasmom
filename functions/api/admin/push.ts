import { json, logEvent, nowIso, type Env } from "../../_lib/env";
import { sendPushAll } from "../../_lib/notify";

/** 알림 켜기: 브라우저 구독 정보를 저장 · 끄기 · 시험 알림 · 공개키 조회 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM push_subscriptions").first<{ n: number }>();
  return json({ publicKey: env.VAPID_PUBLIC_KEY ?? null, devices: n?.n ?? 0 });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const b = (await request.json().catch(() => ({}))) as {
    action?: string; label?: string;
    subscription?: { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  };
  if (b.action === "test") {
    const r = await sendPushAll(env, { title: "알림이 잘 와요", body: "새 주문이 들어오면 이렇게 알려드릴게요.", url: "/admin/", tag: "test" });
    await logEvent(env, "push_test", null, r);
    return json(r);
  }
  const s = b.subscription;
  if (!s?.endpoint?.startsWith("https://") || !s.keys?.p256dh || !s.keys?.auth) return json({ error: "구독 정보가 이상해요." }, 400);
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, label, created_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth, label = excluded.label`,
  ).bind(s.endpoint, s.keys.p256dh, s.keys.auth, (b.label ?? "").slice(0, 60) || null, nowIso()).run();
  return json({ ok: true });
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  const b = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (b.endpoint) await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(b.endpoint).run();
  return json({ ok: true });
};
