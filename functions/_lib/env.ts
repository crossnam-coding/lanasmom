/** Cloudflare Pages Functions 환경 — 값은 대시보드(프로덕션) 또는 .dev.vars(로컬)에 둔다. 코드에 비밀값 금지. */
export interface Env {
  DB: D1Database;
  /** "on" 이 아니면 주문·결제 API 는 닫혀 있다 */
  CHECKOUT_ENABLED?: string;
  PORTONE_STORE_ID?: string;
  PORTONE_CHANNEL_KEY?: string;
  PORTONE_API_SECRET?: string;
  PORTONE_WEBHOOK_SECRET?: string;
  /** 로컬 시험 전용 — http://localhost:… 일 때만 쓰인다 */
  PORTONE_API_BASE?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
  /** 어드민 허용 이메일(쉼표 구분) — Cloudflare Access 로그인 이메일과 대조 */
  ADMIN_EMAILS?: string;
  /** Cloudflare Access 팀 도메인 앞부분 (예: lanasmom → lanasmom.cloudflareaccess.com) */
  ACCESS_TEAM?: string;
  /** Cloudflare Access 애플리케이션 AUD 태그 */
  ACCESS_AUD?: string;
  /** 주문 알림 메일 (선택) */
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  MAIL_FROM?: string;
  SITE_URL?: string;
  /** 로그인 — 값이 있는 것만 로그인 화면에 버튼이 뜬다 */
  KAKAO_REST_KEY?: string;
  KAKAO_CLIENT_SECRET?: string;
  NAVER_CLIENT_ID?: string;
  NAVER_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  /** 이메일 로그인 = 로그인 링크 메일 (Resend). RESEND_API_KEY·MAIL_FROM 과 같이 있어야 켜진다 */
  EMAIL_LOGIN?: string;
  /** 로컬 개발에서만 "1" — 어드민 인증을 건너뛴다. 프로덕션에 절대 넣지 않는다 */
  ADMIN_DEV_BYPASS?: string;
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const nowIso = () => new Date().toISOString();

export async function logEvent(env: Env, kind: string, orderId: string | null, detail: unknown) {
  try {
    await env.DB.prepare("INSERT INTO events (at, kind, order_id, detail) VALUES (?, ?, ?, ?)")
      .bind(nowIso(), kind, orderId, typeof detail === "string" ? detail : JSON.stringify(detail))
      .run();
  } catch (e) {
    console.error("logEvent failed", kind, orderId, e);
  }
}
