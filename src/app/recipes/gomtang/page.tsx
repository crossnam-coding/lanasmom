import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, storeUrl, formatPrice } from "@/data/products";

export const metadata: Metadata = {
  title: "양지곰탕 국물 맑게 내는 법",
  description:
    "뽀얀 곰탕과 맑은 곰탕은 끓이는 온도가 다릅니다. 양지로 맑고 깊은 국물을 내는 순서와, 국물이 탁해지는 이유를 적었습니다.",
  keywords: ["곰탕 끓이는 법", "양지곰탕", "곰탕 맑게", "소고기국 국물", "한우 곰탕 레시피"],
  alternates: { canonical: "/recipes/gomtang" },
};

const INGREDIENTS = [
  "한우 양지 1kg",
  "물 4L",
  "대파 2대 (흰 부분)",
  "양파 1개, 통마늘 10쪽",
  "통후추 15알",
  "천일염 (간 맞출 때)",
];

const STEPS = [
  {
    name: "핏물을 충분히 뺍니다",
    text: "찬물에 2시간 담가 핏물을 뺍니다. 물은 두세 번 갈아 줍니다. 핏물이 남으면 국물이 탁해지고 비린내가 납니다. 곰탕의 성패는 사실 여기서 절반이 갈립니다.",
  },
  {
    name: "끓기 시작하면 불을 줄입니다 — 여기가 핵심입니다",
    text: "센 불에서 계속 끓이면 지방과 단백질이 잘게 부서져 국물에 퍼집니다. 그게 뽀얀 국물입니다. 맑게 내시려면 끓어오른 뒤 반드시 약한 불로 낮춰, 국물이 보글거리지 않고 살짝 흔들리는 정도로만 유지하세요.",
  },
  {
    name: "거품은 초반에 부지런히 걷습니다",
    text: "처음 20분이 거품이 가장 많이 올라오는 때입니다. 이때 걷어내지 않으면 국물에 다시 섞여 들어갑니다. 국자로 조심스럽게 걷어 버립니다.",
  },
  {
    name: "향채는 나중에, 잠깐만",
    text: "대파·양파·마늘을 처음부터 넣고 오래 끓이면 채소 단맛이 지나쳐 국물이 텁텁해집니다. 마지막 30분에만 넣습니다.",
  },
  {
    name: "3~4시간 고은 뒤 고기를 건집니다",
    text: "고기는 젓가락이 들어가면 건져서 식힙니다. 완전히 식은 뒤에 결 반대로 썰어야 두툼하게 모양이 잡힙니다.",
  },
  {
    name: "식혀서 기름을 걷고, 소금은 먹을 때",
    text: "국물을 식히면 기름이 위에 굳습니다. 걷어 내고 다시 데웁니다. 소금은 미리 넣지 마세요. 드실 때 각자 맞추는 게 제일 맛있습니다.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Recipe",
  name: "양지곰탕 국물 맑게 내는 법",
  author: { "@type": "Organization", name: "라나엄마" },
  description:
    "곰탕 국물이 뽀얗게 되는 이유는 센 불이다. 맑게 내려면 끓어오른 뒤 약한 불로 낮춰 국물이 흔들리는 정도로만 유지해야 한다. 핏물 빼기와 초반 거품 걷기가 국물 맑기를 좌우한다.",
  recipeCategory: "국·탕",
  recipeCuisine: "Korean",
  recipeYield: "4~6인분",
  prepTime: "PT2H",
  cookTime: "PT4H",
  totalTime: "PT6H",
  recipeIngredient: INGREDIENTS,
  recipeInstructions: STEPS.map((s) => ({ "@type": "HowToStep", name: s.name, text: s.text })),
};

export default function GomtangRecipe() {
  const product = PRODUCTS.find((p) => p.name === "한우투뿔양지곰탕")!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container-x max-w-3xl pt-14 pb-20 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">RECIPE</p>
        <h1 className="display text-[1.9rem] leading-[1.3] md:text-[2.4rem]">
          양지곰탕
          <br />
          국물 맑게 내는 법
        </h1>
        <p className="mt-6 text-[16.5px] leading-[1.9] text-[var(--ink-soft)]">
          뽀얀 곰탕과 맑은 곰탕은 재료가 다른 게 아니라
          <strong className="text-[var(--ink)]"> 불의 세기가 다른 것</strong>입니다.
          센 불로 계속 끓이면 뽀얘지고, 약한 불로 오래 두면 맑아집니다. 어느 쪽이 맞고 틀린 건 없지만,
          저는 맑은 쪽을 좋아합니다. 고기 맛이 그대로 보이거든요.
        </p>

        <div className="my-10 overflow-hidden rounded-3xl">
          <Image src="/products/gomtang.jpg" alt="한우 양지곰탕" width={1600} height={1200} className="w-full object-cover" />
        </div>

        <section className="rounded-3xl bg-[var(--paper-2)] p-7 md:p-8">
          <h2 className="display mb-4 text-[1.2rem]">재료 (4~6인분)</h2>
          <ul className="space-y-2 text-[15.5px] text-[var(--ink-soft)]">
            {INGREDIENTS.map((i) => (
              <li key={i}>· {i}</li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="display mb-7 text-[1.4rem]">끓이는 순서</h2>
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
            핏물 2시간, 끓이기 4시간. 주말이 통째로 갑니다.
            해 보시면 왜 곰탕집이 새벽부터 불을 켜는지 아시게 됩니다.
          </p>
          <p className="mt-3 text-[15px] text-[var(--ink-soft)]">그 시간이 없으시면, 저희가 끓여 둔 것도 있습니다.</p>

          <a
            href={storeUrl(product.id, "recipe_gomtang")}
            target="_blank"
            rel="noopener"
            className="mt-6 flex items-center gap-4 rounded-2xl bg-[var(--paper-2)] p-4 transition hover:bg-[var(--mint)]/30"
          >
            {product.image && (
              <Image src={product.image} alt="" width={120} height={120} className="h-20 w-20 rounded-xl object-cover" />
            )}
            <div>
              <p className="display text-[16px]">{product.name}</p>
              <p className="text-[14px] text-[var(--ink-soft)]">{product.size}</p>
              <p className="mt-1 font-semibold">{formatPrice(product)}</p>
            </div>
            <span className="ml-auto text-[var(--terra)]">→</span>
          </a>
        </aside>

        <p className="mt-10 text-center text-[15px]">
          <Link href="/recipes" className="text-[var(--terra)] underline">
            다른 조리법 보기
          </Link>
        </p>
      </article>
    </>
  );
}
