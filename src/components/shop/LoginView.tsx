"use client";
import { useEffect, useState } from "react";

const BTN: Record<string, { label: string; cls: string }> = {
  kakao: { label: "카카오로 시작하기", cls: "bg-[#FEE500] text-[#191919]" },
  naver: { label: "네이버로 시작하기", cls: "bg-[#03C75A] text-white" },
  google: { label: "구글로 시작하기", cls: "border border-[var(--line)] bg-white text-[var(--ink)]" },
  toss: { label: "토스로 시작하기", cls: "bg-[#0064FF] text-white" },
};
const ERR: Record<string, string> = {
  state: "로그인 요청이 만료됐어요. 다시 눌러 주세요.",
  cancelled: "로그인을 취소했어요.",
  failed: "로그인하지 못했어요. 잠시 뒤 다시 시도해 주세요.",
  expired: "로그인 링크가 만료됐어요. 새 링크를 받아 주세요.",
  not_ready: "그 로그인은 아직 준비 중이에요.",
};

export default function LoginView() {
  const [providers, setProviders] = useState<string[] | null>(null);
  const [next, setNext] = useState("/my/");
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setNext(q.get("next") ?? "/my/");
    setErr(ERR[q.get("error") ?? ""] ?? "");
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) location.replace(q.get("next") ?? "/my/");
      else setProviders(d.providers ?? []);
    }).catch(() => setProviders([]));
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/auth/email-start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, next }) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error ?? "보내지 못했어요.");
    setSent(true);
  }

  if (providers === null) return <p className="py-16 text-center text-[var(--ink-soft)]">불러오는 중…</p>;
  const social = providers.filter((p) => p !== "email");
  return (
    <div className="mx-auto max-w-sm">
      <p className="mb-8 text-center text-[15px] leading-relaxed text-[var(--ink-soft)]">
        로그인하면 지난 주문과 배송 상태를 한곳에서 볼 수 있어요.<br />로그인 없이도 주문할 수 있어요.
      </p>
      {err && <p className="mb-4 rounded-xl bg-red-50 p-3 text-center text-[14px] text-red-700">{err}</p>}
      <div className="space-y-3">
        {social.map((p) => (
          <a key={p} href={`/api/auth/${p}/start?next=${encodeURIComponent(next)}`}
            className={`block rounded-xl px-5 py-3.5 text-center text-[15px] font-semibold ${BTN[p]?.cls ?? ""}`}>
            {BTN[p]?.label ?? p}
          </a>
        ))}
      </div>
      {providers.includes("email") && (
        sent ? (
          <p className="mt-6 rounded-xl bg-[var(--paper-2)] p-4 text-center text-[14.5px]">{email} 로 로그인 링크를 보냈어요. 메일함을 확인해 주세요.</p>
        ) : (
          <form onSubmit={sendLink} className="mt-6 space-y-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 주소"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-[15px]" autoComplete="email" />
            <button className="w-full rounded-xl border border-[var(--ink)] px-5 py-3.5 text-[15px] font-semibold">이메일로 로그인 링크 받기</button>
          </form>
        )
      )}
      {providers.length === 0 && <p className="text-center text-[14px] text-[var(--ink-soft)]">로그인은 준비 중이에요.</p>}
      <a href="/cart" className="mt-8 block text-center text-[14px] text-[var(--ink-soft)] underline">로그인 없이 주문하기</a>
    </div>
  );
}
