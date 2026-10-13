import { json, logEvent, nowIso, type Env } from "../../_lib/env";
import { orderName, priceOrder } from "../../_lib/catalog";
import { currentUser } from "../../_lib/auth";

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function newOrderId(): string {
  const d = new Date(Date.now() + 9 * 3600_000); // KST 날짜
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = crypto.getRandomValues(new Uint8Array(6));
  return `LM-${ymd}-${Array.from(r, (b) => abc[b % abc.length]).join("")}`;
}

/** 주문서 제출 → 가격을 서버에서 다시 계산해 pending 주문을 만든다. 결제창은 그다음 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (env.CHECKOUT_ENABLED !== "on") return json({ error: "지금은 홈페이지 주문을 받지 않아요." }, 503);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: "잘못된 요청이에요." }, 400);
  }
  const priced = priceOrder(body.items);
  if (!priced.ok) return json({ error: priced.error }, 400);

  const name = str(body.name, 30);
  const phone = str(body.phone, 20).replace(/[^0-9]/g, "");
  const email = str(body.email, 100);
  const zipcode = str(body.zipcode, 10);
  const address1 = str(body.address1, 200);
  const address2 = str(body.address2, 100);
  const memo = str(body.memo, 200);
  if (!name) return json({ error: "받는 분 이름을 적어 주세요." }, 400);
  if (!/^01[016789][0-9]{7,8}$/.test(phone)) return json({ error: "휴대폰 번호를 확인해 주세요." }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "이메일 주소를 확인해 주세요." }, 400);
  if (!/^[0-9]{5}$/.test(zipcode) || !address1) return json({ error: "주소를 검색해서 넣어 주세요." }, 400);
  if (body.agree !== true) return json({ error: "개인정보 수집·이용에 동의해 주셔야 주문할 수 있어요." }, 400);

  const user = await currentUser(request, env); // 로그인했으면 내 주문에 묶는다(선택)
  const id = newOrderId();
  const accessKey = crypto.randomUUID();
  const now = nowIso();
  await env.DB.prepare(
    `INSERT INTO orders (id, access_key, created_at, status, name, phone, email, zipcode, address1, address2, memo,
       items_json, subtotal, shipping, total, agree_at, user_id)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(id, accessKey, now, name, phone, email || null, zipcode, address1, address2 || null, memo || null,
    JSON.stringify(priced.lines), priced.subtotal, priced.shipping, priced.total, now, user?.id ?? null).run();
  await logEvent(env, "order_created", id, { total: priced.total });

  return json({
    orderId: id,
    key: accessKey,
    orderName: orderName(priced.lines),
    total: priced.total,
    lines: priced.lines,
    subtotal: priced.subtotal,
    shipping: priced.shipping,
  });
};
