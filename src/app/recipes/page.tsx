import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "만드는 법",
  description:
    "라나엄마가 실제로 쓰는 조리법을 그대로 공개합니다. 한우 장조림 질기지 않게 만드는 법, 스지 손질법, 곰탕 국물 맑게 내는 법.",
  alternates: { canonical: "/recipes" },
};

export const RECIPES = [
  {
    slug: "hanwoo-jangjorim",
    title: "한우 장조림, 질기지 않게 만드는 법",
    desc: "고기가 결대로 찢어지지 않고 야들야들하게 남는 이유는 삶는 시간이 아니라 식히는 방법에 있습니다.",
    time: "약 3시간",
    ready: true,
  },
  {
    slug: "suji-sonjil",
    title: "스지(소 힘줄) 손질하는 법",
    desc: "식당에서도 잘 안 파는 이유가 있습니다. 손질에 반나절이 걸리거든요.",
    time: "약 6시간 30분",
    ready: true,
  },
  {
    slug: "gomtang",
    title: "양지곰탕 국물 맑게 내는 법",
    desc: "뽀얀 국물과 맑은 국물은 끓이는 온도가 다릅니다.",
    time: "약 6시간",
    ready: true,
  },
];

export default function RecipesIndex() {
  return (
    <>
      <section className="container-x pt-14 pb-10 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">RECIPES</p>
        <h1 className="display text-[2rem] md:text-[2.6rem]">만드는 법</h1>
        <p className="mt-5 max-w-2xl text-[16px] text-[var(--ink-soft)]">
          라나엄마가 실제로 쓰는 방법을 그대로 적어 둡니다.
          숨길 이유가 없습니다. 해 보시면 아시거든요 &mdash; 좋은 재료와 긴 시간이 전부라는 걸.
        </p>
      </section>

      <section className="container-x pb-24">
        <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {RECIPES.map((r) =>
            r.ready ? (
              <Link key={r.slug} href={`/recipes/${r.slug}`} className="group block py-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="display text-[18px] group-hover:text-[var(--terra)]">{r.title}</h2>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
                      {r.desc}
                    </p>
                  </div>
                  <span className="shrink-0 text-[13px] text-[var(--ink-soft)]">{r.time}</span>
                </div>
              </Link>
            ) : (
              <div key={r.slug} className="py-7 opacity-55">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h2 className="display text-[18px]">{r.title}</h2>
                    <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[var(--ink-soft)]">
                      {r.desc}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[var(--paper-2)] px-3 py-1 text-[12px]">
                    준비 중
                  </span>
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    </>
  );
}
