"use client";
import Link from "next/link";
import { removeFromCart, setQty } from "@/lib/cart";
import { useCartLines, won } from "./useCartLines";

export default function CartView() {
  const { lines, subtotal, shipping, total, hasBlocked } = useCartLines();
  if (lines === null) return <p className="py-20 text-center text-[var(--ink-soft)]">불러오는 중…</p>;
  if (lines.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--ink-soft)]">장바구니가 비어 있어요.</p>
        <Link href="/menu" className="mt-6 inline-block rounded-full bg-[var(--terra)] px-7 py-3.5 font-semibold text-white">메뉴 보러 가기</Link>
      </div>
    );
  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
      <ul className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {lines.map((l) => (
          <li key={l.slug} className="flex items-center gap-4 py-5">
            <div className="flex-1">
              <Link href={`/menu/${l.slug}`} className="font-semibold hover:text-[var(--terra)]">{l.product.name}</Link>
              {l.product.size && <p className="text-[13px] text-[var(--ink-soft)]">{l.product.size}</p>}
              {l.orderable ? (
                <p className="mt-1 text-[14px]">{won((l.product.price as number) * l.qty)}</p>
              ) : (
                <p className="mt-1 text-[13px] text-[var(--terra)]">지금은 주문할 수 없는 상품이에요 — 빼 주세요</p>
              )}
            </div>
            {l.orderable && (
              <div className="flex items-center rounded-full border border-[var(--line)] bg-white">
                <button type="button" className="px-3 py-2" onClick={() => setQty(l.slug, l.qty - 1)} aria-label="하나 빼기">−</button>
                <span className="w-7 text-center">{l.qty}</span>
                <button type="button" className="px-3 py-2" onClick={() => setQty(l.slug, l.qty + 1)} aria-label="하나 더">+</button>
              </div>
            )}
            <button type="button" className="text-[13px] text-[var(--ink-soft)] underline" onClick={() => removeFromCart(l.slug)}>빼기</button>
          </li>
        ))}
      </ul>
      <aside className="h-fit rounded-3xl bg-[var(--paper-2)] p-7">
        <dl className="space-y-2 text-[15px]">
          <div className="flex justify-between"><dt>상품</dt><dd>{won(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>배송비</dt><dd>{won(shipping)}</dd></div>
          <div className="flex justify-between border-t border-[var(--line)] pt-3 text-[17px] font-semibold"><dt>합계</dt><dd>{won(total)}</dd></div>
        </dl>
        {hasBlocked ? (
          <p className="mt-6 text-center text-[14px] text-[var(--terra)]">주문할 수 없는 상품을 빼면 주문할 수 있어요.</p>
        ) : (
          <Link href="/checkout" className="mt-6 block rounded-full bg-[var(--terra)] px-6 py-4 text-center font-semibold text-white">주문하기</Link>
        )}
        <p className="mt-3 text-center text-[12.5px] text-[var(--ink-soft)]">회원가입 없이 주문할 수 있어요 · <Link href="/login/?next=/checkout/" className="underline">로그인하고 주문</Link></p>
      </aside>
    </div>
  );
}
