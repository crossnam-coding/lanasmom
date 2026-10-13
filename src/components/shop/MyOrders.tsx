"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { won } from "./useCartLines";

const LABEL: Record<string, string> = { paid: "접수", preparing: "만드는 중", shipped: "보냄", cancelled: "취소", review: "확인 중" };

export default function MyOrders() {
  const [d, setD] = useState<{ user?: { name: string | null; email: string | null }; orders?: { id: string; key: string; status: string; createdAt: string; total: number; items: { name: string; qty: number }[]; trackingNo: string | null }[] } | null>(null);

  useEffect(() => {
    fetch("/api/my/orders").then(async (r) => {
      if (r.status === 401) return location.replace("/login/?next=/my/");
      setD(await r.json());
    });
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/";
  }

  if (!d) return <p className="py-16 text-center text-[var(--ink-soft)]">불러오는 중…</p>;
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex items-center justify-between text-[14.5px]">
        <p>{d.user?.name ?? d.user?.email ?? "손님"}님</p>
        <button onClick={logout} className="text-[var(--ink-soft)] underline">로그아웃</button>
      </div>
      {d.orders?.length ? (
        <ul className="space-y-3">
          {d.orders.map((o) => (
            <li key={o.id}>
              <Link href={`/order/complete/?id=${o.id}&key=${o.key}`} className="block rounded-2xl border border-[var(--line)] bg-white p-5 hover:border-[var(--terra)]">
                <div className="flex justify-between text-[13px] text-[var(--ink-soft)]">
                  <span>{new Date(o.createdAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
                  <span className="font-semibold text-[var(--terra)]">{LABEL[o.status] ?? o.status}</span>
                </div>
                <p className="mt-2 font-semibold">{o.items[0]?.name}{o.items.length > 1 ? ` 외 ${o.items.length - 1}건` : ""}</p>
                <p className="text-[14px]">{won(o.total)}{o.trackingNo ? ` · 송장 ${o.trackingNo}` : ""}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-10 text-center text-[var(--ink-soft)]">아직 주문이 없어요. <Link href="/menu" className="text-[var(--terra)] underline">메뉴 보기</Link></p>
      )}
    </div>
  );
}
