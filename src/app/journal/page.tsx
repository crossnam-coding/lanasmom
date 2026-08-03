import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { POSTS } from "@/data/journal";

export const metadata: Metadata = {
  title: "부엌일기",
  description:
    "라나엄마가 지나온 자리와 오늘의 부엌을 기록합니다. 2018년 미사강변 153부터 지금 광주 작업장까지.",
  alternates: { canonical: "/journal" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "라나엄마 부엌일기",
  description: "라나엄마가 직접 쓰는 기록. 가게 이야기, 만드는 방법, 아이와 함께하는 부엌.",
  blogPost: POSTS.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    datePublished: p.date,
    description: p.summary,
    author: { "@type": "Organization", name: "라나엄마" },
  })),
};

export default function JournalIndex() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="container-x pt-14 pb-10 md:pt-20">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">JOURNAL</p>
        <h1 className="display text-[2rem] md:text-[2.6rem]">부엌일기</h1>
        <p className="mt-5 max-w-2xl text-[16px] text-[var(--ink-soft)]">
          한 편씩 길게 적습니다. 가게를 하던 날들, 오늘 부엌에서 있었던 일,
          손이 많이 가는 재료 이야기 같은 것들입니다.
          <br className="hidden md:block" />
          잘 팔리는 이야기 말고 진짜 있었던 이야기만 씁니다.
        </p>
        <Link href="/story"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-[14.5px] font-semibold hover:border-[var(--terra)]">
          ← 라나엄마가 어떤 곳인지 먼저 보기
        </Link>
      </section>

      <section className="container-x pb-24">
        <div className="grid gap-10 md:grid-cols-2">
          {POSTS.map((p, i) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              className={`group block ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <div className="overflow-hidden rounded-3xl bg-[var(--paper-2)]">
                <Image
                  src={p.cover}
                  alt={p.coverAlt}
                  width={1600}
                  height={1067}
                  className={`w-full object-cover transition duration-500 group-hover:scale-[1.02] ${
                    i === 0 ? "aspect-[21/9]" : "aspect-[4/3]"
                  }`}
                />
              </div>
              <h2
                className={`display mt-5 group-hover:text-[var(--terra)] ${
                  i === 0 ? "text-[1.5rem] md:text-[1.8rem]" : "text-[1.15rem]"
                }`}
              >
                {p.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-soft)]">{p.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
