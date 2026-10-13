import { json, logEvent, type Env } from "../../_lib/env";
import { enabledProviders, randomToken, safeNext, sha256 } from "../../_lib/auth";

/** 이메일 로그인 — 비밀번호 없이, 15분짜리 로그인 링크를 메일로 보낸다 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!enabledProviders(env).includes("email")) return json({ error: "이메일 로그인은 준비 중이에요." }, 503);
  const b = (await request.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = (b.email ?? "").trim().toLowerCase().slice(0, 100);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "이메일 주소를 확인해 주세요." }, 400);

  // 같은 주소로 10분에 3번까지만 (메일 폭탄 방지)
  const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM email_tokens WHERE email = ? AND expires_at > ?")
    .bind(email, new Date(Date.now() + 5 * 60_000).toISOString()).first<{ n: number }>();
  if ((recent?.n ?? 0) >= 3) return json({ error: "잠시 뒤에 다시 시도해 주세요." }, 429);

  const token = randomToken();
  await env.DB.prepare("INSERT INTO email_tokens (token_hash, email, next, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), email, safeNext(b.next), new Date(Date.now() + 15 * 60_000).toISOString()).run();
  const link = `${new URL(request.url).origin}/api/auth/email-verify?t=${token}`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [email],
      subject: "[라나엄마] 로그인 링크",
      text: `아래 링크를 누르면 로그인됩니다. 15분 동안만 쓸 수 있어요.\n\n${link}\n\n직접 요청하지 않으셨다면 이 메일은 무시하셔도 됩니다.`,
    }),
  });
  if (!r.ok) {
    await logEvent(env, "email_login_send_failed", null, `${r.status}`);
    return json({ error: "메일을 보내지 못했어요. 잠시 뒤 다시 시도해 주세요." }, 502);
  }
  return json({ ok: true });
};
