"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CHECKOUT_ON, onCartChange, readCart } from "@/lib/cart";

export default function CartLink() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => setN(readCart().reduce((s, i) => s + i.qty, 0));
    sync();
    return onCartChange(sync);
  }, []);
  if (!CHECKOUT_ON) return null;
  return (
    <Link href="/cart" className="relative text-[var(--ink-soft)] hover:text-[var(--terra)]" aria-label={`장바구니 ${n}개`}>
      장바구니
      {n > 0 && (
        <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--terra)] px-1.5 text-[11px] font-semibold text-white">
          {n}
        </span>
      )}
    </Link>
  );
}
