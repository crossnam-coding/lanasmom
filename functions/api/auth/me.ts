import { json, type Env } from "../../_lib/env";
import { currentUser, enabledProviders } from "../../_lib/auth";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) =>
  json({ user: await currentUser(request, env), providers: enabledProviders(env) });
