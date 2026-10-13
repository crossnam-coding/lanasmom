"use client";
import { useState } from "react";
import { CARRIER_TRACK, STATUS_COLOR, STATUS_LABEL, api, kst, trackUrl, won, ymdLabel } from "./lib";

export interface Order {
  id: string; created_at: string; status: string; name: string; phone: string; email: string | null;
  zipcode: string; address1: string; address2: string | null; memo: string | null;
  items: { slug: string; name: string; size?: string; qty: number; price: number }[];
  subtotal: number; total: number; shipping: number; paid_at: string | null; tracking_no: string | null; admin_note: string | null;
  receipt_url: string | null; ship_date: string | null; carrier: string | null; refunded: number; user_id: string | null;
}

export default function OrderCard({ o, open, onChanged }: { o: Order; open?: boolean; onChanged: () => void }) {
  const [more, setMore] = useState(!!open);
  const [tracking, setTracking] = useState(o.tracking_no ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [refund, setRefund] = useState<{ amount: string; reason: string } | null>(null);
  const addr = `(${o.zipcode}) ${o.address1}${o.address2 ? " " + o.address2 : ""}`;
  const left = o.total - (o.refunded ?? 0);
  const track = trackUrl(o.carrier, o.tracking_no);
  const active = ["paid", "preparing"].includes(o.status);

  async function patch(p: Record<string, string>) {
    setErr(""); setBusy(true);
    try { await api("/api/admin/orders", { method: "PATCH", json: { id: o.id, ...p } }); onChanged(); }
    catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  async function doRefund() {
    if (!refund) return;
    const amount = Number(refund.amount.replace(/[^0-9]/g, ""));
    if (!amount || amount > left) return setErr(`환불 금액은 1원 ~ ${won(left)} 사이로 넣어 주세요.`);
    if (!refund.reason.trim()) return setErr("환불 사유를 적어 주세요.");
    if (!confirm(`${o.name}님께 ${won(amount)}을 환불할까요?\n카드 결제가 취소돼서 되돌릴 수 없어요.`)) return;
    setErr(""); setBusy(true);
    try {
      await api("/api/admin/refund", { method: "POST", json: { id: o.id, amount, reason: refund.reason } });
      setRefund(null); onChanged();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <li className="rounded-2xl bg-white p-4 shadow-[0_1px_0_var(--line)]">
      <button type="button" className="w-full text-left" onClick={() => setMore((v) => !v)}>
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          <span className={`rounded-full px-2.5 py-0.5 font-semibold ${STATUS_COLOR[o.status] ?? "bg-[#e9e2d6]"}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
          {o.ship_date && active && <span className="rounded-full bg-[#eef6f5] px-2.5 py-0.5 text-[#2f6f68]">📦 {ymdLabel(o.ship_date)} 발송</span>}
          <span className="ml-auto text-[var(--ink-soft)]">{kst(o.paid_at ?? o.created_at)}</span>
        </div>
        <p className="mt-2 text-[15.5px]">
          <b>{o.items[0]?.name}</b>{o.items[0]?.qty > 1 ? ` ×${o.items[0].qty}` : ""}{o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ""}
        </p>
        <p className="text-[13.5px] text-[var(--ink-soft)]">{o.name} · {won(o.total)}{o.refunded ? <span className="text-amber-700"> · 일부 환불 {won(o.refunded)}</span> : ""}</p>
      </button>

      {more && (
        <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3 text-[14.5px]">
          <ul className="space-y-1">
            {o.items.map((i) => <li key={i.slug} className="flex justify-between"><span>{i.name}{i.size ? ` (${i.size})` : ""} × {i.qty}</span><span>{won(i.price * i.qty)}</span></li>)}
            <li className="flex justify-between text-[var(--ink-soft)]"><span>배송비</span><span>{won(o.shipping)}</span></li>
          </ul>
          <div className="space-y-1 rounded-xl bg-[#f6f2ea] p-3">
            <p><b>{o.name}</b> · <a href={`tel:${o.phone}`} className="underline">{o.phone}</a>{o.email ? ` · ${o.email}` : ""}</p>
            <p>{addr} <button type="button" className="ml-1 text-[12.5px] underline" onClick={() => navigator.clipboard?.writeText(`${o.name}\t${o.phone}\t${addr}`)}>복사</button></p>
            {o.memo && <p>📝 {o.memo}</p>}
            {o.admin_note && <p className="text-red-700">⚠️ {o.admin_note}</p>}
            <p className="font-mono text-[11.5px] text-[var(--ink-soft)]">{o.id}{o.user_id ? " · 회원" : " · 비회원"}</p>
          </div>

          {active && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[13px] text-[var(--ink-soft)]">발송일</label>
              <input type="date" defaultValue={o.ship_date ?? ""} onChange={(e) => e.target.value && patch({ shipDate: e.target.value })}
                className="rounded-lg border border-[var(--line)] px-2 py-1.5 text-[14px]" />
              {o.status === "paid" && <button disabled={busy} onClick={() => patch({ status: "preparing" })} className="rounded-full bg-[#5e9e97] px-4 py-2 text-[14px] font-semibold text-white">만들기 시작</button>}
            </div>
          )}

          {(active || o.status === "shipped") && (
            <div className="flex flex-wrap items-center gap-2">
              <select defaultValue={o.carrier ?? "lotte"} onChange={(e) => patch({ carrier: e.target.value })} className="rounded-lg border border-[var(--line)] px-2 py-2 text-[14px]">
                {Object.entries(CARRIER_TRACK).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
              </select>
              <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="송장번호" inputMode="numeric"
                className="w-36 flex-1 rounded-lg border border-[var(--line)] px-3 py-2 text-[14px]" />
              {active
                ? <button disabled={busy || !tracking.trim()} onClick={() => patch({ status: "shipped", trackingNo: tracking })} className="rounded-full bg-[var(--terra)] px-4 py-2 text-[14px] font-semibold text-white disabled:opacity-50">보냈어요</button>
                : <button disabled={busy} onClick={() => patch({ trackingNo: tracking })} className="rounded-full border border-[var(--line)] px-4 py-2 text-[14px]">송장 고치기</button>}
            </div>
          )}
          {track && <a href={track} target="_blank" rel="noopener" className="inline-block text-[14px] text-[var(--terra)] underline">🚚 배송 조회</a>}

          {/* 환불 */}
          {left > 0 && !["cancelled", "pending", "failed"].includes(o.status) && (
            refund ? (
              <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-[13.5px] font-semibold text-red-800">환불 (남은 결제 금액 {won(left)})</p>
                <div className="flex gap-2">
                  <input value={refund.amount} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} inputMode="numeric" className="w-32 rounded-lg border border-red-200 px-3 py-2" />
                  <button type="button" onClick={() => setRefund({ ...refund, amount: String(left) })} className="text-[13px] underline">전액</button>
                  {o.shipping > 0 && left > o.shipping && <button type="button" onClick={() => setRefund({ ...refund, amount: String(left - o.shipping) })} className="text-[13px] underline">배송비 빼고</button>}
                </div>
                <input value={refund.reason} onChange={(e) => setRefund({ ...refund, reason: e.target.value })} placeholder="환불 사유 (손님께도 보일 수 있어요)" className="w-full rounded-lg border border-red-200 px-3 py-2" />
                <div className="flex gap-2">
                  <button disabled={busy} onClick={doRefund} className="rounded-full bg-red-600 px-4 py-2 text-[14px] font-semibold text-white">환불하기</button>
                  <button type="button" onClick={() => setRefund(null)} className="text-[13px] underline">그만두기</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setRefund({ amount: String(left), reason: "" })} className="text-[13px] text-red-700 underline">환불하기</button>
            )
          )}
          {o.receipt_url && <a href={o.receipt_url} target="_blank" rel="noopener" className="ml-3 text-[13px] text-[var(--ink-soft)] underline">카드 영수증</a>}
          {err && <p className="rounded-lg bg-red-50 p-2 text-[13.5px] text-red-700">{err}</p>}
        </div>
      )}
    </li>
  );
}
