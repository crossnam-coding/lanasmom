import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lanasmom.com";
/** 사업자정보가 비어 있는 동안은 색인을 막는다. 도메인 붙일 때 NEXT_PUBLIC_INDEXABLE=true */
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "true";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "라나엄마 — 딸에게 먹이려고 만들기 시작했습니다",
    template: "%s · 라나엄마",
  },
  description:
    "1++ 한우 양지로 만든 장조림과 국·탕. 딸 라나와 가족을 위해 만드는 마음으로 준비합니다. 만드는 법도 숨기지 않고 전부 알려드립니다.",
  keywords: ["한우장조림", "소고기장조림", "장조림", "라나엄마", "Lana's mom", "집밥", "반찬", "밀키트"],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "라나엄마 Lana's mom",
    title: "라나엄마 — 딸에게 먹이려고 만들기 시작했습니다",
    description: "1++ 한우 양지로 만든 장조림과 국·탕. Warmth on Your Table.",
  },
  alternates: { canonical: "/" },
  robots: { index: INDEXABLE, follow: INDEXABLE },
};

/* GEO — AI 검색이 인용할 수 있게 사실을 구조화해 둔다 */
const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  name: "라나엄마",
  alternateName: ["Lana's mom", "라나맘", "오프홈"],
  description:
    "라나엄마는 딸 라나와 가족을 위해 만들던 음식을 판매하는 한국의 가정식 반찬·밀키트 브랜드다. 대표 상품은 1++ 등급 한우 양지로 만든 한우투뿔양지장조림이다.",
  url: SITE,
  slogan: "Warmth on Your Table",
  servesCuisine: "Korean",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    addressRegion: "경기도",
    addressLocality: "광주시",
  },
  founder: { "@type": "Person", name: "라나엄마" },
};

const NAV = [
  { href: "/story", label: "이야기" },
  { href: "/menu", label: "메뉴" },
  { href: "/recipes", label: "만드는 법" },
  { href: "/journal", label: "부엌일기" },
  { href: "/about", label: "소개" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="paper-grain">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />

        <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur">
          <div className="container-x flex h-16 items-center justify-between md:h-20">
            <Link href="/" className="flex items-center gap-2.5" aria-label="라나엄마 홈">
              <Image
                src="/brand/logo-line-small-alpha.png"
                alt=""
                width={40}
                height={32}
                className="h-8 w-auto"
                priority
              />
              <Image
                src="/brand/wordmark-official-alpha.png"
                alt="Lana's mom"
                width={720}
                height={96}
                className="h-[20px] w-auto"
                priority
              />
            </Link>

            <nav className="flex items-center gap-6 text-[15px]">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="text-[var(--ink-soft)] hover:text-[var(--terra)]">
                  {n.label}
                </Link>
              ))}
              <a
                href="https://smartstore.naver.com/offhome?utm_source=lanasmom_site&utm_medium=header&utm_campaign=brand_site"
                target="_blank"
                rel="noopener"
                className="rounded-full bg-[var(--terra)] px-4 py-2 text-[14px] font-semibold text-white hover:bg-[var(--terra-deep)]"
              >
                주문하기
              </a>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="mt-24 border-t border-[var(--line)] bg-[var(--paper-2)]">
          <div className="container-x py-12">
            <Image
              src="/brand/logo-official-illust-alpha.png"
              alt="라나엄마"
              width={600}
              height={774}
              className="mb-6 h-28 w-auto opacity-90"
            />
            <div className="grid gap-8 text-[13px] leading-relaxed text-[var(--ink-soft)] md:grid-cols-2">
              <div>
                <p className="mb-2 font-semibold text-[var(--ink)]">라나맘 주식회사 · 라나엄마 (Lana&rsquo;s mom)</p>
                {/* 사업자등록증 2026-10-13 발급본 기준. 영업신고번호·문의 번호는 아직 없음 */}
                <p>사업자등록번호 493-86-03839</p>
                <p>영업신고번호 법인 명의 이전 중</p>
                <p>대표 김대억, 임은선 · 경기도 광주시 오포로 683, 2동 1층 (추자동)</p>
                <p>고객문의 ●●●-●●●●-●●●●</p>
              </div>
              <div>
                <p className="mb-2 font-semibold text-[var(--ink)]">주문</p>
                <p>
                  주문과 결제는 네이버 스마트스토어에서 이루어집니다.
                  <br />
                  이 홈페이지는 브랜드 소개와 조리법을 담고 있습니다.
                </p>
                <a
                  href="https://smartstore.naver.com/offhome?utm_source=lanasmom_site&utm_medium=footer&utm_campaign=brand_site"
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-block font-semibold text-[var(--terra)] underline"
                >
                  스마트스토어 바로가기 →
                </a>
              </div>
            </div>
            <p className="mt-10 text-[12px] text-[var(--ink-soft)]">
              © {new Date().getFullYear()} 라나엄마. 모든 사진과 글은 라나엄마의 것입니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
