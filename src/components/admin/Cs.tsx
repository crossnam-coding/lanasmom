"use client";
import { useCallback, useEffect, useState } from "react";
import OrderCard, { type Order } from "./OrderCard";
import { api, kst } from "./lib";

interface Inq { id: string; name: string; email: string | null; phone: string | null; kind: string; kindLabel: string; status: string; updated_at: string; order_id: string | null; last_body?: string; last_sender?: string; link?: string }
const TABS = [{ k: "open", l: "답할 것" }, { k: "answered", l: "답함" }, { k: "closed", l: "끝남" }, { k: "all", l: "전체" }];
const TEMPLATES = [
  { l: "배송 안내", t: "안녕하세요, 라나엄마입니다. 문의 주셔서 감사합니다.\n주문하신 음식은 ○월 ○일에 보내드릴 예정이에요. 보내드리면 송장번호를 바로 알려드릴게요." },
  { l: "환불 완료", t: "안녕하세요, 라나엄마입니다. 불편을 드려 정말 죄송합니다.\n요청하신 환불을 처리했어요. 카드사 사정에 따라 취소가 반영되기까지 며칠 걸릴 수 있어요." },
  { l: "사진 요청", t: "안녕하세요, 라나엄마입니다. 불편을 드려 죄송합니다.\n받으신 상태를 사진으로 한 장 보내주시면 바로 확인하고 다시 보내드리거나 환불해 드릴게요." },
];

