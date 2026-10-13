/**
 * 사장님 설정 — 어드민 「설정」 화면에서 바꾼다. 기본값은 모르는 것은 비워 둔다(지어내지 않음).
 */
import type { Env } from "./env";

export interface Settings {
  /** 결제 수수료율(%) — PG 계약 뒤 실제 값으로. 비어 있으면 수익 계산에서 "미입력"으로 표시 */
  pgFeePct: number | null;
  /** 택배 1박스 원가(원) — 미팅 메모: 롯데 건당 2,600원(재확인 필요) */
  courierCost: number | null;
  /** 포장재(아이스박스·아이스팩) 1박스 원가(원) */
  packCost: number | null;
  /** 이 시각(KST, 0~23) 전에 결제되면 당일 발송 — 비어 있으면 다음 발송일 */
  cutoffHour: number | null;
  /** 발송하는 요일 (0=일 … 6=토) */
  shipDays: number[];
  /** 쉬는 날 (YYYY-MM-DD, 쉼표) */
  holidays: string[];
  carrier: string;
  courierName: string;
  courierPhone: string;
  pickupAddress: string;
}

export const DEFAULTS: Settings = {
  pgFeePct: null,
  courierCost: null,
  packCost: null,
  cutoffHour: null,
  shipDays: [1, 2, 3, 4, 5],
  holidays: [],
  carrier: "lotte",
  courierName: "",
  courierPhone: "",
  pickupAddress: "경기도 광주시 오포로 683, 2동 1층 (추자동)",
};

export async function getSettings(env: Env): Promise<Settings> {
  const { results } = await env.DB.prepare("SELECT key, value FROM settings").all<{ key: string; value: string }>();
  const s: Settings = { ...DEFAULTS };
  for (const r of results ?? []) {
    try {
      (s as unknown as Record<string, unknown>)[r.key] = JSON.parse(r.value);
    } catch { /* 깨진 값은 기본값 */ }
  }
  return s;
}

export async function saveSettings(env: Env, patch: Partial<Settings>): Promise<Settings> {
  const cur = await getSettings(env);
  const num = (v: unknown, min: number, max: number) =>
    v === null || v === "" ? null : Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max ? Number(v) : undefined;
  const next: Settings = { ...cur };
  if ("pgFeePct" in patch) { const v = num(patch.pgFeePct, 0, 20); if (v !== undefined) next.pgFeePct = v; }
  if ("courierCost" in patch) { const v = num(patch.courierCost, 0, 100000); if (v !== undefined) next.courierCost = v; }
  if ("packCost" in patch) { const v = num(patch.packCost, 0, 100000); if (v !== undefined) next.packCost = v; }
  if ("cutoffHour" in patch) { const v = num(patch.cutoffHour, 0, 23); if (v !== undefined) next.cutoffHour = v; }
  if (Array.isArray(patch.shipDays)) next.shipDays = [...new Set(patch.shipDays.map(Number).filter((d) => d >= 0 && d <= 6))].sort();
  if (Array.isArray(patch.holidays)) next.holidays = patch.holidays.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d))).slice(0, 100);
  for (const k of ["carrier", "courierName", "courierPhone", "pickupAddress"] as const) {
    if (typeof patch[k] === "string") next[k] = (patch[k] as string).trim().slice(0, 200);
  }
  const stmts = Object.entries(next).map(([k, v]) =>
    env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(k, JSON.stringify(v)),
  );
  await env.DB.batch(stmts);
  return next;
}

/** KST 날짜 문자열 */
export const kstDate = (d: Date = new Date()) => new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
export const kstHour = (d: Date = new Date()) => new Date(d.getTime() + 9 * 3600_000).getUTCHours();

/** 결제 시각 → 보낼 날짜. 마감 전이면 당일(발송 요일일 때), 아니면 다음 발송 가능일 */
export function shipDateFor(paidAt: Date, s: Settings): string {
  const isShipDay = (ymd: string) => {
    const dow = new Date(`${ymd}T00:00:00Z`).getUTCDay();
    return s.shipDays.includes(dow) && !s.holidays.includes(ymd);
  };
  let ymd = kstDate(paidAt);
  const sameDay = s.cutoffHour !== null && kstHour(paidAt) < s.cutoffHour && isShipDay(ymd);
  if (sameDay) return ymd;
  for (let i = 0; i < 30; i++) {
    const d = new Date(`${ymd}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    ymd = d.toISOString().slice(0, 10);
    if (isShipDay(ymd) || s.shipDays.length === 0) return ymd;
  }
  return ymd;
}

export const CARRIERS: Record<string, { name: string; track: string }> = {
  lotte: { name: "롯데택배", track: "https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=" },
  cj: { name: "CJ대한통운", track: "https://trace.cjlogistics.com/next/tracking.html?wblNo=" },
  epost: { name: "우체국택배", track: "https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=" },
  hanjin: { name: "한진택배", track: "https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLang=KR&wblnumText2=" },
  logen: { name: "로젠택배", track: "https://www.logen.co.kr/ajax/tracking/tracking_result.do?slipno=" },
};
