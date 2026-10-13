"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/", label: "홈", icon: "🏠" },
  { href: "/admin/orders/", label: "주문", icon: "🧾" },
  { href: "/admin/ship/", label: "배송", icon: "📦" },
  { href: "/admin/cs/", label: "문의", icon: "💬" },
  { href: "/admin/settings/", label: "설정", icon: "⚙️" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = (usePathname() ?? "/admin/").replace(/\/?$/, "/");
  return (
    <div className="min-h-screen bg-[#f6f2ea] pb-24 text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/admin/" className="font-semibold">라나엄마 <span className="text-[var(--ink-soft)]">· 가게 관리</span></Link>
          <a href="/" target="_blank" rel="noopener" className="text-[13px] text-[var(--ink-soft)] underline">손님 화면 보기</a>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-5">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-3xl grid-cols-5">
          {TABS.map((t) => {
            const on = t.href === "/admin/" ? path === "/admin/" : path.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[12px] ${on ? "font-semibold text-[var(--terra)]" : "text-[var(--ink-soft)]"}`}>
                <span className="text-[19px] leading-none">{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
