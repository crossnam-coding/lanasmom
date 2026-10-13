import type { Metadata } from "next";
import OrderComplete from "@/components/shop/OrderComplete";

export const metadata: Metadata = { title: "주문 확인", robots: { index: false, follow: false } };

export default function OrderCompletePage() {
  return (
    <section className="container-x py-14 md:py-20">
      <OrderComplete />
    </section>
  );
}
