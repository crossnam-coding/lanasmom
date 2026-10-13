"use client";
import { useCallback, useEffect, useState } from "react";
import OrderCard, { type Order } from "./OrderCard";
import { api } from "./lib";

const TABS = [
  { key: "", label: "전체" }, { key: "paid", label: "새 주문" }, { key: "preparing", label: "만드는 중" },
  { key: "shipped", label: "보냄" }, { key: "review", label: "확인 필요" }, { key: "refunded", label: "환불" },
];

export default function Orders() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState<string | null>(null);
  const [d, setD] = useState<{ orders: Order[]; counts: Record<string, number> } | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (s = status, query = q) => {
    try {
      const p = new URLSearchParams();
      if (s) p.set("status", s);
      if (query) p.set("q", query);
      setD(await api(`/api/admin/orders?${p}`));
      setErr("");
    } catch (e) { setErr((e as Error).message); }
  }, [status, q]);

  useEffect(() => {
    const u = new URLSearchParams(location.search);
    const s = u.get("status") ?? "";
    setStatus(s); setFocus(u.get("order"));
    load(s, "");
    const t = setInterval(() => load(), 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); load(status, q); }} className="mb-3 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 · 전화번호 · 주문번호로 찾기" className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-[15px]" />
        <button className="rounded-xl bg-[var(--ink)] px-4 text-[14px] text-white">찾기</button>
      </form>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => { setStatus(t.key); load(t.key, q); }}
            className={`shrink-0 rounded-full px-4 py-2 text-[14px] ${status === t.key ? "bg-[var(--ink)] text-white" : "bg-white"}`}>
            {t.label}{t.key && d?.counts[t.key] ? ` ${d.counts[t.key]}` : ""}
          </button>
        ))}
      </div>
      {err && <p className="mb-3 rounded-xl bg-red-50 p-3 text-[14px] text-red-700">{err}</p>}
      {!d && !err && <p className="py-10 text-center text-[var(--ink-soft)]">불러오는 중…</p>}
      {d && d.orders.length === 0 && <p className="py-10 text-center text-[var(--ink-soft)]">주문이 없어요.</p>}
      <ul className="space-y-3">
        {d?.orders.map((o) => <OrderCard key={o.id} o={o} open={focus === o.id} onChanged={() => load()} />)}
      </ul>
    </div>
  );
}
