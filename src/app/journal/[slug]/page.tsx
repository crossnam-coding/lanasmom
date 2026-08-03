import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost, type Block } from "@/data/journal";
import { HERO_PRODUCTS, storeUrl, formatPrice } from "@/data/products";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    keywords: post.keywords,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      images: [post.cover],
      publishedTime: post.date,
    },
  };
}

/**
 * 커버로 이미 크게 보여준 사진은 본문에서 자동으로 걸러낸다.
 * (글을 새로 추가해도 같은 사진이 한 페이지에 두 번 나오지 않는다)
 */
function Blocks({ body, cover }: { body: Block[]; cover: string }) {
  const cleaned: Block[] = body
    .filter((b) => !(b.t === "img" && b.src === cover))
    .map((b) =>
      b.t === "imgs" ? { ...b, items: b.items.filter((im) => im.src !== cover) } : b,
    )
    .filter((b) => !(b.t === "imgs" && b.items.length === 0));

  return (
    <>
      {cleaned.map((b, i) => {
        if (b.t === "h")
          return (
            <h2 key={i} className="display mt-14 mb-5 text-[1.4rem]">
              {b.text}
            </h2>
          );
        if (b.t === "p")
          return (
            <p key={i} className="mt-5 text-[16.5px] leading-[1.95] text-[var(--ink-soft)]">
              {b.text}
            </p>
          );
        if (b.t === "q")
          return (
            <blockquote
              key={i}
              className="my-10 border-l-4 border-[var(--mint-deep)] bg-[var(--mint)]/20 px-6 py-5 text-[17px] leading-[1.9] italic"
            >
              {b.text}
            </blockquote>
          );
        if (b.t === "img")
          return (
            <figure key={i} className="my-10">
              <div className="overflow-hidden rounded-3xl bg-[var(--paper-2)]">
                <Image src={b.src} alt={b.alt} width={1600} height={1200} className="w-full object-cover" />
              </div>
              {b.caption && (
                <figcaption className="mt-3 text-center text-[13.5px] text-[var(--ink-soft)]">
                  {b.caption}
                </figcaption>
              )}
            </figure>
          );
        return (
          <div key={i} className={`my-10 grid gap-4 ${b.items.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {b.items.map((im) => (
              <div key={im.src} className="overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                <Image
                  src={im.src}
                  alt={im.alt}
                  width={800}
                  height={800}
                  className="aspect-square w-full object-cover"
                />
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export default async function JournalPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);
  const product = HERO_PRODUCTS[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    image: post.cover,
    datePublished: post.date,
    author: { "@type": "Organization", name: "라나엄마" },
    publisher: { "@type": "Organization", name: "라나엄마" },
    keywords: post.keywords.join(", "),
    /* GEO — AI 검색이 인용할 수 있는 사실 문장 */
    about: post.facts.map((f) => ({ "@type": "Thing", description: f })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="container-x max-w-3xl pt-14 pb-16 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">JOURNAL</p>
        <h1 className="display text-[1.9rem] leading-[1.3] md:text-[2.4rem]">{post.title}</h1>
        <p className="mt-6 text-[17px] leading-[1.9] text-[var(--ink-soft)]">{post.summary}</p>

        <div className="mt-10 overflow-hidden rounded-3xl bg-[var(--paper-2)]">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            width={1600}
            height={1067}
            className="w-full object-cover"
            priority
          />
        </div>

        <Blocks body={post.body} cover={post.cover} />

        {/* 조용한 전환 */}
        <aside className="mt-16 rounded-3xl border border-[var(--line)] bg-white p-7">
          <p className="text-[15px] text-[var(--ink-soft)]">
            읽어 주셔서 감사합니다. 오늘 저녁 한 그릇이 필요하시면 이것부터 권해 드립니다.
          </p>
          <a
            href={storeUrl(product.id, `journal_${post.slug}`)}
            target="_blank"
            rel="noopener"
            className="mt-5 flex items-center gap-4 rounded-2xl bg-[var(--paper-2)] p-4 transition hover:bg-[var(--mint)]/30"
          >
            {product.image && (
              <Image
                src={product.image}
                alt=""
                width={120}
                height={120}
                className="h-20 w-20 rounded-xl object-cover"
              />
            )}
            <div>
              <p className="display text-[16px]">{product.name}</p>
              <p className="text-[14px] text-[var(--ink-soft)]">{product.size}</p>
              <p className="mt-1 font-semibold">{formatPrice(product)}</p>
            </div>
            <span className="ml-auto text-[var(--terra)]">→</span>
          </a>
        </aside>
      </article>

      <section className="container-x max-w-4xl pb-24">
        <h2 className="display mb-7 text-[1.3rem]">다른 이야기</h2>
        <div className="grid gap-8 sm:grid-cols-2">
          {others.map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group block">
              <div className="overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                <Image
                  src={p.cover}
                  alt={p.coverAlt}
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <p className="display mt-4 text-[16px] group-hover:text-[var(--terra)]">{p.title}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
