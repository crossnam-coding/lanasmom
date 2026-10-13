import type { Metadata } from "next";
import Ship from "@/components/admin/Ship";

export const metadata: Metadata = { title: "배송" };
export default function AdminShipPage() {
  return <Ship />;
}
