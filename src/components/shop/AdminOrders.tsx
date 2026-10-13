"use client";
import { useCallback, useEffect, useState } from "react";

interface Item { name: string; size?: string; qty: number; price: number }
interface Order {
  id: string; created_at: string; status: string; name: string; phone: string; email: string | null;
  zipcode: string; address1: string; address2: string | null; memo: string | null; items: Item[];
  total: number; shipping: number; paid_at: string | null; tracking_no: string | null; admin_note: string | null; receipt_url: string | null;
}

const TABS = [
  { key: "todo", label: "할 일", statuses: ["paid", "preparing", "review"] },
  { key: "paid", label: "새 주문", statuses: ["paid"] },
  { key: "preparing", label: "만드는 중", statuses: ["preparing"] },
  { key: "shipped", label: "보냄", statuses: ["shipped"] },
  { key: "all", label: "전체", statuses: [] as string[] },
];
const LABEL: Record<string, string> = {
  paid: "새 주문", preparing: "만드는 중", shipped: "보냄", cancelled: "취소", review: "확인 필요", pending: "결제 전", failed: "결제 실패",
};
const COLOR: Record<string, string> = {
  paid: "bg-[var(--terra)] text-white", preparing: "bg-[var(--mint-deep)] text-white", shipped: "bg-[var(--line)]",
  review: "bg-red-600 text-white", cancelled: "bg-[var(--line)]",
};
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const kst = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

function b64ToBytes(b64: string) {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(b64.length / 4) * 4, "="));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [tab, setTab] = useState("todo");
  const [err, setErr] = useState("");
  const [push, setPush] = useState<{ state: string; devices: number }>({ state: "확인 중", devices: 0 });
  const [focus, setFocus] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/admin/orders", { cache: "no-store" });
    if (r.status === 401) return setErr("로그인이 풀렸어요. 화면을 새로고침해서 다시 로그인해 주세요.");
    const d = await r.json();
    setOrders(d.orders);
    setCounts(d.counts ?? {});
    setErr("");
  }, []);

  useEffect(() => {
    setFocus(new URLSearchParams(location.search).get("order"));
    load();
    const t = setInterval(load, 60_000);
    const onVis = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVis);
    checkPush();
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVis); };
  }, [load]);

  async function checkPush() {
    const d = await fetch("/api/admin/push").then((r) => r.json()).catch(() => ({ devices: 0 }));
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return setPush({ state: "unsupported", devices: d.devices });
    }
    const reg = await navigator.serviceWorker.getRegistration("/admin/");
    const sub = await reg?.pushManager.getSubscription();
    setPush({ state: sub ? "on" : Notification.permission === "denied" ? "denied" : "off", devices: d.devices });
  }

  async function enablePush() {
    try {
      const { publicKey } = await fetch("/api/admin/push").then((r) => r.json());
      if (!publicKey) throw new Error("알림 키가 아직 설정되지 않았어요.");
      const perm = await Notification.requestPermission();
      if (perm !== "granted") throw new Error("알림을 허용해 주셔야 해요.");
      const reg = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(publicKey) });
      const r = await fetch("/api/admin/push", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), label: navigator.userAgent.slice(0, 60) }),
      });
      if (!r.ok) throw new Error("알림 등록에 실패했어요.");
      await checkPush();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  async function testPush() {
    const r = await fetch("/api/admin/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "test" }) });
    const d = await r.json();
    setErr(d.push > 0 ? "" : "시험 알림을 보낼 기기가 없어요. 먼저 알림을 켜 주세요.");
  }

  async function update(id: string, patch: Record<string, string>) {
    const r = await fetch("/api/admin/orders", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, ...patch }) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error ?? "바꾸지 못했어요.");
    load();
  }

  const t = TABS.find((x) => x.key === tab)!;
  const shown = (orders ?? []).filter((o) => !t.statuses.length || t.statuses.includes(o.status));

  return (
    <div>
      <div className="mb-6 rounded-2xl bg-[var(--paper-2)] p-5 text-[14px]">
        {push.state === "on" && (
          <p>🔔 이 폰은 새 주문 알림을 받고 있어요 (알림 받는 기기 {push.devices}대) · <button className="underline" onClick={testPush}>시험 알림 보내기</button></p>
        )}
        {push.state === "off" && (
          <button onClick={enablePush} className="rounded-full bg-[var(--terra)] px-5 py-2.5 font-semibold text-white">🔔 이 폰으로 새 주문 알림 받기</button>
        )}
        {push.state === "denied" && <p>알림이 막혀 있어요. 폰 설정에서 이 사이트 알림을 허용해 주세요.</p>}
        {push.state === "unsupported" && (
          <p>아이폰은 <b>Safari 공유 버튼 → 홈 화면에 추가</b> 한 뒤, 홈 화면의 「라나엄마 주문」으로 열어야 알림을 켤 수 있어요.</p>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((x) => {
          const n = x.statuses.reduce((s, k) => s + (counts[k] ?? 0), 0);
          return (
            <button key={x.key} onClick={() => setTab(x.key)}
              className={`rounded-full px-4 py-2 text-[14px] ${tab === x.key ? "bg-[var(--ink)] text-white" : "border border-[var(--line)] bg-white"}`}>
              {x.label}{x.statuses.length > 0 && n > 0 ? ` ${n}` : ""}
            </button>
          );
        })}
        <button onClick={load} className="ml-auto text-[13px] underline">새로고침</button>
      </div>

      {err && <p className="mb-4 rounded-xl bg-red-50 p-3 text-[14px] text-red-700">{err}</p>}
      {orders === null && !err && <p className="py-10 text-center text-[var(--ink-soft)]">불러오는 중…</p>}
      {orders && shown.length === 0 && <p className="py-10 text-center text-[var(--ink-soft)]">여기는 비어 있어요.</p>}

      <ul className="space-y-4">
        {shown.map((o) => <OrderCard key={o.id} o={o} highlight={focus === o.id} onUpdate={update} />)}
      </ul>
    </div>
  );
}

