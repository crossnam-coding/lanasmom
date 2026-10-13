import { json, type Env } from "../../_lib/env";
import { SESSION_COOKIE, cookie, getCookie, sha256 } from "../../_lib/auth";

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const t = getCookie(request, SESSION_COOKIE);
  if (t) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(t)).run();
  return json({ ok: true }, 200, { "Set-Cookie": cookie(SESSION_COOKIE, "", 0) });
};
