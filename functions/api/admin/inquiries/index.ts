import { json, type Env } from "../../../_lib/env";
import { KINDS, type Inquiry } from "../../../_lib/cs";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const status = new URL(request.url).searchParams.get("status") ?? "open";
  const { results } = await env.DB.prepare(
    `SELECT i.*, (SELECT body FROM inquiry_messages m WHERE m.inquiry_id = i.id ORDER BY id DESC LIMIT 1) AS last_body,
            (SELECT sender FROM inquiry_messages m WHERE m.inquiry_id = i.id ORDER BY id DESC LIMIT 1) AS last_sender
     FROM inquiries i WHERE (? = 'all' OR i.status = ?) ORDER BY i.updated_at DESC LIMIT 200`,
  ).bind(status, status).all<Inquiry & { last_body: string; last_sender: string }>();
  const counts = await env.DB.prepare("SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status").all<{ status: string; n: number }>();
  return json({
    inquiries: (results ?? []).map(({ access_key: _k, ...q }) => ({ ...q, kindLabel: KINDS[q.kind] ?? q.kind })),
    counts: Object.fromEntries((counts.results ?? []).map((c) => [c.status, c.n])),
  });
};
