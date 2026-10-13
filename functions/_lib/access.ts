/**
 * 어드민 인증 = Cloudflare Access(무료) 가 /admin · /api/admin 앞에서 이메일 일회용 코드로 막는다.
 * 여기서는 Access 가 붙여 준 JWT 를 한 번 더 검증한다(서명·aud·만료·허용 이메일).
 * Access 설정이 빠져도 이 검사에서 막히게 — 헤더만 믿지 않는다.
 */
import type { Env } from "./env";

let jwksCache: { at: number; keys: JsonWebKey[] } | null = null;

async function jwks(team: string): Promise<JsonWebKey[]> {
  if (jwksCache && Date.now() - jwksCache.at < 60 * 60 * 1000) return jwksCache.keys;
  const r = await fetch(`https://${team}.cloudflareaccess.com/cdn-cgi/access/certs`);
  if (!r.ok) throw new Error(`access certs ${r.status}`);
  const { keys } = (await r.json()) as { keys: JsonWebKey[] };
  jwksCache = { at: Date.now(), keys };
  return keys;
}

const b64urlBytes = (s: string) =>
  Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

export async function adminEmail(request: Request, env: Env): Promise<string | null> {
  if (env.ADMIN_DEV_BYPASS === "1" && new URL(request.url).hostname === "localhost") return "dev@localhost";
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM || !env.ACCESS_AUD || !env.ADMIN_EMAILS) return null;
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;
  try {
    const header = JSON.parse(new TextDecoder().decode(b64urlBytes(h))) as { kid?: string; alg?: string };
    if (header.alg !== "RS256") return null;
    const jwk = (await jwks(env.ACCESS_TEAM)).find((k) => (k as { kid?: string }).kid === header.kid);
    if (!jwk) return null;
    const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64urlBytes(s), new TextEncoder().encode(`${h}.${p}`));
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64urlBytes(p))) as { aud?: string | string[]; exp?: number; email?: string };
    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(env.ACCESS_AUD)) return null;
    if (!claims.exp || claims.exp * 1000 < Date.now()) return null;
    const allowed = env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase());
    const email = (claims.email ?? "").toLowerCase();
    return allowed.includes(email) ? email : null;
  } catch {
    return null;
  }
}
