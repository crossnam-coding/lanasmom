import { json, type Env } from "../../_lib/env";

/** 최근 기록 — 알림 실패·결제 확인 오류를 사장님/오빠가 볼 수 있게 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM events ORDER BY id DESC LIMIT 100").all();
  return json({ events: results ?? [] });
};
