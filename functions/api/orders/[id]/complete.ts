import { json, logEvent, type Env } from "../../../_lib/env";
import { confirmPayment, getOrder } from "../../../_lib/orders";

/** 결제창이 끝나면 브라우저가 부른다. 확정 여부는 포트원 재조회로만 판단 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = String(params.id);
  let key = "";
  try {
    key = String(((await request.json()) as { key?: string }).key ?? "");
  } catch { /* 빈 본문 */ }
  const o = await getOrder(env, id);
  if (!o || key !== o.access_key) return json({ error: "주문을 찾을 수 없어요." }, 404);
  try {
    return json(await confirmPayment(env, id));
  } catch (e) {
    await logEvent(env, "confirm_error", id, String(e));
    return json({ ok: false, status: o.status, reason: "확인 중 오류 — 잠시 뒤 자동으로 다시 확인됩니다" }, 502);
  }
};
