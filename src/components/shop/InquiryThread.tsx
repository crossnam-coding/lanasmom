"use client";
import { useCallback, useEffect, useState } from "react";

export default function InquiryThread() {
  const [ids, setIds] = useState<{ id: string; key: string } | null>(null);
  const [d, setD] = useState<{ kind: string; status: string; orderId: string | null; messages: { sender: string; body: string; at: string }[] } | null>(null);
  const [err, setErr] = useState("");
  const [body, setBody] = useState("");

  const load = useCallback(async (x = ids) => {
    if (!x) return;
    const r = await fetch(`/api/inquiries/${encodeURIComponent(x.id)}?key=${encodeURIComponent(x.key)}`);
    if (!r.ok) return setErr("문의를 찾을 수 없어요.");
    setD(await r.json());
  }, [ids]);
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const x = { id: q.get("id") ?? "", key: q.get("key") ?? "" };
    setIds(x); load(x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!ids || !body.trim()) return;
    const r = await fetch(`/api/inquiries/${encodeURIComponent(ids.id)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: ids.key, body }) });
    if (r.ok) { setBody(""); load(); } else setErr((await r.json()).error ?? "보내지 못했어요.");
  }

  if (err) return <p className="py-16 text-center">{err}</p>;
  if (!d) return <p className="py-16 text-center text-[var(--ink-soft)]">불러오는 중…</p>;
  return (
    <div className="mx-auto max-w-lg space-y-3">
      <p className="text-[13px] text-[var(--ink-soft)]">{d.kind} 문의{d.orderId ? ` · 주문 ${d.orderId}` : ""} · {d.status === "answered" ? "답변 완료" : d.status === "closed" ? "끝남" : "확인 중"}</p>
      <ul className="space-y-2">
        {d.messages.map((m, i) => (
          <li key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-3 text-[15px] ${m.sender === "admin" ? "bg-[var(--paper-2)]" : "ml-auto bg-white border border-[var(--line)]"}`}>
            {m.sender === "admin" && <p className="mb-1 text-[12px] font-semibold text-[var(--terra)]">라나엄마</p>}
            {m.body}
            <p className="mt-1 text-[11px] text-[var(--ink-soft)]">{new Date(m.at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
          </li>
        ))}
      </ul>
      <form onSubmit={send} className="flex gap-2 pt-2">
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="더 남길 말이 있으면" className="flex-1 rounded-xl border border-[var(--line)] bg-white px-4 py-3" maxLength={2000} />
        <button className="rounded-xl bg-[var(--terra)] px-4 font-semibold text-white">보내기</button>
      </form>
    </div>
  );
}
