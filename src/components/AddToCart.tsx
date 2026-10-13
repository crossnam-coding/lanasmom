"use client";
import Link from "next/link";
import { useState } from "react";
import { addToCart } from "@/lib/cart";

export default function AddToCart({ slug }: { slug: string }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-[var(--line)] bg-white">
          <button type="button" className="px-4 py-3 text-[18px]" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="하나 빼기">−</button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button type="button" className="px-4 py-3 text-[18px]" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="하나 더">+</button>
        </div>
        <button
          type="button"
          onClick={() => { addToCart(slug, qty); setAdded(true); }}
          className="flex-1 rounded-full bg-[var(--terra)] px-6 py-4 text-center font-semibold text-white transition hover:bg-[var(--terra-deep)]"
        >
          장바구니에 담기
        </button>
      </div>
      {added && (
        <p className="mt-3 text-center text-[14px]">
          담았어요. <Link href="/cart" className="font-semibold text-[var(--terra)] underline">장바구니 보기 →</Link>
        </p>
      )}
    </div>
  );
}
