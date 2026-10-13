import type { Metadata } from "next";
import Settings from "@/components/admin/Settings";

export const metadata: Metadata = { title: "설정" };
export default function AdminSettingsPage() {
  return <Settings />;
}
