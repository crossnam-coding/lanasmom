import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "스지(소 힘줄), 잡내 없이 삶는 법",
  description:
    "스지는 손질보다 삶는 과정이 어렵습니다. 잡내는 잡고 스지 본연의 맛은 남기는 것 — 그 균형이 전부입니다. 라나엄마가 실제로 쓰는 방법을 적었습니다.",
  keywords: ["스지 삶는 법", "스지 손질", "소 힘줄", "스지 잡내", "스지된장", "스지전골"],
  alternates: { canonical: "/recipes/suji-sonjil" },
};

const INGREDIENTS = [
  "소 힘줄(스지) 1kg",
  "물 (넉넉히)",
  "대파 2대, 양파 1개, 통마늘 10쪽",
  "통후추 15알, 월계수잎 2장",
  "청주 또는 소주 1/2컵",
];

const STEPS = [
  {
    name: "찬물에 담가 둡니다",
    text: "찬물에 2~3시간 담가 둡니다. 중간에 물을 두세 번 갈아 줍니다. 손질 자체는 어렵지 않습니다. 겉의 이물질을 훑어내고 큼직하게 잘라 두면 됩니다.",
  },
  {
    name: "초벌로 한 번 삶아 버립니다",
    text: "끓는 물에 5분간 삶고 물을 전부 버립니다. 이때 나오는 회색 거품과 기름이 잡내의 시작점입니다. 찬물에 헹궈 표면을 손으로 훑어 냅니다.",
  },
  {
    name: "향채와 함께 본삶기 — 여기가 전부입니다",
    text: "스지는 손질보다 삶는 과정이 어렵습니다. 잡내를 잡겠다고 향을 세게 쓰면 스지 본연의 고소한 맛까지 덮여 버리고, 약하게 하면 냄새가 남습니다. 대파·양파·통마늘·통후추·월계수잎·청주를 넣고, 끓어오르면 불을 줄여 2시간~2시간 30분. 젓가락이 쑥 들어가되 형태는 남아 있어야 합니다.",
  },
  {
    name: "식히면서 기름을 걷습니다",
    text: "국물째 식히면 기름이 위에 하얗게 굳습니다. 숟가락으로 걷어 냅니다. 이 국물은 버리지 마세요. 된장을 풀면 그게 스지된장의 바탕이 됩니다.",
  },
  {
    name: "완전히 식은 뒤에 썹니다",
    text: "뜨거울 때 썰면 흐물거려서 두께가 안 맞습니다. 다 식은 다음 한 입 크기로 도톰하게 썰어 주세요.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "스지(소 힘줄), 잡내 없이 삶는 법",
  author: { "@type": "Organization", name: "라나엄마" },
  description:
    "스지 요리의 핵심은 손질이 아니라 삶는 과정이다. 향채를 세게 쓰면 스지 본연의 고소한 맛이 덮이고, 약하면 잡내가 남는다. 초벌로 한 번 삶아 버린 뒤 향채와 함께 2시간 30분 약불로 삶고, 식히면서 기름을 걷어낸다. 그 국물에 된장을 풀면 스지된장이 된다.",
  recipeCategory: "재료 손질",
  recipeCuisine: "Korean",
  recipeYield: "1kg 기준",
  prepTime: "PT3H",
  cookTime: "PT2H30M",
  totalTime: "PT5H30M",
  recipeIngredient: INGREDIENTS,
  recipeInstructions: STEPS.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })),
};

export default function SujiRecipe() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container-x max-w-3xl pt-14 pb-20 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">RECIPE</p>
        <h1 className="display text-[1.9rem] leading-[1.3] md:text-[2.4rem]">
          스지(소 힘줄),
          <br />
          잡내 없이 삶는 법
        </h1>
        <p className="mt-6 text-[16.5px] leading-[1.9] text-[var(--ink-soft)]">
          스지는 먹고 싶어도 먹을 데가 마땅치 않습니다.
          손질이 어려워서가 아닙니다. 손질은 사실 어렵지 않습니다.
          <strong className="text-[var(--ink)]"> 어려운 건 삶는 과정입니다.</strong>
        </p>

        <div className="my-10 rounded-3xl bg-[var(--rose)]/25 p-7">
          <p className="text-[15.5px] leading-[1.85]">
            <strong>이 요리의 전부는 균형입니다</strong>
            <br />
            <span className="mt-2 block">
              잡내를 잡겠다고 향을 세게 쓰면 <strong>스지 본연의 고소한 맛까지 덮여</strong> 버립니다.
            </span>
            <span className="mt-1.5 block">
              그렇다고 약하게 하면 <strong>특유의 냄새가 남습니다.</strong>
            </span>
            <span className="mt-1.5 block">그 사이를 맞추는 게 스지 요리의 전부입니다.</span>
          </p>
        </div>

        <section className="rounded-3xl bg-[var(--paper-2)] p-7 md:p-8">
          <h2 className="display mb-4 text-[1.2rem]">재료 (1kg 기준)</h2>
          <ul className="space-y-2 text-[15.5px] text-[var(--ink-soft)]">
            {INGREDIENTS.map((i) => (
              <li key={i}>· {i}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="display mb-7 text-[1.4rem]">삶는 순서</h2>
          <ol className="space-y-8">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--terra)] text-[15px] font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="display text-[17px]">{s.name}</h3>
                  <p className="mt-2 text-[15.5px] leading-[1.85] text-[var(--ink-soft)]">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-3xl border border-[var(--line)] bg-white p-8">
          <h2 className="display mb-4 text-[1.2rem]">삶은 국물은 버리지 마세요</h2>
          <p className="text-[15.5px] leading-[1.9] text-[var(--ink-soft)]">
            기름을 걷어낸 그 국물이 스지된장의 바탕입니다. 된장을 풀고 무와 대파를 넣어 끓이면
            스지 된장전골이 됩니다. 얼큰하게 드시려면 청양고추를 넣으시고,
            마지막에 라면 사리를 넣으면 한 끼가 두 끼가 됩니다.
          </p>
          <p className="mt-4 text-[14px] text-[var(--mint-deep)]">
            ※ 스지 된장전골은 라나엄마에서 곧 만나 보실 수 있게 준비하고 있습니다.
          </p>
        </section>

        <aside className="mt-14 rounded-3xl bg-[var(--paper-2)] p-8">
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
            읽으시고 &ldquo;이건 좀…&rdquo; 하셨다면 정상입니다. 저도 처음엔 그랬습니다.
            그래도 다른 국이 필요하시면, 이미 끓여 둔 것들이 있습니다.
          </p>
          <Link href="/menu" className="mt-5 inline-block text-[15px] font-semibold text-[var(--terra)] underline">
            국·탕 보러 가기 →
          </Link>
        </aside>
      </article>
    </>
  );
}
