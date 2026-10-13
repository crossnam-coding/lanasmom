/**
 * PortOne V2 — 결제 확인은 반드시 서버에서 포트원 API 로 다시 조회한다.
 * 흐름: 주문 생성(pending) → 브라우저 결제창 → /complete 또는 웹훅 → 포트원 조회 → 금액 대조 → paid
 * (마스터링 PRO src/lib/portone.ts 의 검증된 흐름을 Workers 의 WebCrypto 로 옮김)
 */
import type { Env } from "./env";

const API_BASE = "https://api.portone.io";
/** 로컬 시험에서만 가짜 포트원 서버로 돌린다 (localhost 주소만 허용) */
const base = (env: Env) =>
  env.PORTONE_API_BASE && /^http:\/\/(localhost|127\.0\.0\.1):/.test(env.PORTONE_API_BASE) ? env.PORTONE_API_BASE : API_BASE;

export interface PortOnePayment {
  id: string;
  status: "READY" | "PENDING" | "VIRTUAL_ACCOUNT_ISSUED" | "PAID" | "FAILED" | "PARTIAL_CANCELLED" | "CANCELLED";
  amount: { total: number; currency?: string };
  currency?: string;
  paidAt?: string;
  receiptUrl?: string;
  channel?: { pgProvider?: string; name?: string };
}

export async function fetchPayment(env: Env, paymentId: string): Promise<PortOnePayment> {
  if (!env.PORTONE_API_SECRET) throw new Error("PORTONE_API_SECRET 없음");
  const r = await fetch(`${base(env)}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${env.PORTONE_API_SECRET}`, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`portone ${r.status}: ${(await r.text().catch(() => "")).slice(0, 200)}`);
  return (await r.json()) as PortOnePayment;
}

/** Standard Webhooks: HMAC-SHA256(secret, `${id}.${ts}.${body}`) base64, 헤더 "v1,<sig> v1,<sig2>" */
export async function verifyWebhook(
  env: Env,
  rawBody: string,
  h: { id: string | null; ts: string | null; sig: string | null },
): Promise<boolean> {
  const secret = env.PORTONE_WEBHOOK_SECRET;
  if (!secret || !h.id || !h.ts || !h.sig) return false;
  const tsMs = Number(h.ts) * 1000;
  if (!Number.isFinite(tsMs) || Math.abs(Date.now() - tsMs) > 5 * 60_000) return false;
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  } catch {
    return false;
  }
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${h.id}.${h.ts}.${rawBody}`));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return h.sig.split(" ").some((c) => {
    const sig = c.split(",")[1];
    return !!sig && timingSafeEqual(sig, expected);
  });
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
