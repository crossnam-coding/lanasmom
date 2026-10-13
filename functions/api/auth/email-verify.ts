import { nowIso, type Env } from "../../_lib/env";
import { redirect, safeNext, sha256, startSession, upsertUser } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const t = new URL(request.url).searchParams.get("t") ?? "";
  const h = await sha256(t);
  const row = await env.DB.prepare("SELECT email, next FROM email_tokens WHERE token_hash = ? AND expires_at > ?")
    .bind(h, nowIso()).first<{ email: string; next: string | null }>();
  await env.DB.prepare("DELETE FROM email_tokens WHERE token_hash = ? OR expires_at < ?").bind(h, nowIso()).run(); // 한 번 쓰면 끝
  if (!row) return redirect("/login/?error=expired");
  const userId = await upsertUser(env, "email", { id: row.email, email: row.email });
  return redirect(safeNext(row.next), [await startSession(env, userId)]);
};
