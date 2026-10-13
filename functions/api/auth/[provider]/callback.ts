import { logEvent, type Env } from "../../../_lib/env";
import { PROVIDERS, cookie, getCookie, isProvider, redirect, safeNext, startSession, upsertUser } from "../../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const prov = String(params.provider);
  if (!isProvider(prov)) return new Response("없는 로그인 방식", { status: 404 });
  const c = PROVIDERS[prov];
  const url = new URL(request.url);
  const [state, nextRaw] = (getCookie(request, "lm_oauth") ?? "").split("|");
  const clear = cookie("lm_oauth", "", 0);
  if (!state || url.searchParams.get("state") !== state) return redirect("/login/?error=state", [clear]);
  const code = url.searchParams.get("code");
  if (!code) return redirect("/login/?error=cancelled", [clear]);

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: c.clientId(env) ?? "",
      redirect_uri: `${url.origin}/api/auth/${prov}/callback`,
      code,
      state,
    });
    const secret = c.clientSecret(env);
    if (secret) body.set("client_secret", secret);
    const tr = await fetch(c.token, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" }, body });
    const tok = (await tr.json()) as { access_token?: string; error?: string };
    if (!tok.access_token) throw new Error(`token ${tr.status} ${tok.error ?? ""}`);
    const pr = await fetch(c.profile, { headers: { Authorization: `Bearer ${tok.access_token}` } });
    if (!pr.ok) throw new Error(`profile ${pr.status}`);
    const p = c.parse((await pr.json()) as Record<string, unknown>);
    if (!p.id || p.id === "undefined") throw new Error("no id");
    const userId = await upsertUser(env, prov, p);
    return redirect(safeNext(nextRaw), [clear, await startSession(env, userId)]);
  } catch (e) {
    await logEvent(env, "login_failed", null, `${prov}: ${String(e).slice(0, 200)}`);
    return redirect("/login/?error=failed", [clear]);
  }
};
