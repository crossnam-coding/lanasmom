import type { Metadata } from "next";
import { SHIPPING_FEE } from "@/data/products";

export const metadata: Metadata = {
  title: "소개와 안내",
  description:
    "라나엄마의 사업자 정보, 작업장 위치, 배송과 보관 안내입니다. 경기도 광주시 오포로에서 만들어 직접 보내드립니다.",
  alternates: { canonical: "/about" },
};

const FAQ = [
  {
    q: "배송은 어떻게 되나요?",
    a: "국과 탕은 냉동, 반찬은 냉장으로 아이스박스에 담아 보내드립니다. 배송비는 4,000원입니다.",
  },
  {
    q: "얼마나 두고 먹을 수 있나요?",
    a: "냉동 제품은 받으신 뒤 냉동실에 두시면 됩니다. 냉장 반찬은 되도록 일주일 안에 드시는 것을 권합니다. 자세한 소비기한은 제품 라벨에 적혀 있습니다.",
  },
  {
    q: "장조림은 어떻게 먹는 게 제일 맛있나요?",
    a: "냉장고에서 해동하신 뒤 먹을 만큼만 덜어 전자레인지에 살짝 데우시면 방금 만든 것처럼 됩니다. 고기를 먹고 남은 간장은 밥에 비벼 드셔도 좋습니다.",
  },
  {
    q: "선물로 보낼 수 있나요?",
    a: "네. 보자기 리본과 손편지 카드를 함께 넣어 받으실 분 주소로 바로 보내드립니다. 주문 시 요청사항에 적어 주세요.",
  },
  {
    q: "아이가 먹어도 되나요?",
    a: "아이에게 먹이려고 만들기 시작한 음식입니다. 간을 세게 하지 않습니다. 어린 아이에게 주실 때는 고기를 조금 더 잘게 잘라 주세요.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="container-x pt-14 pb-12 md:pt-20">
        <h1 className="display text-[2rem] md:text-[2.6rem]">소개와 안내</h1>
      </section>

      <section className="container-x pb-16">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--line)] bg-white p-8">
            <h2 className="display mb-5 text-[1.25rem]">만드는 곳</h2>
            <dl className="space-y-3 text-[15px]">
              {[
                ["상호", "라나엄마 (Lana's mom)"],
                ["대표", "●●●"],
                ["사업자등록번호", "●●●-●●-●●●●●"],
                ["영업신고번호", "●●●●●●●"],
                ["작업장", "경기도 광주시 오포로 683"],
                ["문의", "●●●-●●●●-●●●●"],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4">
                  <dt className="w-32 shrink-0 text-[var(--ink-soft)]">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-[13px] leading-relaxed text-[var(--ink-soft)]">
              즉석판매제조가공업 영업신고를 하고, 소비자분들께 직접 택배로만 보내드립니다.
              모든 제품에는 제품명·내용량·원재료명·소비기한·알레르기 정보를 낱개마다 표시합니다.
            </p>
          </div>

          <div className="rounded-3xl bg-[var(--paper-2)] p-8">
            <h2 className="display mb-5 text-[1.25rem]">배송 안내</h2>
            <ul className="space-y-3 text-[15px] text-[var(--ink-soft)]">
              <li>· 배송비 {SHIPPING_FEE.toLocaleString("ko-KR")}원</li>
              <li>· 국·탕은 냉동, 반찬은 냉장으로 보내드립니다</li>
              <li>· 아이스박스와 아이스팩을 함께 넣습니다</li>
              <li>· 만드는 대로 보내드리기 때문에 주문이 몰리면 하루 이틀 늦어질 수 있습니다</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x pb-24">
        <h2 className="display mb-8 text-[1.5rem]">자주 묻는 것</h2>
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="display text-[16.5px]">{f.q}</span>
                <span className="text-[var(--terra)] transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink-soft)]">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
