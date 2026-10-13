import type { Metadata } from "next";
import Cs from "@/components/admin/Cs";

export const metadata: Metadata = { title: "문의" };
export default function AdminCsPage() {
  return <Cs />;
}
