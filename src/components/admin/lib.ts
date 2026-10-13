"use client";
export const won = (n: number | null | undefined) => (n === null || n === undefined ? "—" : `${Math.round(n).toLocaleString("ko-KR")}원`);
export const kst = (iso: string | null | undefined, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}) })
    : "";
export const ymdLabel = (ymd: string) => {
  const d = new Date(`${ymd}T00:00:00+09:00`);
  return `${d.getMonth() + 1}/${d.getDate()}(${"일월화수목금토"[d.getDay()]})`;
};

export class AuthError extends Error {}

export async function api<T = any>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const r = await fetch(path, {
    cache: "no-store",
    ...init,
    headers: { ...(init?.json !== undefined ? { "content-type": "application/json" } : {}), ...(init?.headers ?? {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  if (r.status === 401) throw new AuthError("로그인이 풀렸어요. 화면을 새로고침해서 다시 로그인해 주세요.");
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? `오류 (${r.status})`);
  return d as T;
}

export const STATUS_LABEL: Record<string, string> = {
  paid: "새 주문", preparing: "만드는 중", shipped: "보냄", cancelled: "취소", review: "확인 필요",
  pending: "결제 전", failed: "결제 실패", refunded: "전액 환불"
};
export const STATUS_COLOR: Record<string, string> = {
  paid: "bg-[var(--terra)] text-white", preparing: "bg-[#5e9e97] text-white", shipped: "bg-[#e9e2d6] text-[var(--ink)]",
  review: "bg-red-600 text-white", cancelled: "bg-[#e9e2d6] text-[var(--ink-soft)]", refunded: "bg-[#e9e2d6] text-[var(--ink-soft)]",
};

export const CARRIER_TRACK: Record<string, { name: string; track: string }> = {
  lotte: { name: "롯데택배", track: "https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=" },
  cj: { name: "CJ대한통운", track: "https://trace.cjlogistics.com/next/tracking.html?wblNo=" },
  epost: { name: "우체국택배", track: "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=" },
  hanjin: { name: "한진택배", track: "https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=" },
  logen: { name: "로젠택배", track: "https://www.logen.co.kr/ajax/tracking/tracking_result.do?slipno=" },
};
export const trackUrl = (carrier: string | null, no: string | null) =>
  no ? `${(CARRIER_TRACK[carrier ?? "lotte"] ?? CARRIER_TRACK.lotte).track}${encodeURIComponent(no.replace(/[^0-9]/g, ""))}` : null;
