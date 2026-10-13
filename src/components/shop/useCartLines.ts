"use client";
import { useEffect, useState } from "react";
import { PRODUCTS, SHIPPING_FEE, slugOf, type Product } from "@/data/products";
import { onCartChange, readCart } from "@/lib/cart";

export interface Line {
  slug: string;
  qty: number;
  product: Product;
  orderable: boolean;
}

const BY_SLUG = new Map(PRODUCTS.map((p) => [slugOf(p), p]));

/** 화면 표시용 계산. 실제 결제 금액은 서버(/api/orders)가 다시 계산한 값을 쓴다 */
export function useCartLines() {
  const [lines, setLines] = useState<Line[] | null>(null);
  useEffect(() => {
    const sync = () =>
      setLines(
        readCart().flatMap((i) => {
          const p = BY_SLUG.get(i.slug);
          return p ? [{ slug: i.slug, qty: i.qty, product: p, orderable: typeof p.price === "number" && !p.soldOut }] : [];
        }),
      );
    sync();
    return onCartChange(sync);
  }, []);
  const ok = (lines ?? []).filter((l) => l.orderable);
  const subtotal = ok.reduce((s, l) => s + (l.product.price as number) * l.qty, 0);
  const shipping = ok.length ? SHIPPING_FEE : 0;
  return { lines, subtotal, shipping, total: subtotal + shipping, hasBlocked: (lines ?? []).some((l) => !l.orderable) };
}

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
