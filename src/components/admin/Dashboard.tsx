"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, won, ymdLabel } from "./lib";

interface Sum { revenue: number; orders: number; qty: number; profit: number; refunds: number }
interface Day extends Sum { date: string; cost: number; fee: number; ship: number }
interface D {
  today: Sum & { date: string }; yesterday: Sum; month: Sum & { label: string }; period: Sum & { days: number };
  series: Day[]; topProducts: { name: string; qty: number; revenue: number }[];
  ship: { today: { date: string; count: number; overdue: number; make: { name: string; size?: string; qty: number }[] }; tomorrow: { date: string; count: number; make: { name: string; size?: string; qty: number }[] } };
  csOpen: number; reviewCount: number; missing: string[];
}

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev && !now) return null;
  const diff = now - prev;
  return <span className={`text-[12px] ${diff >= 0 ? "text-[#2f7d4f]" : "text-red-600"}`}>어제보다 {diff >= 0 ? "▲" : "▼"} {Math.abs(diff).toLocaleString("ko-KR")}</span>;
}

export default function Dashboard() {
  const [d, setD] = useState<D | null>(null);
  const [err, setErr] = useState("");
  const [hover, setHover] = useState<Day | null>(null);
  useEffect(() => { api<D>("/api/admin/dashboard?days=14").then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{err}</p>;
  if (!d) return <p className="py-16 text-center text-[var(--ink-soft)]">불러오는 중…</p>;

  const max = Math.max(1, ...d.series.map((x) => x.revenue));
  const shown = hover ?? d.series[d.series.length - 1];
  return (
    <div className="space-y-4">
      {/* 할 일 알림 */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/ship/" className="rounded-2xl bg-[var(--terra)] p-4 text-white">
          <p className="text-[13px] opacity-90">오늘 보낼 것</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{d.ship.today.count}<span className="text-[15px] font-normal"> 건</span></p>
          {d.ship.today.overdue > 0 && <p className="mt-1 text-[12px]">⚠️ 밀린 것 {d.ship.today.overdue}건 포함</p>}
        </Link>
        <Link href="/admin/ship/?day=tomorrow" className="rounded-2xl bg-white p-4">
          <p className="text-[13px] text-[var(--ink-soft)]">내일 보낼 것 · {ymdLabel(d.ship.tomorrow.date)}</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{d.ship.tomorrow.count}<span className="text-[15px] font-normal"> 건</span></p>
        </Link>
        <Link href="/admin/cs/" className={`rounded-2xl p-4 ${d.csOpen ? "bg-amber-100" : "bg-white"}`}>
          <p className="text-[13px] text-[var(--ink-soft)]">답할 문의</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{d.csOpen}<span className="text-[15px] font-normal"> 건</span></p>
        </Link>
        <Link href="/admin/orders/?status=review" className={`rounded-2xl p-4 ${d.reviewCount ? "bg-red-100" : "bg-white"}`}>
          <p className="text-[13px] text-[var(--ink-soft)]">확인 필요한 결제</p>
          <p className="mt-1 text-[28px] font-bold leading-none">{d.reviewCount}<span className="text-[15px] font-normal"> 건</span></p>
        </Link>
      </div>

      {/* 오늘 만들 것 */}
      {d.ship.today.make.length > 0 && (
        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-2 font-semibold">오늘 만들어 보낼 것</h2>
          <ul className="divide-y divide-[var(--line)] text-[15px]">
            {d.ship.today.make.map((m) => (
              <li key={m.name} className="flex justify-between py-2"><span>{m.name}{m.size ? ` · ${m.size}` : ""}</span><b>{m.qty}개</b></li>
            ))}
          </ul>
        </section>
      )}

      {/* 오늘 숫자 */}
      <section className="rounded-2xl bg-white p-4">
        <h2 className="mb-3 font-semibold">오늘 ({ymdLabel(d.today.date)})</h2>
        <div className="grid grid-cols-2 gap-y-4">
          <div><p className="text-[13px] text-[var(--ink-soft)]">매출</p><p className="text-[22px] font-bold">{won(d.today.revenue)}</p><Delta now={d.today.revenue} prev={d.yesterday.revenue} /></div>
          <div><p className="text-[13px] text-[var(--ink-soft)]">남는 돈(추정)</p><p className="text-[22px] font-bold">{won(d.today.profit)}</p><Delta now={d.today.profit} prev={d.yesterday.profit} /></div>
          <div><p className="text-[13px] text-[var(--ink-soft)]">주문</p><p className="text-[18px] font-semibold">{d.today.orders}건</p></div>
          <div><p className="text-[13px] text-[var(--ink-soft)]">판매 수량</p><p className="text-[18px] font-semibold">{d.today.qty}개</p></div>
        </div>
        <p className="mt-4 border-t border-[var(--line)] pt-3 text-[13.5px] text-[var(--ink-soft)]">
          이번 달 매출 <b className="text-[var(--ink)]">{won(d.month.revenue)}</b> · 남는 돈 <b className="text-[var(--ink)]">{won(d.month.profit)}</b> · 주문 {d.month.orders}건
          {d.month.refunds > 0 && <> · 환불 {won(d.month.refunds)}</>}
        </p>
      </section>

      {/* 14일 매출 막대 */}
      <section className="rounded-2xl bg-white p-4">
        <h2 className="font-semibold">최근 14일 매출</h2>
        <p className="mt-1 min-h-[2.6em] text-[13px] leading-snug text-[var(--ink-soft)]">
          {ymdLabel(shown.date)} · 매출 <b className="text-[var(--ink)]">{won(shown.revenue)}</b> · 주문 {shown.orders}건 · {shown.qty}개 · 남는 돈 {won(shown.profit)}
        </p>
        <div className="mt-3 flex h-36 items-end gap-[2px] border-b border-[var(--line)]" onMouseLeave={() => setHover(null)}>
          {d.series.map((x) => (
            <button key={x.date} type="button" aria-label={`${ymdLabel(x.date)} 매출 ${won(x.revenue)}`}
              onMouseEnter={() => setHover(x)} onFocus={() => setHover(x)} onClick={() => setHover(x)}
              className="group flex h-full flex-1 items-end">
              <span className={`block w-full rounded-t-[4px] ${hover?.date === x.date ? "bg-[var(--terra-deep)]" : "bg-[var(--terra)]"}`}
                style={{ height: `${x.revenue ? Math.max(3, (x.revenue / max) * 100) : 0}%` }} />
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-[var(--ink-soft)]">
          <span>{ymdLabel(d.series[0].date)}</span><span>오늘</span>
        </div>
      </section>

      {/* 많이 팔린 것 */}
      {d.topProducts.length > 0 && (
        <section className="rounded-2xl bg-white p-4">
          <h2 className="mb-2 font-semibold">최근 14일 많이 팔린 것</h2>
          <ul className="divide-y divide-[var(--line)] text-[14.5px]">
            {d.topProducts.map((p) => (
              <li key={p.name} className="flex justify-between gap-3 py-2"><span>{p.name}</span><span className="shrink-0 text-[var(--ink-soft)]">{p.qty}개 · {won(p.revenue)}</span></li>
            ))}
          </ul>
        </section>
      )}

      {d.missing.length > 0 && (
        <Link href="/admin/settings/" className="block rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13.5px] leading-relaxed">
          ⚠️ <b>남는 돈은 아직 정확하지 않아요.</b> 설정에서 아래 값을 넣어 주시면 정확해져요.<br />
          <span className="text-[var(--ink-soft)]">{d.missing.slice(0, 6).join(" · ")}{d.missing.length > 6 ? ` 외 ${d.missing.length - 6}개` : ""}</span>
        </Link>
      )}
    </div>
  );
}
