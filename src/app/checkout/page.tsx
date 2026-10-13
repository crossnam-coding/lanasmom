import type { Metadata } from "next";
import CheckoutForm from "@/components/shop/CheckoutForm";

export const metadata: Metadata = { title: "주문하기", robots: { index: false, follow: false } };

export default function CheckoutPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-10 text-[1.8rem]">주문하기</h1>
      <CheckoutForm />
    </section>
  );
}
