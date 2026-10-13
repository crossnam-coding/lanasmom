import type { Metadata } from "next";
import Orders from "@/components/admin/Orders";

export const metadata: Metadata = { title: "주문" };
export default function AdminOrdersPage() {
  return <Orders />;
}
