"use client";
import { useEffect, useState } from "react";
import { api, won } from "./lib";

interface S {
  pgFeePct: number | null; courierCost: number | null; packCost: number | null; cutoffHour: number | null;
  shipDays: number[]; holidays: string[]; carrier: string; courierName: string; courierPhone: string; pickupAddress: string;
}
interface P { slug: string; name: string; size?: string; price: number; soldOut: boolean; cost: number | null }

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block"><span className="text-[13.5px] font-semibold">{label}</span>{hint && <span className="ml-1 text-[12px] text-[var(--ink-soft)]">{hint}</span>}<div className="mt-1">{children}</div></label>
  );
}

function b64ToBytes(b64: string) {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "="));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export default function Settings() {
  const [s, setS] = useState<S | null>(null);
  const [carriers, setCarriers] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<P[]>([]);
  const [costs, setCosts] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api<{ settings: S; carriers: Record<string, string>; products: P[] }>("/api/admin/settings").then((d) => {
      setS(d.settings); setCarriers(d.carriers); setProducts(d.products);
      setCosts(Object.fromEntries(d.products.map((p) => [p.slug, p.cost === null ? "" : String(p.cost)])));
    }).catch((e) => setErr(e.message));
  }, []);

  async function save() {
    setErr(""); setMsg("");
    try {
      const c = Object.fromEntries(Object.entries(costs).map(([k, v]) => [k, v.trim() === "" ? null : Number(v.replace(/[^0-9]/g, ""))]));
      await api("/api/admin/settings", { method: "PUT", json: { settings: s, costs: c } });
      setMsg("저장했어요 ✓");
    } catch (e) { setErr((e as Error).message); }
  }

  if (!s) return <p className="py-10 text-center text-[var(--ink-soft)]">{err || "불러오는 중…"}</p>;
  const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(/[^0-9.]/g, "")));
  const input = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2.5 text-[15px]";

  return (
    <div className="space-y-4 pb-20">
      <Push />

      <section className="space-y-3 rounded-2xl bg-white p-4">
        <h2 className="font-semibold">발송 규칙</h2>
        <Field label="당일 발송 마감 시각" hint="이 시각 전 결제는 그날 보내요. 비우면 늘 다음 발송일">
          <select value={s.cutoffHour ?? ""} onChange={(e) => setS({ ...s, cutoffHour: e.target.value === "" ? null : Number(e.target.value) })} className={input}>
            <option value="">당일 발송 안 함 (다음 발송일)</option>
            {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{h}시 전 결제까지</option>)}
          </select>
        </Field>
        <Field label="보내는 요일">
          <div className="flex gap-1.5">
            {"일월화수목금토".split("").map((d, i) => (
              <button key={i} type="button" onClick={() => setS({ ...s, shipDays: s.shipDays.includes(i) ? s.shipDays.filter((x) => x !== i) : [...s.shipDays, i].sort() })}
                className={`h-10 w-10 rounded-full text-[14px] ${s.shipDays.includes(i) ? "bg-[var(--terra)] text-white" : "bg-[#f6f2ea]"}`}>{d}</button>
            ))}
          </div>
        </Field>
        <Field label="쉬는 날" hint="쉼표로 구분 (예: 2026-12-25, 2027-01-01)">
          <input defaultValue={s.holidays.join(", ")} onBlur={(e) => setS({ ...s, holidays: e.target.value.split(/[,\s]+/).filter(Boolean) })} className={input} />
        </Field>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4">
        <h2 className="font-semibold">택배</h2>
        <Field label="택배사">
          <select value={s.carrier} onChange={(e) => setS({ ...s, carrier: e.target.value })} className={input}>
            {Object.entries(carriers).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="기사님 성함"><input defaultValue={s.courierName} onBlur={(e) => setS({ ...s, courierName: e.target.value })} className={input} /></Field>
          <Field label="기사님 전화"><input defaultValue={s.courierPhone} onBlur={(e) => setS({ ...s, courierPhone: e.target.value })} inputMode="tel" className={input} /></Field>
        </div>
        <Field label="집하 주소"><input defaultValue={s.pickupAddress} onBlur={(e) => setS({ ...s, pickupAddress: e.target.value })} className={input} /></Field>
      </section>

      <section className="space-y-3 rounded-2xl bg-white p-4">
        <h2 className="font-semibold">비용 (남는 돈 계산용)</h2>
        <div className="grid grid-cols-3 gap-3">
          <Field label="결제 수수료 %"><input defaultValue={s.pgFeePct ?? ""} onBlur={(e) => setS({ ...s, pgFeePct: num(e.target.value) })} inputMode="decimal" className={input} placeholder="예: 3.3" /></Field>
          <Field label="택배비/박스"><input defaultValue={s.courierCost ?? ""} onBlur={(e) => setS({ ...s, courierCost: num(e.target.value) })} inputMode="numeric" className={input} placeholder="원" /></Field>
          <Field label="포장비/박스"><input defaultValue={s.packCost ?? ""} onBlur={(e) => setS({ ...s, packCost: num(e.target.value) })} inputMode="numeric" className={input} placeholder="원" /></Field>
        </div>
        <p className="text-[12.5px] text-[var(--ink-soft)]">포장비 = 아이스박스·아이스팩·테이프 등 한 박스에 드는 돈</p>
        <h3 className="pt-2 text-[14px] font-semibold">상품별 원가 <span className="font-normal text-[var(--ink-soft)]">(재료비 — 1개 만드는 데 드는 돈)</span></h3>
        <ul className="divide-y divide-[var(--line)]">
          {products.map((p) => {
            const c = costs[p.slug];
            const margin = c ? p.price - Number(c) : null;
            return (
              <li key={p.slug} className="flex items-center gap-2 py-2 text-[14px]">
                <span className="flex-1">{p.name}{p.size ? <span className="text-[var(--ink-soft)]"> · {p.size}</span> : null}<br /><span className="text-[12px] text-[var(--ink-soft)]">판매가 {won(p.price)}{margin !== null ? ` · 1개당 ${won(margin)} 남음` : ""}{p.soldOut ? " · 품절" : ""}</span></span>
                <input value={c ?? ""} onChange={(e) => setCosts({ ...costs, [p.slug]: e.target.value })} inputMode="numeric" placeholder="원가" className="w-24 rounded-lg border border-[var(--line)] px-2 py-2 text-right" />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="fixed inset-x-0 bottom-[64px] z-30 px-4">
        <div className="mx-auto max-w-3xl">
          {(msg || err) && <p className={`mb-2 rounded-xl p-2 text-center text-[14px] ${err ? "bg-red-50 text-red-700" : "bg-[#eef6f5]"}`}>{err || msg}</p>}
          <button onClick={save} className="w-full rounded-xl bg-[var(--ink)] py-3.5 font-semibold text-white shadow-lg">저장하기</button>
        </div>
      </div>
    </div>
  );
}

function Push() {
  const [state, setState] = useState("확인 중");
  const [devices, setDevices] = useState(0);
  const [err, setErr] = useState("");
  async function check() {
    const d = await api<{ devices: number }>("/api/admin/push").catch(() => ({ devices: 0 }));
    setDevices(d.devices);
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return setState("unsupported");
    const reg = await navigator.serviceWorker.getRegistration("/admin/");
    const sub = await reg?.pushManager.getSubscription();
    setState(sub ? "on" : Notification.permission === "denied" ? "denied" : "off");
  }
  useEffect(() => { check(); }, []);
  async function enable() {
    try {
      const { publicKey } = await api<{ publicKey: string | null }>("/api/admin/push");
      if (!publicKey) throw new Error("알림 키가 아직 설정되지 않았어요.");
      if ((await Notification.requestPermission()) !== "granted") throw new Error("알림을 허용해 주셔야 해요.");
      const reg = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) });
      await api("/api/admin/push", { method: "POST", json: { subscription: sub.toJSON(), label: navigator.userAgent.slice(0, 60) } });
      check();
    } catch (e) { setErr((e as Error).message); }
  }
  async function test() {
    const r = await api<{ push: number }>("/api/admin/push", { method: "POST", json: { action: "test" } });
    setErr(r.push ? "" : "알림 받을 기기가 없어요. 먼저 켜 주세요.");
  }
  return (
    <section className="rounded-2xl bg-white p-4 text-[14px]">
      <h2 className="mb-2 font-semibold">🔔 새 주문·문의 알림</h2>
      {state === "on" && <p>이 폰은 알림을 받고 있어요 (받는 기기 {devices}대) · <button className="underline" onClick={test}>시험 알림</button></p>}
      {state === "off" && <button onClick={enable} className="rounded-full bg-[var(--terra)] px-5 py-2.5 font-semibold text-white">이 폰으로 알림 받기</button>}
      {state === "denied" && <p>알림이 막혀 있어요. 폰 설정 → 이 앱(또는 사파리) 알림을 허용해 주세요.</p>}
      {state === "unsupported" && <p>아이폰은 <b>사파리 공유 버튼 → 「홈 화면에 추가」</b> 한 뒤 홈 화면의 「라나엄마 주문」으로 열어야 알림을 켤 수 있어요.</p>}
      {err && <p className="mt-2 text-red-700">{err}</p>}
    </section>
  );
}
