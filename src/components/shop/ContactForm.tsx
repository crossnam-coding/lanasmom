"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const KINDS = [["order", "주문"], ["delivery", "배송"], ["refund", "취소·환불"], ["product", "상품"], ["etc", "기타"]];

export default function ContactForm() {
  const [order, setOrder] = useState<{ id: string; key: string } | null>(null);
  const [f, setF] = useState({ name: "", email: "", phone: "", kind: "order", message: "", website: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: string; key: string } | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const id = q.get("order"), key = q.get("key");
    if (id && key) {
      setOrder({ id, key });
      fetch(`/api/orders/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`).then((r) => r.ok ? r.json() : null).then((o) => o && setF((v) => ({ ...v, name: v.name || o.name })));
    }
    if (q.get("kind")) setF((v) => ({ ...v, kind: q.get("kind")! }));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, agree, orderId: order?.id, orderKey: order?.key }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "남기지 못했어요.");
      setDone(d);
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }

  if (done) return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <p className="text-[18px] font-semibold">문의를 남겼어요.</p>
      <p className="mt-3 text-[15px] text-[var(--ink-soft)]">확인하고 답을 드릴게요. 답변은 아래 주소에서 보실 수 있어요{f.email ? ". 답이 달리면 메일로도 알려드려요" : ""}.</p>
      <Link href={`/inquiry/?id=${done.id}&key=${done.key}`} className="mt-6 inline-block rounded-full bg-[var(--terra)] px-6 py-3 font-semibold text-white">내 문의 보기</Link>
      <p className="mt-3 text-[12.5px] text-[var(--ink-soft)]">이 주소를 저장해 두세요.</p>
    </div>
  );

  const input = "w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px]";
  return (
    <form onSubmit={submit} className="mx-auto max-w-lg space-y-4">
      {order && <p className="rounded-xl bg-[var(--paper-2)] p-3 text-[14px]">주문 <b>{order.id}</b> 에 대한 문의예요.</p>}
      <div className="flex flex-wrap gap-2">
        {KINDS.map(([k, l]) => (
          <button key={k} type="button" onClick={() => setF({ ...f, kind: k })} className={`rounded-full px-4 py-2 text-[14px] ${f.kind === k ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}>{l}</button>
        ))}
      </div>
      <input className={input} placeholder="이름" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required maxLength={30} />
      <input className={input} placeholder="이메일 (답변 알림을 받으실 곳)" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={input} placeholder="휴대폰 번호 (이메일이 없으면)" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      <textarea className={input} rows={6} placeholder="무엇이든 편하게 적어 주세요" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} required maxLength={2000} />
      <input tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} aria-hidden />
      <label className="flex items-start gap-3 rounded-xl bg-[var(--paper-2)] p-4 text-[13.5px] leading-relaxed">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
        <span><b>[필수] 개인정보 수집·이용 동의</b> — 문의에 답하려고 이름과 이메일 또는 휴대폰 번호를 받습니다. 문의 기록은 3년 보관한 뒤 지웁니다. 자세한 내용은 <Link href="/privacy" className="underline" target="_blank">개인정보처리방침</Link>에 있어요.</span>
      </label>
      {err && <p className="text-[14px] text-[var(--terra)]">{err}</p>}
      <button disabled={busy} className="w-full rounded-full bg-[var(--terra)] px-6 py-4 font-semibold text-white disabled:opacity-60">{busy ? "보내는 중…" : "문의 남기기"}</button>
    </form>
  );
}
