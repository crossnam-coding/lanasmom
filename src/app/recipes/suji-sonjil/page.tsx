import type { Metadata } from "next";
import Link from "next/link";
import { DETAILS } from "@/data/products";

// 근거 = 사장님 2차 인터뷰 원문(2026-08-08 «스지 된장전골 7문») + 1차 인터뷰(프로젝트 CLAUDE.md I5)
//       + 레시피 카드 인쇄본(products.ts DETAILS 한우스지된장전골 howto·tips).
// 🔴 원문에 없는 단계·재료·시간을 넣지 않는다. (2026-11-06 정정: 근거 없던 손질 단계 전부 삭제)
// 주소(slug)는 링크가 깨지지 않게 그대로 둔다.

const SUJI = DETAILS["한우스지된장전골"];
const HOWTO = SUJI?.howto ?? [];
// 레시피 카드의 맛팁 3개 (라면 사리 · 냉이 · 된장죽)
const CARD_TIPS = (SUJI?.tips ?? []).filter((t) => /라면|냉이|된장죽/.test(t));

const TITLE = "한우 스지, 이렇게 고르고 이렇게 삶습니다";
const DESC =
  "한우 스지는 부위마다 식감이 달라, 직접 먹어보고 고른 부위만 씁니다. 어려운 건 삶는 과정 — 잡내는 잡고 본연의 맛은 살리는 균형입니다. 집에서 한우스지된장전골 끓이는 법까지 적었습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["스지 삶는 법", "한우 스지", "소 힘줄", "스지 잡내", "스지된장전골", "스지전골 끓이는 법"],
  alternates: { canonical: "/recipes/suji-sonjil" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "한우스지된장전골 끓이는 법 (2인분)",
  author: { "@type": "Organization", name: "라나엄마" },
  description:
    "라나엄마 한우스지된장전골(980g · 2인분)은 스지와 된장 육수를 조리가 끝난 상태로 보낸다. 해동한 육수·스지에 동봉된 채소와 버섯을 넣고 끓이면 된다.",
  recipeCategory: "전골",
  recipeCuisine: "Korean",
  recipeYield: "2인분",
  recipeIngredient: ["된장 육수 500g", "한우 스지 80g", "채소·두부·팽이버섯 400g"],
  recipeInstructions: HOWTO.map((t) => ({ "@type": "HowToStep", text: t })),
};

