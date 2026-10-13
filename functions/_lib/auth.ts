/**
 * 손님 로그인(선택). 비회원 주문은 그대로 된다.
 * 받는 정보는 최소한만: 서비스별 회원 식별값 · 이메일 · 이름(닉네임). 프로필 사진·성별·생일 등은 받지 않는다.
 * 세션 = HttpOnly 쿠키 lm_session (원본 토큰은 DB 에 저장하지 않고 SHA-256 만 저장)
 */
import { nowIso, type Env } from "./env";

export const SESSION_COOKIE = "lm_session";
const SESSION_DAYS = 30;

export type Provider = "kakao" | "naver" | "google";

export interface ProviderConf {
  authorize: string;
  token: string;
  profile: string;
  scope?: string;
  clientId: (env: Env) => string | undefined;
  clientSecret: (env: Env) => string | undefined;
  parse: (p: Record<string, any>) => { id: string; email?: string; name?: string };
}

export const PROVIDERS: Record<Provider, ProviderConf> = {
  kakao: {
    authorize: "https://kauth.kakao.com/oauth/authorize",
    token: "https://kauth.kakao.com/oauth/token",
    profile: "https://kapi.kakao.com/v2/user/me",
    clientId: (e) => e.KAKAO_REST_KEY,
    clientSecret: (e) => e.KAKAO_CLIENT_SECRET,
    parse: (p) => ({ id: String(p.id), email: p.kakao_account?.email, name: p.kakao_account?.profile?.nickname }),
  },
  naver: {
    authorize: "https://nid.naver.com/oauth2.0/authorize",
    token: "https://nid.naver.com/oauth2.0/token",
    profile: "https://openapi.naver.com/v1/nid/me",
    clientId: (e) => e.NAVER_CLIENT_ID,
    clientSecret: (e) => e.NAVER_CLIENT_SECRET,
    parse: (p) => ({ id: String(p.response?.id), email: p.response?.email, name: p.response?.name ?? p.response?.nickname }),
  },
  google: {
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    profile: "https://openidconnect.googleapis.com/v1/userinfo",
    scope: "openid email profile",
    clientId: (e) => e.GOOGLE_CLIENT_ID,
    clientSecret: (e) => e.GOOGLE_CLIENT_SECRET,
    parse: (p) => ({ id: String(p.sub), email: p.email, name: p.name }),
  },
};

export const isProvider = (s: string): s is Provider => s in PROVIDERS;

export function enabledProviders(env: Env): string[] {
  const list: string[] = (Object.keys(PROVIDERS) as Provider[]).filter((k) => PROVIDERS[k].clientId(env));
  if (env.EMAIL_LOGIN === "on" && env.RESEND_API_KEY && env.MAIL_FROM) list.push("email");
  return list;
}

export const randomToken = () => {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export async function sha256(s: string): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCookie(req: Request, name: string): string | null {
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

export const cookie = (name: string, value: string, maxAge: number) =>
  `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

/** 로그인 뒤 돌아갈 곳 — 우리 사이트 안의 경로만 허용(외부로 튕기는 공격 방지) */
export const safeNext = (n: string | null | undefined) => (n && /^\/(?!\/)[\w\-./?=&%]*$/.test(n) ? n : "/my/");

export async function upsertUser(env: Env, provider: string, p: { id: string; email?: string; name?: string }): Promise<string> {
  const now = nowIso();
  const hit = await env.DB.prepare("SELECT id FROM users WHERE provider = ? AND provider_id = ?").bind(provider, p.id).first<{ id: string }>();
  if (hit) {
    await env.DB.prepare("UPDATE users SET email = COALESCE(?, email), name = COALESCE(?, name), last_login_at = ? WHERE id = ?")
      .bind(p.email ?? null, p.name ?? null, now, hit.id).run();
    return hit.id;
  }
  const id = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO users (id, provider, provider_id, email, name, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, provider, p.id, p.email ?? null, p.name ?? null, now, now).run();
  return id;
}

export async function startSession(env: Env, userId: string): Promise<string> {
  const token = randomToken();
  const exp = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, nowIso(), exp).run();
  return cookie(SESSION_COOKIE, token, SESSION_DAYS * 86_400);
}

export interface SessionUser { id: string; provider: string; email: string | null; name: string | null }

export async function currentUser(req: Request, env: Env): Promise<SessionUser | null> {
  const t = getCookie(req, SESSION_COOKIE);
  if (!t) return null;
  return env.DB.prepare(
    `SELECT u.id, u.provider, u.email, u.name FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
  ).bind(await sha256(t), nowIso()).first<SessionUser>();
}

export const redirect = (to: string, cookies: string[] = []) => {
  const h = new Headers({ Location: to, "cache-control": "no-store" });
  for (const c of cookies) h.append("Set-Cookie", c);
  return new Response(null, { status: 302, headers: h });
};
