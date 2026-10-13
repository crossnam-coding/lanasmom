import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PRODUCTS,
  getProductBySlug,
  slugOf,
  detailOf,
  formatPrice,
  storeUrl,
  SHIPPING_FEE,
  byCategory,
} from "@/data/products";
import { RATINGS, voicesOf, sourceLabel } from "@/data/reviews";
import { getPost } from "@/data/journal";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: slugOf(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  const d = detailOf(p);
  const priceText = p.price ? `${p.price.toLocaleString("ko-KR")}원` : "";

  return {
    title: `${p.name}${p.size ? ` ${p.size}` : ""}`,
    description:
      `${d?.headline ?? p.blurb ?? ""} ${priceText && `${p.name} ${p.size ?? ""} ${priceText}.`} 라나엄마가 직접 만들어 보내드립니다.`.trim(),
    keywords: [
      p.name,
      `${p.name} 가격`,
      `${p.name} 후기`,
      "라나엄마",
      p.category,
      ...(d?.occasions ?? []),
    ],
    alternates: { canonical: `/menu/${slug}` },
    openGraph: {
      type: "article",
      title: `${p.name} · 라나엄마`,
      description: d?.headline ?? p.blurb,
      images: p.image ? [p.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) notFound();

  const d = detailOf(p);
  const rating = RATINGS[p.name];
  const voices = voicesOf(p.name);
  const related = byCategory(p.category).filter((x) => x.name !== p.name).slice(0, 3);
  const posts = (d?.journal ?? []).map(getPost).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.image ? [p.image] : undefined,
    description: d?.story ?? p.blurb,
    brand: { "@type": "Brand", name: "라나엄마" },
    category: p.category,
    ...(p.price && {
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: "KRW",
        availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        url: storeUrl(p.id, "product_jsonld"),
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: { "@type": "MonetaryAmount", value: SHIPPING_FEE, currency: "KRW" },
        },
        seller: { "@type": "Organization", name: "라나엄마" },
      },
    }),
    ...(rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating.score,
        reviewCount: rating.count,
        bestRating: 5,
      },
    }),
    ...(d?.ingredients && { recipeIngredient: d.ingredients }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="container-x pt-8 text-[13px] text-[var(--ink-soft)]">
        <Link href="/menu" className="hover:text-[var(--terra)]">메뉴</Link>
        <span className="mx-2">/</span>
        <span>{p.category}</span>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)]">{p.name}</span>
      </nav>

      {/* ── 히어로 ─────────────────────────────── */}
      <section className="container-x py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="overflow-hidden rounded-3xl bg-[var(--paper-2)]">
            {p.image ? (
              <Image src={p.image} alt={p.name} width={1600} height={1200}
                className="aspect-square w-full object-cover" priority />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center">
                <Image src="/brand/logo-line-small-alpha.png" alt="" width={110} height={90} className="opacity-25" />
              </div>
            )}
          </div>

          <div className="md:pt-4">
            {p.soldOut && (
              <span className="mb-3 inline-block rounded-full bg-[var(--ink)] px-3 py-1 text-[12px] text-white">
                지금은 품절입니다
              </span>
            )}
            {p.soldOut && p.soldOutNote && (
              <p className="mb-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">{p.soldOutNote}</p>
            )}
            <h1 className="display text-[1.8rem] md:text-[2.2rem]">{p.name}</h1>
            {p.size && <p className="mt-2 text-[15px] text-[var(--ink-soft)]">{p.size}</p>}
            {rating && (
              <p className="mt-3 text-[14px]">
                <span className="text-[var(--terra)]">★</span> {rating.score}
                <span className="text-[var(--ink-soft)]"> · 구매 후기 {rating.count}개</span>
              </p>
            )}

            {d?.headline && (
              <p className="display mt-7 text-[1.15rem] leading-[1.6] text-[var(--terra)]">
                {d.headline}
              </p>
            )}

            <p className="mt-6 text-[1.6rem] font-bold">{formatPrice(p)}</p>
            <p className="mt-1 text-[13.5px] text-[var(--ink-soft)]">
              배송비 {SHIPPING_FEE.toLocaleString("ko-KR")}원
            </p>

            {p.soldOut ? (
              <span className="mt-8 block cursor-not-allowed rounded-full bg-[var(--line)] px-8 py-4 text-center font-semibold text-[var(--ink-soft)]">
                지금은 주문할 수 없어요
              </span>
            ) : (
              <a href={storeUrl(p.id, `product_${slug}`)} target="_blank" rel="noopener"
                className="mt-8 block rounded-full bg-[var(--terra)] px-8 py-4 text-center font-semibold text-white transition hover:bg-[var(--terra-deep)]">
                스마트스토어에서 주문하기
              </a>
            )}
            <p className="mt-3 text-center text-[12.5px] text-[var(--ink-soft)]">
              주문과 결제는 네이버 스마트스토어에서 이루어집니다
            </p>

            {d?.occasions && (
              <div className="mt-8 flex flex-wrap gap-2">
                {d.occasions.map((o) => (
                  <span key={o} className="rounded-full bg-[var(--mint)]/40 px-3 py-1.5 text-[13px]">
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 이 음식이 시작된 이야기 ───────────────── */}
      {d?.origin && (
        <section className="border-y border-[var(--line)] bg-white/60">
          <div className="container-x max-w-3xl py-16 md:py-20">
            <p className="mb-5 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">STORY</p>
            <h2 className="display mb-7 text-[1.5rem] md:text-[1.8rem]">
              이 음식은 이렇게 시작했습니다
            </h2>
            {d.origin.map((t, i) => (
              <p key={i} className="mt-5 text-[16.5px] leading-[1.95] text-[var(--ink-soft)]">{t}</p>
            ))}
          </div>
        </section>
      )}

      {/* ── 사진으로 보는 이야기 ──────────────────── */}
      {d?.gallery && (
        <section className="container-x max-w-4xl py-14">
          <div className={`grid gap-6 ${d.gallery.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {d.gallery.map((g) => (
              <figure key={g.src}>
                <div className="overflow-hidden rounded-3xl bg-[var(--paper-2)]">
                  <Image src={g.src} alt={g.alt} width={900} height={675}
                    className="aspect-[4/3] w-full object-cover" />
                </div>
                {g.caption && (
                  <figcaption className="mt-3 text-[13.5px] text-[var(--ink-soft)]">{g.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── 만드는 방식 ───────────────────────────── */}
      {d?.story && (
        <section className="container-x max-w-3xl py-6">
          <div className="rounded-3xl bg-[var(--mint)]/20 p-8 md:p-10">
            <h2 className="display mb-4 text-[1.25rem]">이렇게 만듭니다</h2>
            <p className="text-[16.5px] leading-[1.95] text-[var(--ink-soft)]">{d.story}</p>
            {d.recipe && (
              <Link href={`/recipes/${d.recipe}`}
                className="mt-6 inline-block rounded-full border border-[var(--mint-deep)] bg-white px-5 py-2.5 text-[14px] font-semibold text-[var(--mint-deep)]">
                만드는 법 전부 보기 →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── 원재료 · 드시는 법 ────────────────────── */}
      <section className="container-x max-w-3xl py-10">
        <div className="grid gap-8 sm:grid-cols-2">
          {d?.ingredients && (
            <div>
              <h2 className="display mb-4 text-[1.1rem]">원재료</h2>
              <ul className="space-y-1.5 text-[15px] text-[var(--ink-soft)]">
                {d.ingredients.map((x) => <li key={x}>· {x}</li>)}
              </ul>
            </div>
          )}
          {d?.howto && (
            <div>
              <h2 className="display mb-4 text-[1.1rem]">드시는 법</h2>
              <ol className="space-y-2 text-[15px] text-[var(--ink-soft)]">
                {d.howto.map((x, i) => (
                  <li key={x}><span className="font-semibold text-[var(--terra)]">{i + 1}.</span> {x}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {(d?.storage || p.note) && (
          <p className="mt-8 rounded-2xl bg-[var(--paper-2)] p-5 text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
            <span className="font-semibold text-[var(--ink)]">보관 </span>
            {d?.storage ?? p.note}
          </p>
        )}

        {d?.tips && (
          <div className="mt-10">
            <h2 className="display mb-4 text-[1.1rem]">이렇게 드시면 더 좋습니다</h2>
            <ul className="space-y-3 text-[15.5px] leading-relaxed text-[var(--ink-soft)]">
              {d.tips.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="text-[var(--mint-deep)]">✓</span><span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ── 손님의 말 ─────────────────────────────── */}
      {voices.length > 0 && (
        <section className="container-x max-w-3xl py-10">
          <h2 className="display mb-6 text-[1.25rem]">이 메뉴를 드신 분들</h2>
          <div className="space-y-4">
            {voices.map((r, i) => (
              <blockquote key={i} className="rounded-2xl border border-[var(--line)] bg-white p-5">
                <p className="text-[15.5px] leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <footer className="mt-3 text-[12.5px] text-[var(--ink-soft)]">
                  {r.author ? `${r.author} · ` : ""}{sourceLabel(r)}
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}

      {/* ── 관련 부엌일기 ─────────────────────────── */}
      {posts.length > 0 && (
        <section className="container-x max-w-4xl py-14">
          <h2 className="display mb-7 text-[1.25rem]">이 음식이 나온 이야기</h2>
          <div className={`grid gap-8 ${posts.length > 1 ? "sm:grid-cols-2" : ""}`}>
            {posts.map((post) => (
              <Link key={post!.slug} href={`/journal/${post!.slug}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                  <Image src={post!.cover} alt={post!.coverAlt} width={800} height={600}
                    className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                </div>
                <p className="display mt-4 text-[16.5px] group-hover:text-[var(--terra)]">{post!.title}</p>
                <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                  {post!.summary}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 함께 보시면 좋아요 ────────────────────── */}
      {related.length > 0 && (
        <section className="container-x py-16">
          <h2 className="display mb-7 text-[1.25rem]">함께 보시면 좋아요</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {related.map((x) => (
              <Link key={x.name} href={`/menu/${slugOf(x)}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                  {x.image ? (
                    <Image src={x.image} alt={x.name} width={700} height={525}
                      className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center">
                      <Image src="/brand/logo-line-small-alpha.png" alt="" width={56} height={46} className="opacity-25" />
                    </div>
                  )}
                </div>
                <p className="display mt-3 text-[15.5px] group-hover:text-[var(--terra)]">{x.name}</p>
                <p className="text-[14px] text-[var(--ink-soft)]">{formatPrice(x)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
