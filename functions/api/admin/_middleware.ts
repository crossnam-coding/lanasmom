import { json, type Env } from "../../_lib/env";
import { adminEmail } from "../../_lib/access";

/** /api/admin/* 전부 — Cloudflare Access JWT 를 검증한 사람만 */
export const onRequest: PagesFunction<Env> = async ({ request, env, next, data }) => {
  const email = await adminEmail(request, env);
  if (!email) return json({ error: "로그인이 필요해요." }, 401);
  (data as Record<string, unknown>).adminEmail = email;
  return next();
};