function OrderCard({ o, highlight, onUpdate }: { o: Order; highlight: boolean; onUpdate: (id: string, p: Record<string, string>) => void }) {
  const [tracking, setTracking] = useState(o.tracking_no ?? "");
  const addr = `(${o.zipcode}) ${o.address1}${o.address2 ? " " + o.address2 : ""}`;
  return (
    <li className={`rounded-2xl border bg-white p-5 ${highlight ? "border-[var(--terra)] ring-2 ring-[var(--terra)]/30" : "border-[var(--line)]"}`}>
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className={`rounded-full px-2.5 py-0.5 font-semibold ${COLOR[o.status] ?? "bg-[var(--line)]"}`}>{LABEL[o.status] ?? o.status}</span>
        <span className="text-[var(--ink-soft)]">{kst(o.paid_at ?? o.created_at)}</span>
        <span className="ml-auto font-mono text-[12px] text-[var(--ink-soft)]">{o.id}</span>
      </div>
      <ul className="mt-3 space-y-1 text-[15.5px]">
        {o.items.map((i) => <li key={i.name}><b>{i.name}</b>{i.size ? ` (${i.size})` : ""} × {i.qty}</li>)}
      </ul>
      <p className="mt-1 text-[14px] text-[var(--ink-soft)]">결제 {won(o.total)} (배송비 {won(o.shipping)} 포함)</p>

      <div className="mt-4 space-y-1 rounded-xl bg-[var(--paper-2)] p-4 text-[14.5px]">
        <p><b>{o.name}</b> · <a href={`tel:${o.phone}`} className="underline">{o.phone}</a></p>
        <p>{addr} <button className="ml-1 text-[12.5px] underline" onClick={() => navigator.clipboard?.writeText(`${o.name} ${o.phone} ${addr}`)}>복사</button></p>
        {o.memo && <p>📝 {o.memo}</p>}
        {o.admin_note && <p className="text-red-700">⚠️ {o.admin_note}</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {o.status === "paid" && (
          <button onClick={() => onUpdate(o.id, { status: "preparing" })} className="rounded-full bg-[var(--mint-deep)] px-4 py-2 text-[14px] font-semibold text-white">만들기 시작</button>
        )}
        {(o.status === "paid" || o.status === "preparing") && (
          <>
            <input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="송장번호"
              className="w-40 rounded-full border border-[var(--line)] px-4 py-2 text-[14px]" inputMode="numeric" />
            <button onClick={() => onUpdate(o.id, { status: "shipped", trackingNo: tracking })}
              className="rounded-full bg-[var(--terra)] px-4 py-2 text-[14px] font-semibold text-white">보냈어요</button>
          </>
        )}
        {o.status === "shipped" && <p className="text-[14px]">송장 {o.tracking_no ?? "—"}</p>}
        {["paid", "preparing", "review"].includes(o.status) && (
          <button
            onClick={() => {
              if (confirm("주문을 취소로 표시할까요?\n⚠️ 여기서 취소해도 환불은 되지 않아요. 포트원 관리자 화면에서 결제 취소를 꼭 같이 해 주세요."))
                onUpdate(o.id, { status: "cancelled" });
            }}
            className="ml-auto text-[13px] text-[var(--ink-soft)] underline">취소로 표시</button>
        )}
      </div>
    </li>
  );
}