export default function Cs() {
  const [tab, setTab] = useState("open");
  const [list, setList] = useState<Inq[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async (t = tab) => {
    try { const d = await api<{ inquiries: Inq[]; counts: Record<string, number> }>(`/api/admin/inquiries?status=${t}`); setList(d.inquiries); setCounts(d.counts); setErr(""); }
    catch (e) { setErr((e as Error).message); }
  }, [tab]);
  useEffect(() => { const id = new URLSearchParams(location.search).get("id"); if (id) setSel(id); load(); }, [load]);

  if (sel) return <Thread id={sel} onBack={() => { setSel(null); history.replaceState(null, "", "/admin/cs/"); load(); }} />;
  return (
    <div>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.k} onClick={() => { setTab(t.k); load(t.k); }} className={`shrink-0 rounded-full px-4 py-2 text-[14px] ${tab === t.k ? "bg-[var(--ink)] text-white" : "bg-white"}`}>
            {t.l}{t.k !== "all" && counts[t.k] ? ` ${counts[t.k]}` : ""}
          </button>
        ))}
      </div>
      {err && <p className="mb-3 rounded-xl bg-red-50 p-3 text-red-700">{err}</p>}
      {list && list.length === 0 && <p className="py-10 text-center text-[var(--ink-soft)]">{tab === "open" ? "답할 문의가 없어요 👍" : "문의가 없어요."}</p>}
      <ul className="space-y-2">
        {list?.map((q) => (
          <li key={q.id}>
            <button onClick={() => setSel(q.id)} className="w-full rounded-2xl bg-white p-4 text-left">
              <div className="flex items-center gap-2 text-[12.5px]">
                <span className="rounded-full bg-[#f6f2ea] px-2.5 py-0.5">{q.kindLabel}</span>
                {q.order_id && <span className="text-[var(--ink-soft)]">주문 문의</span>}
                <span className="ml-auto text-[var(--ink-soft)]">{kst(q.updated_at)}</span>
              </div>
              <p className="mt-1.5 font-semibold">{q.name}</p>
              <p className="line-clamp-2 text-[14px] text-[var(--ink-soft)]">{q.last_sender === "admin" ? "↪ 내 답장: " : ""}{q.last_body}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Thread({ id, onBack }: { id: string; onBack: () => void }) {
  const [d, setD] = useState<{ inquiry: Inq; messages: { sender: string; body: string; at: string }[]; order: Order | null } | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [err, setErr] = useState("");
  const load = useCallback(() => api(`/api/admin/inquiries/${id}`).then(setD).catch((e) => setErr(e.message)), [id]);
  useEffect(() => { load(); }, [load]);

  async function send() {
    setBusy(true); setErr(""); setInfo("");
    try {
      const r = await api<{ mailed: boolean; phone: string | null }>(`/api/admin/inquiries/${id}`, { method: "POST", json: { action: "reply", body: reply } });
      setReply("");
      setInfo(r.mailed ? "답장을 보냈고, 손님께 메일로 알렸어요." : "답장을 저장했어요. 손님이 메일을 안 남기셔서, 아래 「문자로 알리기」를 눌러 주세요.");
      load();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  }
  async function setStatus(action: string) { await api(`/api/admin/inquiries/${id}`, { method: "POST", json: { action } }); onBack(); }

  if (!d) return <p className="py-10 text-center text-[var(--ink-soft)]">{err || "불러오는 중…"}</p>;
  const q = d.inquiry;
  const sms = q.phone ? `sms:${q.phone}?&body=${encodeURIComponent(`라나엄마입니다. 문의하신 내용에 답변을 드렸어요. 여기서 확인해 주세요: ${q.link}`)}` : null;
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-[14px] underline">← 문의 목록</button>
      <div className="rounded-2xl bg-white p-4">
        <p className="text-[12.5px] text-[var(--ink-soft)]">{q.kindLabel} · {q.id}</p>
        <p className="mt-1 font-semibold">{q.name}</p>
        <p className="text-[14px]">
          {q.phone && <a href={`tel:${q.phone}`} className="underline">{q.phone}</a>}{q.phone && q.email ? " · " : ""}{q.email}
        </p>
      </div>
      <ul className="space-y-2">
        {d.messages.map((m, i) => (
          <li key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl p-3 text-[14.5px] ${m.sender === "admin" ? "ml-auto bg-[var(--terra)] text-white" : "bg-white"}`}>
            {m.body}
            <p className={`mt-1 text-[11px] ${m.sender === "admin" ? "text-white/80" : "text-[var(--ink-soft)]"}`}>{kst(m.at)}</p>
          </li>
        ))}
      </ul>
      <div className="rounded-2xl bg-white p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => <button key={t.l} type="button" onClick={() => setReply(t.t)} className="rounded-full bg-[#f6f2ea] px-3 py-1 text-[12.5px]">{t.l}</button>)}
        </div>
        <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={5} placeholder="답장 쓰기" className="w-full rounded-xl border border-[var(--line)] p-3 text-[15px]" />
        <div className="mt-2 flex flex-wrap gap-2">
          <button disabled={busy || !reply.trim()} onClick={send} className="rounded-full bg-[var(--terra)] px-5 py-2.5 text-[14.5px] font-semibold text-white disabled:opacity-50">답장 보내기</button>
          {sms && <a href={sms} className="rounded-full border border-[var(--line)] px-4 py-2.5 text-[14px]">💬 문자로 알리기</a>}
          {q.status !== "closed"
            ? <button onClick={() => setStatus("close")} className="ml-auto text-[13px] text-[var(--ink-soft)] underline">끝난 문의로</button>
            : <button onClick={() => setStatus("reopen")} className="ml-auto text-[13px] underline">다시 열기</button>}
        </div>
        {info && <p className="mt-2 text-[13.5px] text-[#2f6f68]">{info}</p>}
        {err && <p className="mt-2 text-[13.5px] text-red-700">{err}</p>}
      </div>
      {d.order && (
        <div>
          <p className="mb-2 text-[13px] font-semibold text-[var(--ink-soft)]">이 문의의 주문 — 여기서 바로 환불·재발송 처리할 수 있어요</p>
          <ul><OrderCard o={d.order} open onChanged={load} /></ul>
        </div>
      )}
    </div>
  );
}
