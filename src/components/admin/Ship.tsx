"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import OrderCard, { type Order } from "./OrderCard";
import { api, ymdLabel } from "./lib";

const ymd = (offset: number) => new Date(Date.now() + 9 * 3600_000 + offset * 86_400_000).toISOString().slice(0, 10);

export default function Ship() {
  const [day, setDay] = useState<"today" | "tomorrow" | "pick">("today");
  const [pick, setPick] = useState(ymd(2));
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [cfg, setCfg] = useState<{ courierName: string; courierPhone: string; pickupAddress: string } | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const target = day === "today" ? "today" : day === "tomorrow" ? ymd(1) : pick;
  const load = useCallback(async () => {
    try { setOrders((await api<{ orders: Order[] }>(`/api/admin/orders?ship=${target}`)).orders); setErr(""); }
    catch (e) { setErr((e as Error).message); }
  }, [target]);

  useEffect(() => { if (new URLSearchParams(location.search).get("day") === "tomorrow") setDay("tomorrow"); }, []);
  useEffect(() => { setOrders(null); load(); }, [load]);
  useEffect(() => { api<{ settings: typeof cfg }>("/api/admin/settings").then((d) => setCfg(d.settings)).catch(() => {}); }, []);

  const make = useMemo(() => {
    const m = new Map<string, { name: string; size?: string; qty: number }>();
    for (const o of orders ?? []) for (const i of o.items) {
      const x = m.get(i.slug) ?? { name: i.name, size: i.size, qty: 0 }; x.qty += i.qty; m.set(i.slug, x);
    }
    return [...m.values()].sort((a, b) => b.qty - a.qty);
  }, [orders]);
  const boxes = orders?.length ?? 0;
  const notShipped = (orders ?? []).filter((o) => o.status !== "shipped").length;

  function callCourier() {
    if (!cfg?.courierPhone) return setErr("설정에서 기사님 전화번호를 먼저 넣어 주세요.");
    const body = `안녕하세요${cfg.courierName ? ` ${cfg.courierName} 기사님` : ""}, 라나엄마입니다. 오늘 집하 ${boxes}박스 부탁드립니다. (냉장·냉동 식품) 주소: ${cfg.pickupAddress}`;
    location.href = `sms:${cfg.courierPhone.replace(/[^0-9]/g, "")}?&body=${encodeURIComponent(body)}`;
  }

  function downloadCsv() {
    const rows = [["주문번호", "받는분", "전화", "우편번호", "주소", "상세주소", "상품", "수량", "배송메모"]];
    for (const o of orders ?? []) rows.push([o.id, o.name, o.phone, o.zipcode, o.address1, o.address2 ?? "", o.items.map((i) => `${i.name} x${i.qty}`).join(" / "), String(o.items.reduce((s, i) => s + i.qty, 0)), o.memo ?? ""]);
    const csv = "﻿" + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = `라나엄마_발송_${target === "today" ? ymd(0) : target}.csv`;
    a.click();
    setMsg("택배 접수용 목록을 내려받았어요. 택배사 프로그램의 「엑셀 일괄 등록」에 넣으시면 돼요.");
  }

  async function startAll() {
    const list = (orders ?? []).filter((o) => o.status === "paid");
    for (const o of list) await api("/api/admin/orders", { method: "PATCH", json: { id: o.id, status: "preparing" } }).catch(() => null);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([["today", "오늘"], ["tomorrow", `내일 ${ymdLabel(ymd(1))}`], ["pick", "날짜"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setDay(k)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[14px] ${day === k ? "bg-[var(--ink)] text-white" : "bg-white"}`}>{l}</button>
        ))}
      </div>
      {day === "today" && <p className="text-[12.5px] text-[var(--ink-soft)]">오늘 보낼 것 + 날짜가 지났는데 아직 안 보낸 것</p>}
      {day === "pick" && <input type="date" value={pick} onChange={(e) => setPick(e.target.value)} className="rounded-lg border border-[var(--line)] bg-white px-3 py-2" />}

      <section className="rounded-2xl bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">만들 것 · 보낼 것</h2>
          <p className="text-[14px] text-[var(--ink-soft)]">{boxes}박스{notShipped !== boxes ? ` (남은 것 ${notShipped})` : ""}</p>
        </div>
        {make.length ? (
          <ul className="mt-2 divide-y divide-[var(--line)] text-[15px]">
            {make.map((m) => <li key={m.name} className="flex justify-between py-2"><span>{m.name}{m.size ? ` · ${m.size}` : ""}</span><b>{m.qty}개</b></li>)}
          </ul>
        ) : <p className="mt-2 text-[14px] text-[var(--ink-soft)]">{orders ? "보낼 주문이 없어요." : "불러오는 중…"}</p>}
        {boxes > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={callCourier} className="rounded-xl bg-[var(--terra)] px-3 py-3 text-[14.5px] font-semibold text-white">📞 기사님 부르기</button>
            <button onClick={downloadCsv} className="rounded-xl border border-[var(--line)] px-3 py-3 text-[14.5px] font-semibold">⬇️ 택배 접수 목록</button>
            {(orders ?? []).some((o) => o.status === "paid") && (
              <button onClick={startAll} className="col-span-2 rounded-xl bg-[#5e9e97] px-3 py-3 text-[14.5px] font-semibold text-white">전부 「만들기 시작」으로</button>
            )}
          </div>
        )}
        {cfg && !cfg.courierPhone && boxes > 0 && <p className="mt-2 text-[12.5px] text-[var(--ink-soft)]">기사님 부르기는 설정에 기사님 번호를 넣으면 문자로 바로 보내져요.</p>}
      </section>

      {msg && <p className="rounded-xl bg-[#eef6f5] p-3 text-[14px]">{msg}</p>}
      {err && <p className="rounded-xl bg-red-50 p-3 text-[14px] text-red-700">{err}</p>}
      <ul className="space-y-3">{orders?.map((o) => <OrderCard key={o.id} o={o} onChanged={load} />)}</ul>
    </div>
  );
}
