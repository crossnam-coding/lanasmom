import type { Metadata } from "next";
import Image from "next/image";
import { PRODUCTS, storeUrl, formatPrice } from "@/data/products";

export const metadata: Metadata = {
  title: "한우 장조림, 퍽퍽하지 않게 만드는 법",
  description:
    "장조림이 퍽퍽해지는 건 조리법이 아니라 고기 때문입니다. 라나엄마가 실제로 쓰는 방법 — 핏물을 빼지 않고 곰탕처럼 끓이는 이유, 손으로 지방을 정리하는 과정, 간장에 하루 재우기까지.",
  keywords: ["장조림 만드는 법", "한우장조림", "소고기장조림", "장조림 레시피", "장조림 퍽퍽", "아이 장조림"],
  alternates: { canonical: "/recipes/hanwoo-jangjorim" },
};

const INGREDIENTS = [
  "한우 양지 (1++ 등급) 600g — 지방이 적당히 섞인 부위로",
  "물 (고기가 잠길 만큼)",
  "진간장 1컵 (200ml)",
  "설탕 3큰술",
  "국내산 마늘 10쪽",
  "청양고추 2개",
  "통후추 10알",
];

const STEPS = [
  {
    name: "고기부터 고릅니다 — 여기가 전부입니다",
    text: "장조림이 퍽퍽한 건 오래 삶아서가 아니라 고기 때문입니다. 지방이 아예 없는 부위를 쓰면 아무리 잘 삶아도 씹다가 입에서 퍽퍽해집니다. 지방이 적당히 섞여 씹을수록 고소한 부위를 고르세요. 시중에서 흔히 장조림용이라고 파는 부위와는 다릅니다.",
  },
  {
    name: "핏물은 빼지 않습니다",
    text: "많은 조리법이 핏물을 빼라고 합니다. 저희는 빼지 않습니다. 핏물을 빼면 고기 육수의 깊은 맛까지 같이 빠져나가기 때문입니다. 대신 곰탕 끓이듯 올려서, 떠오르는 불순물만 국자로 걷어냅니다. 좋은 고기여야 이렇게 할 수 있습니다.",
  },
  {
    name: "약 2시간 삶습니다",
    text: "일반 솥에서 2시간 정도면 충분합니다. 젓가락이 쑥 들어가되 형태는 남아 있어야 합니다. 이 국물은 버리지 마세요. 뒤에 조릴 때 씁니다.",
  },
  {
    name: "손으로 찢으면서 지방을 정리합니다 — 제일 오래 걸립니다",
    text: "삶는 시간보다 이 과정이 훨씬 오래 걸립니다. 소마다 지방이 붙은 모양이 다 다릅니다. 고기를 맛있게 해주는 지방은 남기고, 뭉쳐 있는 지방만 하나씩 떼어냅니다. 결을 따라 도톰하게 찢으세요. 너무 얇게 찢으면 조릴 때 부서집니다.",
  },
  {
    name: "조립니다",
    text: "고기 삶은 국물에 간장·설탕·마늘을 넣고 끓입니다. 찢은 고기를 넣고 중약불에서 20분. 마지막에 청양고추를 넣고 5분 더. 간은 세게 하지 마세요. 아이가 국물을 떠먹어도 될 정도가 좋습니다.",
  },
  {
    name: "간장에 하루 재웁니다",
    text: "바로 드셔도 되지만, 하루 두면 간이 속까지 뱁니다. 라나엄마는 전날 준비해서 이틀에 걸쳐 완성합니다. 남은 간장은 버리지 말고 밥에 비벼 드세요.",
  },
];

const recipeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "한우 장조림, 퍽퍽하지 않게 만드는 법",
  author: { "@type": "Organization", name: "라나엄마" },
  description:
    "장조림이 퍽퍽해지는 원인은 조리법이 아니라 고기 부위다. 지방이 적당히 섞인 부위를 쓰고, 핏물을 빼지 않은 채 곰탕처럼 끓이며 불순물만 걷어내면 고기 육수의 깊은 맛이 남는다. 삶는 시간보다 손으로 지방을 정리하는 과정이 더 오래 걸린다.",
  recipeCategory: "밑반찬",
  recipeCuisine: "Korean",
  recipeYield: "4인분",
  prepTime: "PT30M",
  cookTime: "PT3H",
  totalTime: "P2D",
  recipeIngredient: INGREDIENTS,
  recipeInstructions: STEPS.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })),
};

export default function JangjorimRecipe() {
  const product = PRODUCTS.find((p) => p.name === "한우투뿔양지장조림")!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeJsonLd) }} />

      <article className="container-x max-w-3xl pt-14 pb-20 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">RECIPE</p>
        <h1 className="display text-[1.9rem] leading-[1.3] md:text-[2.4rem]">
          한우 장조림,
          <br />
          퍽퍽하지 않게 만드는 법
        </h1>
        <p className="mt-6 text-[16.5px] leading-[1.9] text-[var(--ink-soft)]">
          아이가 장조림을 씹다가 뱉는 걸 보고 시작한 일입니다.
          여러 번 고쳐 보고 알았습니다 &mdash;
          <strong className="text-[var(--ink)]"> 문제는 조리법이 아니라 고기였습니다.</strong>
        </p>

        <div className="my-10 overflow-hidden rounded-3xl">
          <Image
            src="/journal/cook-jorim.jpg"
            alt="냄비에서 조려지고 있는 장조림"
            width={1600}
            height={1200}
            className="w-full object-cover"
          />
        </div>

        <div className="rounded-3xl bg-[var(--rose)]/25 p-7">
          <p className="text-[15.5px] leading-[1.85]">
            <strong>많은 조리법과 다른 점 두 가지</strong>
            <br />
            <span className="mt-2 block">
              ① <strong>핏물을 빼지 않습니다.</strong> 핏물을 빼면 고기 육수의 깊은 맛까지 빠져나갑니다.
            </span>
            <span className="mt-1.5 block">
              ② <strong>제일 오래 걸리는 건 삶는 게 아니라 손질입니다.</strong> 지방을 하나씩 정리하는 작업입니다.
            </span>
          </p>
        </div>

        <section className="mt-10 rounded-3xl bg-[var(--paper-2)] p-7 md:p-8">
          <h2 className="display mb-4 text-[1.2rem]">재료 (4인분)</h2>
          <ul className="space-y-2 text-[15.5px] text-[var(--ink-soft)]">
            {INGREDIENTS.map((i) => (
              <li key={i}>· {i}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="display mb-7 text-[1.4rem]">만드는 순서</h2>
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

        <aside className="mt-16 rounded-3xl border border-[var(--line)] bg-white p-8">
          <p className="text-[15px] text-[var(--ink-soft)]">
            읽어 보시니 어떠세요. 고기 고르는 것부터 지방을 하나씩 정리하는 것까지,
            이틀이 걸립니다. 주말에 시간이 나면 꼭 한번 해 보세요.
          </p>
          <p className="mt-3 text-[15px] text-[var(--ink-soft)]">그럴 시간이 없으시면, 저희가 해 둔 것도 있습니다.</p>

          <a
            href={storeUrl(product.id, "recipe_jangjorim")}
            target="_blank"
            rel="noopener"
            className="mt-6 flex items-center gap-4 rounded-2xl bg-[var(--paper-2)] p-4 transition hover:bg-[var(--mint)]/30"
          >
            <Image
              src="/products/jangjorim.jpg"
              alt=""
              width={120}
              height={120}
              className="h-20 w-20 rounded-xl object-cover"
            />
            <div>
              <p className="display text-[16px]">{product.name}</p>
              <p className="text-[14px] text-[var(--ink-soft)]">{product.size}</p>
              <p className="mt-1 font-semibold">{formatPrice(product)}</p>
            </div>
            <span className="ml-auto text-[var(--terra)]">→</span>
          </a>
        </aside>
      </article>
    </>
  );
}
