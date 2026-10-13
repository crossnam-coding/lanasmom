/**
 * 개인정보 보관 기한 지키기 — 개인정보처리방침 §2 와 짝.
 *  - 결제 안 된 주문(pending·failed): 7일 뒤 삭제 (결제를 안 했으니 보관할 근거가 없다)
 *  - 모든 주문: 5년 뒤 삭제 (전자상거래법 보관기간 — 게시 전 법령 원문 재확인)
 *  - 기록(events): 1년 뒤 삭제
 * Pages Functions 엔 크론이 없어서, 어드민을 열 때 하루 한 번 돈다.
 */
import { logEvent, type Env } from "./env";

const DAY = 86_400_000;

export async function enforceRetention(env: Env): Promise<void> {
  const last = await env.DB.prepare("SELECT at FROM events WHERE kind = 'retention' ORDER BY id DESC LIMIT 1").first<{ at: string }>();
  if (last && Date.now() - Date.parse(last.at) < DAY) return;
  const iso = (ms: number) => new Date(Date.now() - ms).toISOString();
  const unpaid = await env.DB.prepare("DELETE FROM orders WHERE status IN ('pending','failed') AND created_at < ?").bind(iso(7 * DAY)).run();
  const old = await env.DB.prepare("DELETE FROM orders WHERE created_at < ?").bind(iso(5 * 365 * DAY)).run();
  await env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(iso(0)).run();
  await env.DB.prepare("DELETE FROM email_tokens WHERE expires_at < ?").bind(iso(0)).run();
  const ev = await env.DB.prepare("DELETE FROM events WHERE at < ?").bind(iso(365 * DAY)).run();
  await logEvent(env, "retention", null, { unpaid: unpaid.meta.changes, old: old.meta.changes, events: ev.meta.changes });
}
