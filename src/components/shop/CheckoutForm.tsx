"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { readCart } from "@/lib/cart";
import { useCartLines, won } from "./useCartLines";

declare global {
  interface Window {
    PortOne?: { requestPayment: (req: Record<string, unknown>) => Promise<{ code?: string; message?: string; paymentId?: string } | undefined> };
    daum?: { Postcode: new (o: { oncomplete: (d: { zonecode: string; roadAddress: string; jibunAddress: string; buildingName?: string }) => void; width?: string; height?: string }) => { open: () => void; embed: (el: HTMLElement) => void } };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`스크립트를 못 불러왔어요: ${src}`));
    document.head.appendChild(s);
  });
}

const PORTONE_SDK = "https://cdn.portone.io/v2/browser-sdk.js";
const POSTCODE = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

export default function CheckoutForm() {
  const { lines, subtotal, shipping, total, hasBlocked } = useCartLines();
  const [cfg, setCfg] = useState<{ enabled: boolean; storeId: string | null; channelKey: string | null } | null>(null);
  const [f, setF] = useState({ name: "", phone: "", email: "", zipcode: "", address1: "", address2: "", memo: "" });
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [addrOpen, setAddrOpen] = useState(false);
  const addrBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then(setCfg).catch(() => setCfg({ enabled: false, storeId: null, channelKey: null }));
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  /** 팝업이 막히는 폰·인앱 브라우저가 많아서 화면 안에 띄운다 */
  async function findAddress() {
    try {
      await loadScript(POSTCODE);
      setAddrOpen(true);
    } catch (e) {
      setErr(String((e as Error).message));
    }
  }

  useEffect(() => {
    if (!addrOpen || !addrBox.current || !window.daum) return;
    addrBox.current.innerHTML = "";
    new window.daum.Postcode({
      width: "100%",
      height: "100%",
      oncomplete: (d) => {
        setF((v) => ({ ...v, zipcode: d.zonecode, address1: (d.roadAddress || d.jibunAddress) + (d.buildingName ? ` (${d.buildingName})` : "") }));
        setAddrOpen(false);
      },
    }).embed(addrBox.current);
  }, [addrOpen]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!agree) return setErr("개인정보 수집·이용에 동의해 주세요.");
    if (!cfg?.enabled || !cfg.storeId || !cfg.channelKey) return setErr("지금은 홈페이지 결제를 준비 중이에요.");
    setBusy(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...f, agree, items: readCart() }),
      });
      const o = await r.json();
      if (!r.ok) throw new Error(o.error ?? "주문을 만들지 못했어요.");
      const back = `${location.origin}/order/complete/?id=${encodeURIComponent(o.orderId)}&key=${encodeURIComponent(o.key)}`;
      await loadScript(PORTONE_SDK);
      const pay = await window.PortOne!.requestPayment({
        storeId: cfg.storeId,
        channelKey: cfg.channelKey,
        paymentId: o.orderId,
        orderName: o.orderName,
        totalAmount: o.total,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: { fullName: f.name, phoneNumber: f.phone.replace(/[^0-9]/g, ""), email: f.email || undefined },
        redirectUrl: back,
      });
      if (pay?.code !== undefined) throw new Error(pay.message ?? "결제가 끝나지 않았어요.");
      location.href = back;
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  if (lines === null) return <p className="py-20 text-center text-[var(--ink-soft)]">불러오는 중…</p>;
  if (lines.length === 0 || hasBlocked)
    return (
      <p className="py-20 text-center text-[var(--ink-soft)]">
        장바구니를 먼저 확인해 주세요. <Link href="/cart" className="text-[var(--terra)] underline">장바구니로</Link>
      </p>
    );

  const input = "w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px] outline-none focus:border-[var(--terra)]";
  return (
    <form onSubmit={submit} className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <h2 className="display text-[1.2rem]">받는 분</h2>
        <input className={input} placeholder="이름" value={f.name} onChange={set("name")} required maxLength={30} autoComplete="name" />
        <input className={input} placeholder="휴대폰 번호 (택배 기사님 연락용)" value={f.phone} onChange={set("phone")} required inputMode="tel" autoComplete="tel" />
        <input className={input} placeholder="이메일 (선택 · 주문 안내용)" value={f.email} onChange={set("email")} type="email" autoComplete="email" />
        <div className="flex gap-3">
          <input className={input} placeholder="우편번호" value={f.zipcode} readOnly required />
          <button type="button" onClick={findAddress} className="shrink-0 rounded-xl border border-[var(--terra)] px-5 font-semibold text-[var(--terra)]">주소 찾기</button>
        </div>
        {addrOpen && (
          <div className="relative h-[460px] overflow-hidden rounded-xl border border-[var(--line)] bg-white">
            <div ref={addrBox} className="h-full w-full" />
            <button type="button" onClick={() => setAddrOpen(false)} className="absolute right-2 top-2 z-10 rounded-full bg-white px-3 py-1 text-[13px] shadow">닫기</button>
          </div>
        )}
        <input className={input} placeholder="주소" value={f.address1} readOnly required />
        <input className={input} placeholder="상세 주소 (동·호수)" value={f.address2} onChange={set("address2")} maxLength={100} />
        <textarea className={input} placeholder="배송 메모 (선택)" value={f.memo} onChange={set("memo")} maxLength={200} rows={2} />

        <label className="flex items-start gap-3 rounded-xl bg-[var(--paper-2)] p-4 text-[13.5px] leading-relaxed">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          <span>
            <b>[필수] 개인정보 수집·이용 동의</b> — 주문한 음식을 보내고 문의에 답하려고 이름·휴대폰 번호·주소(이메일은 적으신 경우만)를 받습니다.
            법에 따라 주문·결제 기록은 5년 보관한 뒤 지웁니다. 자세한 내용은{" "}
            <Link href="/privacy" className="underline" target="_blank">개인정보처리방침</Link>에 있어요.
          </span>
        </label>
      </div>

      <aside className="h-fit rounded-3xl bg-[var(--paper-2)] p-7">
        <ul className="space-y-2 text-[14px]">
          {lines.map((l) => (
            <li key={l.slug} className="flex justify-between gap-3">
              <span>{l.product.name} × {l.qty}</span>
              <span>{won((l.product.price as number) * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-[var(--line)] pt-4 text-[15px]">
          <div className="flex justify-between"><dt>상품</dt><dd>{won(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>배송비</dt><dd>{won(shipping)}</dd></div>
          <div className="flex justify-between text-[17px] font-semibold"><dt>결제 금액</dt><dd>{won(total)}</dd></div>
        </dl>
        {err && <p className="mt-4 text-[14px] text-[var(--terra)]">{err}</p>}
        <button type="submit" disabled={busy} className="mt-6 w-full rounded-full bg-[var(--terra)] px-6 py-4 font-semibold text-white disabled:opacity-60">
          {busy ? "결제창을 여는 중…" : `${won(total)} 결제하기`}
        </button>
        <p className="mt-3 text-center text-[12.5px] text-[var(--ink-soft)]">만드는 대로 보내드려서 주문이 몰리면 하루 이틀 늦어질 수 있어요</p>
      </aside>
    </form>
  );
}
