import type { Metadata } from "next";
import CartView from "@/components/shop/CartView";

export const metadata: Metadata = { title: "장바구니", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-10 text-[1.8rem]">장바구니</h1>
      <CartView />
    </section>
  );
}
