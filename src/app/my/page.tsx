import type { Metadata } from "next";
import MyOrders from "@/components/shop/MyOrders";

export const metadata: Metadata = { title: "내 주문", robots: { index: false, follow: false } };

export default function MyPage() {
  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display mb-8 text-center text-[1.8rem]">내 주문</h1>
      <MyOrders />
    </section>
  );
}
