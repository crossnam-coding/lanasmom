import Image from "next/image";
import Link from "next/link";
import { HERO_PRODUCTS, formatPrice, storeUrl, slugOf } from "@/data/products";
import { featuredVoices, sourceLabel, RATINGS } from "@/data/reviews";

const TIMELINE = [
  { year: "2017 – 2019", title: "153, 미사강변", desc: "아무것도 모르고 시작한 식당. 열정 하나로 2년을 했습니다." },
  { year: "2024. 7", title: "잠실 반찬가게", desc: "벽도 직접 칠해서 열었습니다. 새벽부터 만들어 쇼케이스를 채웠습니다." },
  { year: "2025", title: "아이 곁으로", desc: "아이가 엄마의 빈자리를 크게 느끼고 있었습니다. 1년 만에 가게를 정리했습니다." },
  { year: "지금", title: "광주 작업실", desc: "라나와 함께하는 시간을 지키면서 매일 만들어 보냅니다." },
];

export default function Home() {
  const voices = featuredVoices();

  return (
    <>
      {/* ── 히어로 ───────────────────────────────── */}
      <section className="container-x pt-14 pb-20 md:pt-24 md:pb-28">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <div>
            <p className="mb-5 text-[13px] font-semibold tracking-[0.18em] text-[var(--mint-deep)]">
              WARMTH ON YOUR TABLE
            </p>
            <h1 className="display text-[2rem] leading-[1.3] md:text-[2.9rem]">
              딸에게 먹이려고
              <br />
              <span className="underline-hand">만들기 시작했습니다.</span>
            </h1>
            <p className="mt-7 max-w-lg text-[16px] text-[var(--ink-soft)] md:text-[17px]">
              고기를 안 먹는 아이가 있었습니다. 그래서 레시피가 아니라 고기부터 바꿨습니다.
              마장동에서 1++ 등급 중에서도 7·8·9만 골라 받습니다.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={storeUrl(null, "hero")}
                target="_blank"
                rel="noopener"
                className="rounded-full bg-[var(--terra)] px-7 py-3.5 font-semibold text-white transition hover:bg-[var(--terra-deep)]"
              >
                주문하러 가기
              </a>
              <Link
                href="/story"
                className="rounded-full border border-[var(--line)] bg-white px-7 py-3.5 font-semibold text-[var(--ink)] transition hover:border-[var(--terra)]"
              >
                라나엄마 이야기
              </Link>
            </div>
          </div>

          <Link href="/menu/hanwoo-jangjorim" className="relative block group">
            <div className="overflow-hidden rounded-[2rem] bg-[var(--paper-2)]">
              <Image
                src="/products/jangjorim.jpg"
                alt="한우투뿔양지장조림"
                width={1919}
                height={1280}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-[var(--line)] md:-left-8">
              <p className="text-[12px] text-[var(--ink-soft)]">재주문 1위</p>
              <p className="display text-[15px] group-hover:text-[var(--terra)]">한우투뿔양지장조림 →</p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 브랜드 컨셉: 레시피를 숨기지 않는다 ───────── */}
      <section className="border-y border-[var(--line)] bg-[var(--mint)]/25">
        <div className="container-x py-16 text-center md:py-20">
          <h2 className="display text-[1.6rem] md:text-[2.1rem]">
            비법을 안 숨겨요.
            <br className="md:hidden" /> 그래도 다들 사러 오세요.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[var(--ink-soft)]">
            라나엄마는 장조림 만드는 법을 전부 알려드립니다.
            그런데 한 번 만들어 보면 알게 됩니다 &mdash; 좋은 고기와 긴 시간이 전부라는 걸.
          </p>
          <Link
            href="/recipes"
            className="mt-8 inline-block rounded-full border border-[var(--mint-deep)] bg-white px-6 py-3 text-[15px] font-semibold text-[var(--mint-deep)]"
          >
            만드는 법 보러 가기
          </Link>
        </div>
      </section>

      {/* ── 대표 상품 ─────────────────────────────── */}
      <section className="container-x py-20 md:py-24">
        <div className="mb-10 flex items-end justify-between">
          <h2 className="display text-[1.5rem] md:text-[1.9rem]">가장 많이 찾으시는 것</h2>
          <Link href="/menu" className="text-[15px] text-[var(--terra)] underline">
            전체 메뉴 →
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {HERO_PRODUCTS.map((p) => {
            const r = RATINGS[p.name];
            return (
              <Link key={p.name} href={`/menu/${slugOf(p)}`} className="group block">
                <div className="overflow-hidden rounded-2xl bg-[var(--paper-2)]">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={900}
                      height={900}
                      className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="mt-4">
                  <p className="display text-[17px]">{p.name}</p>
                  <p className="mt-1 text-[14px] text-[var(--ink-soft)]">{p.size}</p>
                  <p className="mt-2 text-[16px] font-semibold">{formatPrice(p)}</p>
                  {r && (
                    <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
                      <span className="text-[var(--terra)]">★</span> {r.score} · 리뷰 {r.count}
                    </p>
                  )}
                  {p.blurb && (
                    <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-soft)]">{p.blurb}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 손님의 말 ─────────────────────────────── */}
      <section className="border-y border-[var(--line)] bg-white/60">
        <div className="container-x py-20 md:py-24">
          <h2 className="display mb-3 text-[1.5rem] md:text-[1.9rem]">손님이 남긴 말</h2>
          <p className="mb-10 text-[15px] text-[var(--ink-soft)]">
            매장에서, 그리고 주문하신 뒤에 실제로 해주신 말씀들입니다.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {voices.map((r, i) => (
              <blockquote
                key={i}
                className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-6"
              >
                <p className="text-[16px] leading-[1.8]">&ldquo;{r.text}&rdquo;</p>
                <footer className="mt-4 text-[12.5px] text-[var(--ink-soft)]">
                  {r.author ? `— ${r.author}` : `— ${r.product} 드신 분`}
                  <span className="ml-1.5 opacity-70">· {sourceLabel(r)}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── 발자취 ───────────────────────────────── */}
      <section className="container-x py-20 md:py-24">
        <h2 className="display mb-2 text-[1.5rem] md:text-[1.9rem]">2017년부터 밥을 팔았습니다</h2>
        <p className="mb-10 text-[15px] text-[var(--ink-soft)]">가게가 있던 시절부터 지금까지.</p>
        <ol className="grid gap-8 md:grid-cols-4">
          {TIMELINE.map((t) => (
            <li key={t.year} className="border-t-2 border-[var(--terra)] pt-4">
              <p className="text-[13px] font-semibold tracking-wider text-[var(--terra)]">{t.year}</p>
              <p className="display mt-1 text-[17px]">{t.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-soft)]">{t.desc}</p>
            </li>
          ))}
        </ol>
        <Link href="/story" className="mt-10 inline-block text-[15px] text-[var(--terra)] underline">
          라나엄마 이야기 전부 보기 →
        </Link>
      </section>
    </>
  );
}
