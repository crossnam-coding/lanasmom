import type { Metadata } from "next";
import AdminShell from "@/components/admin/AdminShell";

/** 사장님 전용. Cloudflare Access 가 /admin 앞에서 로그인(이메일 일회용 코드)을 받는다 */
export const metadata: Metadata = {
  title: { default: "가게 관리", template: "%s · 라나엄마 가게 관리" },
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: { capable: true, title: "라나엄마 주문", statusBarStyle: "default" },
  icons: { apple: "/admin/icon-192.png" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
