"use client";
import { usePathname } from "next/navigation";

/** 사장님 관리 화면(/admin)에서는 손님 사이트의 머리말·꼬리말을 숨긴다 */
export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "";
  if (path.startsWith("/admin")) return null;
  return <>{children}</>;
}
