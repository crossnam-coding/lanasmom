import type { Metadata } from "next";
import AdminOrders from "@/components/shop/AdminOrders";

/** Cloudflare Access 가 이 경로 앞에서 로그인(이메일 일회용 코드)을 받는다 */
export const metadata: Metadata = {
  title: "주문 관리",
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "라나엄마 주문", statusBarStyle: "default" },
  icons: { apple: "/admin/icon-192.png" },
};

export default function AdminPage() {
  return (
    <section className="container-x py-10 md:py-14">
      <h1 className="display mb-6 text-[1.6rem]">주문 관리</h1>
      <AdminOrders />
    </section>
  );
}