export default function SujiRecipe() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container-x max-w-3xl pt-14 pb-20 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">RECIPE</p>
        <h1 className="display text-[1.9rem] leading-[1.3] md:text-[2.4rem]">
          한우 스지,
          <br />
          이렇게 고르고 이렇게 삶습니다
        </h1>
        <p className="mt-6 text-[16.5px] leading-[1.9] text-[var(--ink-soft)]">
          스지 된장전골은 식당에서도 쉽게 보기 어려운 메뉴입니다. 좋은 부위를 골라 오랜 시간 삶아야 하고,
          원가 부담도 큰 편이라서입니다.
        </p>

        <section className="mt-12">
          <h2 className="display mb-5 text-[1.4rem]">이렇게 고릅니다</h2>
          <blockquote className="rounded-3xl bg-[var(--paper-2)] p-7 text-[15.5px] leading-[1.9]">
            &ldquo;사실 처음에는 스지에 대해 잘 아는 사람은 아니었습니다. 대신 저는 좋은 재료를 고르는 감각은 있는
            것 같습니다.&rdquo;
            <span className="mt-2 block text-[14px] text-[var(--ink-soft)]">— 라나엄마</span>
          </blockquote>
          <ul className="mt-6 space-y-3 text-[15.5px] leading-[1.85] text-[var(--ink-soft)]">
            <li>· 스지는 강원도에서 품질 좋은 것을 꾸준히 받습니다.</li>
            <li>
              · 스지는 부위마다 식감이 모두 다릅니다. 그래서 아무 부위나 쓰지 않고, 여러 부위를 직접 먹어보고
              비교했습니다.
            </li>
            <li>
              · 그렇게 고른 기준은 하나입니다.{" "}
              <strong className="text-[var(--ink)]">
                스지를 처음 드시는 분도, 스지에 거부감이 있는 분도 부담 없이 드실 수 있는 부위.
              </strong>
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="display mb-5 text-[1.4rem]">이렇게 삶습니다</h2>
          <p className="text-[15.5px] leading-[1.9] text-[var(--ink-soft)]">
            하루에 200개도 손질합니다. <strong className="text-[var(--ink)]">어려운 건 삶는 과정입니다.</strong>
          </p>
          <div className="my-8 rounded-3xl bg-[var(--rose)]/25 p-7">
            <p className="text-[15.5px] leading-[1.85]">
              <strong>잡내는 잡고, 스지 본연의 맛은 살린다.</strong>
              <span className="mt-2 block">그 사이의 균형을 맞추는 것이 전부입니다.</span>
            </p>
          </div>
          <p className="text-[15.5px] leading-[1.9] text-[var(--ink-soft)]">
            스지를 오랜 시간 삶아낸 육수에는 자연스럽게 젤라틴이 우러나오고, 스지에 붙어 있는 고기에서도 깊은
            구수함이 배어 나옵니다. 이 육수에 각각 장점이 있는 두 가지 된장을 배합해 전골 국물을 만듭니다.
          </p>
        </section>

        <section className="mt-14 rounded-3xl border border-[var(--line)] bg-white p-8">
          <h2 className="display mb-4 text-[1.2rem]">처음 드시는 분들이 놀라는 것</h2>
          <ul className="space-y-3 text-[15.5px] leading-[1.85] text-[var(--ink-soft)]">
            <li>· 식감입니다. 젤리처럼 부드럽고 쫀득한데, 고기가 적당히 붙어 있습니다.</li>
            <li>· 아이들도 정말 잘 먹어서 부모님들이 좋아하십니다.</li>
            <li>
              · &ldquo;원래 스지를 못 먹었는데 여기 스지를 먹고 처음으로 맛있게 먹게 됐다&rdquo;고 말씀해 주시는
              분들이 계십니다.
            </li>
          </ul>
        </section>

        <section className="mt-14">
          <h2 className="display mb-3 text-[1.4rem]">집에서 끓이는 법</h2>
          <p className="mb-7 text-[15px] leading-[1.85] text-[var(--ink-soft)]">
            라나엄마 한우스지된장전골(980g · 2인분)은 스지와 된장 육수를 조리가 끝난 상태로 보내드립니다.
            레시피 카드에 적힌 그대로 옮깁니다.
          </p>
          <ol className="space-y-6">
            {HOWTO.map((t, i) => (
              <li key={t} className="flex gap-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--terra)] text-[15px] font-semibold text-white">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-[15.5px] leading-[1.85] text-[var(--ink-soft)]">{t}</p>
              </li>
            ))}
          </ol>
          {CARD_TIPS.length > 0 && (
            <div className="mt-10 rounded-3xl bg-[var(--paper-2)] p-7">
              <h3 className="display mb-4 text-[17px]">이렇게 드시면 더 좋습니다</h3>
              <ul className="space-y-2.5 text-[15px] leading-[1.85] text-[var(--ink-soft)]">
                {CARD_TIPS.map((t) => (
                  <li key={t}>· {t}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <aside className="mt-14 rounded-3xl bg-[var(--paper-2)] p-8">
          <p className="text-[15px] leading-relaxed text-[var(--ink-soft)]">
            한우스지된장전골은 새 2인분 구성으로 와디즈에서 먼저 선보일 준비를 하고 있습니다.
          </p>
          <Link
            href="/menu/suji-doenjang-jeongol"
            className="mt-5 inline-block text-[15px] font-semibold text-[var(--terra)] underline"
          >
            한우스지된장전골 보러 가기 →
          </Link>
        </aside>
      </article>
    </>
  );
}
