"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { clearCart } from "@/lib/cart";
import { won } from "./useCartLines";

interface Order {
  id: string; status: string; total: number; subtotal: number; shipping: number;
  items: { name: string; qty: number; price: number }[]; name: string; receiptUrl: string | null; trackingNo: string | null;
}

const LABEL: Record<string, string> = {
  paid: "주문이 접수됐어요", preparing: "만들고 있어요", shipped: "보내드렸어요",
  pending: "결제를 확인하고 있어요", failed: "결제가 끝나지 않았어요", cancelled: "취소된 주문이에요", review: "확인이 필요한 주문이에요",
};

export default function OrderComplete() {
  const [state, setState] = useState<{ order?: Order; error?: string }>({});

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const id = q.get("id") ?? "";
    const key = q.get("key") ?? "";
    const code = q.get("code");
    (async () => {
      if (!id || !key) return setState({ error: "주문 정보가 없어요." });
      if (code) return setState({ error: q.get("message") ?? "결제가 끝나지 않았어요. 다시 시도해 주세요." });
      await fetch(`/api/orders/${encodeURIComponent(id)}/complete`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }),
      }).catch(() => null);
      const r = await fetch(`/api/orders/${encodeURIComponent(id)}?key=${encodeURIComponent(key)}`);
      if (!r.ok) return setState({ error: "주문을 찾을 수 없어요." });
      const order = (await r.json()) as Order;
      if (["paid", "preparing", "shipped"].includes(order.status)) clearCart();
      setState({ order });
    })();
  }, []);

  if (state.error)
    return (
      <div className="py-16 text-center">
        <p className="text-[17px]">{state.error}</p>
        <Link href="/cart" className="mt-6 inline-block rounded-full border border-[var(--terra)] px-6 py-3 font-semibold text-[var(--terra)]">장바구니로 돌아가기</Link>
      </div>
    );
  const o = state.order;
  if (!o) return <p className="py-20 text-center text-[var(--ink-soft)]">결제를 확인하는 중…</p>;
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-[13px] font-semibold tracking-[0.16em] text-[var(--terra)]">주문번호 {o.id}</p>
      <h1 className="display mt-2 text-[1.8rem]">{LABEL[o.status] ?? o.status}</h1>
      {o.status === "paid" && <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)]">{o.name}님, 고맙습니다. 정성껏 만들어 보내드릴게요.</p>}
      {o.status === "pending" && <p className="mt-4 text-[15px] text-[var(--ink-soft)]">결제사 확인이 조금 늦어지고 있어요. 잠시 뒤 이 화면을 새로고침해 주세요.</p>}
      <ul className="mt-8 space-y-2 border-y border-[var(--line)] py-5 text-[15px]">
        {o.items.map((i) => (
          <li key={i.name} className="flex justify-between"><span>{i.name} × {i.qty}</span><span>{won(i.price * i.qty)}</span></li>
        ))}
        <li className="flex justify-between text-[var(--ink-soft)]"><span>배송비</span><span>{won(o.shipping)}</span></li>
        <li className="flex justify-between pt-2 font-semibold"><span>합계</span><span>{won(o.total)}</span></li>
      </ul>
      {o.trackingNo && <p className="mt-5 text-[15px]">송장번호 {o.trackingNo}</p>}
      {o.receiptUrl && <a href={o.receiptUrl} target="_blank" rel="noopener" className="mt-5 inline-block text-[14px] underline">영수증 보기</a>}
      <p className="mt-8 text-[13.5px] text-[var(--ink-soft)]">이 화면 주소를 저장해 두시면 나중에 배송 상태를 다시 볼 수 있어요.</p>
    </div>
  );
}
