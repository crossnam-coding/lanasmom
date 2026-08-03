import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CATEGORIES,
  byCategory,
  formatPrice,
  storeUrl,
  slugOf,
  SHIPPING_FEE,
  PRODUCTS,
} from "@/data/products";
import { RATINGS } from "@/data/reviews";

export const metadata: Metadata = {
  title: "메뉴와 가격",
  description:
    "라나엄마의 전체 메뉴와 가격입니다. 1++ 한우 양지 장조림 300g 29,000원, 한우투뿔양지곰탕 1000g 29,000원 등 국·탕, 고기 메인, 밑반찬, 김치를 만드는 대로 판매합니다.",
  alternates: { canonical: "/menu" },
};

/* GEO — 상품을 구조화해 AI 검색이 인용할 수 있게 한다 */
const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "라나엄마 전체 메뉴",
  itemListElement: PRODUCTS.filter((p) => p.price !== null).map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      description: p.blurb,
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "KRW",
        availability: p.soldOut
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        url: storeUrl(p.id, "jsonld"),
      },
    },
  })),
};

export default function MenuPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <section className="container-x pt-14 pb-10 md:pt-20">
        <h1 className="display text-[2rem] md:text-[2.6rem]">메뉴와 가격</h1>
        <p className="mt-5 max-w-2xl text-[16px] text-[var(--ink-soft)]">
          만드는 대로 올립니다. 계절과 재료 사정에 따라 메뉴가 바뀝니다.
          주문과 결제는 네이버 스마트스토어에서 이루어집니다.
        </p>
        <p className="mt-3 text-[14px] text-[var(--ink-soft)]">
          배송비 {SHIPPING_FEE.toLocaleString("ko-KR")}원 · 국과 탕은 냉동, 반찬은 냉장으로 보내드립니다.
        </p>
      </section>

      {CATEGORIES.map((cat) => {
        const items = byCategory(cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="container-x py-10">
            <h2 className="display mb-7 border-b border-[var(--line)] pb-3 text-[1.35rem]">{cat}</h2>

            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => {
                const r = RATINGS[p.name];
                return (
                  <Link key={p.name} href={`/menu/${slugOf(p)}`} className="group block">
                    <div className="relative overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          width={800}
                          height={800}
                          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center">
                          <Image
                            src="/brand/logo-line-small-alpha.png"
                            alt=""
                            width={70}
                            height={56}
                            className="h-14 w-auto opacity-25"
                          />
                        </div>
                      )}
                      {p.soldOut && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[15px] font-semibold text-white">
                          품절
                        </span>
                      )}
                    </div>

                    <div className="mt-3.5">
                      <p className="display text-[16.5px]">
                        {p.name}
                        {p.size && (
                          <span className="ml-1.5 text-[13px] font-normal text-[var(--ink-soft)]">
                            {p.size}
                          </span>
                        )}
                      </p>
                      <p className="mt-1.5 text-[15.5px] font-semibold">{formatPrice(p)}</p>
                      {r && (
                        <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                          <span className="text-[var(--terra)]">★</span> {r.score} · 리뷰 {r.count}
                        </p>
                      )}
                      {p.blurb && (
                        <p className="mt-2.5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                          {p.blurb}
                        </p>
                      )}
                      {p.note && (
                        <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--mint-deep)]">
                          {p.note}
                        </p>
                      )}
                      <p className="mt-2.5 text-[13px] font-semibold text-[var(--terra)]">
                        자세히 보기 →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="container-x py-16">
        <div className="rounded-3xl bg-[var(--rose)]/30 p-8 text-center md:p-12">
          <h2 className="display text-[1.4rem]">선물로 보내시나요?</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-[var(--ink-soft)]">
            보자기 리본과 손편지 카드를 함께 넣어 보내드립니다.
            받으실 분 주소로 바로 보내실 수 있습니다.
          </p>
          <a
            href={storeUrl(null, "menu_gift")}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-block rounded-full bg-[var(--terra)] px-7 py-3.5 font-semibold text-white"
          >
            선물 주문하기
          </a>
        </div>
      </section>
    </>
  );
}
