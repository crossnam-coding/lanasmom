import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { storeUrl } from "@/data/products";
import { getPost } from "@/data/journal";

export const metadata: Metadata = {
  title: "라나엄마 이야기",
  description:
    "라나엄마는 딸 라나에게 먹이려고 만들던 음식에서 시작했습니다. 2018년 미사강변의 153, 잠실 반찬가게를 거쳐 지금은 경기도 광주의 작은 작업장에서 만들어 보내드립니다.",
  alternates: { canonical: "/story" },
};

/* 이 페이지는 '관문'이다. 각 장면은 부엌일기의 해당 글로 들어간다. */
const CHAPTERS = [
  {
    slug: "with-lana",
    year: "시작",
    title: "고기를 안 먹는 아이가 있었습니다",
    lines: [
      "라나는 통통해서 뭐든 잘 먹을 것 같지만, 사실 누구보다 편식이 심합니다.",
      "특히 고기를 안 먹었습니다. 좋은 걸 사줘도 퍽퍽해지면 결국 뱉었습니다.",
      "그래서 레시피가 아니라 고기부터 바꿨습니다. 그게 시작이었습니다.",
    ],
    img: "/journal/apron-item.jpg",
    alt: "작은 리넨 앞치마",
  },
  {
    slug: "153-misagangbyeon",
    year: "2017 – 2019",
    title: "153, 미사강변",
    lines: [
      "아무것도 모르고 시작한 식당이었습니다. 열정 하나만 컸습니다.",
      "밥집이면서 그릇과 살림을 함께 두었던 공간이었고, 2년을 했습니다.",
      "지금도 떠올리면 다시 한번 해보고 싶을 만큼 소중한 기억입니다.",
    ],
    img: "/journal/153-exterior.jpg",
    alt: "미사강변 153 외관",
  },
  {
    slug: "paint-the-shop",
    year: "2024. 7",
    title: "잠실에 반찬가게를 열었습니다",
    lines: [
      "돈이 넉넉하지 않아 할 수 있는 건 직접 했습니다. 벽도 제가 칠했습니다.",
      "음식이 예뻐 보이는 색을 고르느라 며칠이 걸렸습니다.",
      "그때 고른 흙 같은 주황이 지금 이 홈페이지의 색입니다.",
    ],
    img: "/journal/build-paint.jpg",
    alt: "매장 벽을 직접 칠하는 모습",
  },
  {
    slug: "morning-showcase",
    year: "매일 새벽",
    title: "쇼케이스를 채우던 아침",
    lines: [
      "새벽부터 만들어 담고, 유리에 손글씨로 가격을 적었습니다.",
      "제일 많이 나간 건 장조림이었습니다.",
      "처음엔 비싸다고 하시던 분들이 다음엔 장조림부터 찾으셨습니다.",
    ],
    img: "/journal/shop-case.jpg",
    alt: "반찬으로 가득 찬 쇼케이스",
  },
  {
    slug: "gift-box",
    year: "2025 – 지금",
    title: "아이 곁으로 돌아왔습니다",
    lines: [
      "새벽에 일하고 라나를 데리러 가면 충분할 줄 알았는데, 아이는 엄마의 빈자리를 크게 느끼고 있었습니다.",
      "1년 만에 가게를 정리하고 집 근처에 작업실을 마련했습니다.",
      "지금은 라나와 함께하는 시간을 지키면서, 더 많은 분들께 보내드리고 있습니다.",
    ],
    img: "/journal/gift-box.jpg",
    alt: "리본으로 묶은 선물 상자",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "라나엄마 이야기",
  about: {
    "@type": "Organization",
    name: "라나엄마",
    description:
      "라나엄마는 딸 라나와 가족을 위해 만들던 음식에서 시작한 가정식 브랜드다. 2018년 경기도 하남 미사강변에서 한식당 겸 리빙 편집숍 '153'을 운영했고, 이후 잠실에서 반찬가게를 열었으며, 육아를 위해 매장을 정리하고 2025년부터 온라인으로 판매하고 있다.",
  },
};

export default function StoryPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 표제 */}
      <section className="container-x pt-14 pb-12 md:pt-20 md:pb-16">
        <p className="mb-4 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">OUR STORY</p>
        <h1 className="display max-w-3xl text-[2rem] leading-[1.3] md:text-[2.7rem]">
          딸 하나 먹이자고 시작한 일이
          <br />
          여기까지 왔습니다.
        </h1>
      </section>

      {/* 인사말 카드 — 실물 그대로 */}
      <section className="container-x pb-20">
        <div className="grid items-center gap-10 rounded-3xl bg-[var(--mint)]/25 p-8 md:grid-cols-[1fr_1.2fr] md:p-12">
          <Image
            src="/brand/card-greeting-white.png"
            alt="라나엄마 인사말 카드"
            width={1034}
            height={1744}
            className="mx-auto w-full max-w-[260px] rounded-2xl bg-white shadow-sm"
          />
          <div>
            <p className="text-[14px] text-[var(--ink-soft)]">보내드리는 상자마다 넣는 카드입니다.</p>
            <blockquote className="mt-5 space-y-4 text-[16.5px] leading-[1.9]">
              <p>안녕하세요, 라나엄마입니다.</p>
              <p className="font-semibold">
                딸 라나와 가족을 위해 만드는 마음으로 맛있는 음식을 정성껏 준비했습니다.
              </p>
              <p>저의 요리가 여러분의 식탁에서도 행복과 웃음을 전달해 드릴 수 있기를 바랍니다.</p>
            </blockquote>
            <p className="mt-5 text-[15px] text-[var(--ink-soft)]">— 라나 엄마 —</p>
          </div>
        </div>
      </section>

      {/* 다섯 장면 — 각각 부엌일기로 들어간다 */}
      <section className="container-x pb-8">
        <h2 className="display mb-3 text-[1.5rem] md:text-[1.8rem]">지나온 자리</h2>
        <p className="mb-12 text-[15.5px] text-[var(--ink-soft)]">
          다섯 장면으로 줄여 두었습니다. 더 보고 싶으신 대목은 눌러서 들어가시면 됩니다.
        </p>

        <ol className="space-y-16 md:space-y-20">
          {CHAPTERS.map((c, i) => {
            const post = getPost(c.slug);
            return (
              <li key={c.slug}>
                <div
                  className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${
                    i % 2 === 1 ? "md:[&>figure]:order-2" : ""
                  }`}
                >
                  <figure className="overflow-hidden rounded-3xl bg-[var(--paper-2)]">
                    <Image
                      src={c.img}
                      alt={c.alt}
                      width={900}
                      height={675}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </figure>

                  <div>
                    <p className="text-[13px] font-semibold tracking-[0.16em] text-[var(--terra)]">
                      {c.year}
                    </p>
                    <h3 className="display mt-2 text-[1.4rem] md:text-[1.6rem]">{c.title}</h3>
                    <div className="mt-5 space-y-2.5 text-[16px] leading-[1.85] text-[var(--ink-soft)]">
                      {c.lines.map((l) => (
                        <p key={l}>{l}</p>
                      ))}
                    </div>

                    {post && (
                      <Link
                        href={`/journal/${c.slug}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-[14.5px] font-semibold transition hover:border-[var(--terra)] hover:text-[var(--terra)]"
                      >
                        「{post.title}」 읽기 →
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 이 페이지에만 있는 것 — 브랜드 원칙 */}
      <section className="container-x py-20 md:py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[var(--paper-2)] p-9 md:p-12">
          <h2 className="display mb-5 text-[1.5rem]">비법을 숨기지 않는 이유</h2>
          <p className="text-[16.5px] leading-[1.95] text-[var(--ink-soft)]">
            저는 만드는 법을 물어보시면 다 알려드립니다. 숨길 이유가 없습니다.
            어차피 해 보시면 아시거든요. 좋은 고기를 사서, 핏물을 빼고,
            오래 조리는 그 시간이 전부라는 걸요.
          </p>
          <p className="mt-4 text-[16.5px] leading-[1.95] text-[var(--ink-soft)]">
            그래서 이 홈페이지에는 장조림 만드는 법도, 스지 손질하는 법도 다 적어 두었습니다.
            직접 해 드시면 그것대로 좋고, 시간이 없으시면 저희 것을 드시면 됩니다.
          </p>
          <Link
            href="/recipes"
            className="mt-7 inline-block rounded-full border border-[var(--terra)] px-6 py-3 text-[15px] font-semibold text-[var(--terra)]"
          >
            만드는 법 보기
          </Link>
        </div>
      </section>

      {/* 부엌일기로 넘기기 */}
      <section className="border-t border-[var(--line)]">
        <div className="container-x py-16 text-center">
          <p className="text-[15.5px] text-[var(--ink-soft)]">
            오늘 부엌에서 있었던 일은 따로 적어 두고 있습니다.
          </p>
          <Link
            href="/journal"
            className="mt-5 inline-block rounded-full bg-[var(--mint-deep)] px-7 py-3.5 font-semibold text-white"
          >
            부엌일기 보러 가기 →
          </Link>
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="rounded-3xl bg-[var(--terra)] px-8 py-12 text-center text-white md:py-16">
          <h2 className="display text-[1.5rem] md:text-[1.9rem]">오늘 저녁, 한 그릇 어떠세요</h2>
          <a
            href={storeUrl(null, "story_cta")}
            target="_blank"
            rel="noopener"
            className="mt-7 inline-block rounded-full bg-white px-7 py-3.5 font-semibold text-[var(--terra)]"
          >
            메뉴 보러 가기
          </a>
        </div>
      </section>
    </>
  );
}
