import { type Env } from "../../../_lib/env";
import { PROVIDERS, cookie, isProvider, randomToken, redirect, safeNext } from "../../../_lib/auth";

/** 로그인 시작 → 카카오·네이버·구글 동의 화면으로 보낸다. state 로 위조 요청을 막는다 */
export const onRequestGet: PagesFunction<Env> = ({ request, env, params }) => {
  const prov = String(params.provider);
  if (!isProvider(prov)) return new Response("없는 로그인 방식", { status: 404 });
  const c = PROVIDERS[prov];
  const clientId = c.clientId(env);
  if (!clientId) return redirect("/login/?error=not_ready");
  const url = new URL(request.url);
  const state = randomToken();
  const next = safeNext(url.searchParams.get("next"));
  const q = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: `${url.origin}/api/auth/${prov}/callback`,
    state,
  });
  if (c.scope) q.set("scope", c.scope);
  return redirect(`${c.authorize}?${q}`, [cookie("lm_oauth", `${state}|${next}`, 600)]);
};
