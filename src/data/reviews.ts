/**
 * 손님의 말
 *
 * ⚠️ 원칙: **실제 손님이 한 말만** 싣는다. 출처를 반드시 구분한다.
 *   - `store` : 스마트스토어 구매 리뷰 원문
 *   - `owner` : 사장님이 매장·전화·메시지에서 직접 들으신 말 (2026-08 인터뷰)
 *   - `blog`  : 블로그 후기 (⚠️ 상당수가 네이버 브랜드커넥트 제휴글 = 수수료 지급)
 *   제휴 글은 `sponsored: true` 로 표시하고 화면에도 그렇게 밝힌다.
 *   표시를 숨기면 표시광고법 위반이고, 무엇보다 브랜드가 거짓이 된다.
 */

export interface Review {
  text: string;
  product?: string;
  source: "store" | "owner" | "blog";
  author?: string;
  sponsored?: boolean;
  /** 홈 "손님이 남긴 말"에 크게 걸 것 */
  featured?: boolean;
}

export const REVIEWS: Review[] = [
  // ── 사장님이 직접 들으신 말 (2026-08 인터뷰) ──────────────
  {
    text: "우리 엄마가 해주시던 장조림 맛이네.",
    product: "한우투뿔양지장조림",
    source: "owner",
    author: "어느 어르신 손님",
    featured: true,
  },
  {
    text: "애가 이 장조림은 처음으로 다 먹었어요.",
    product: "한우투뿔양지장조림",
    source: "owner",
    featured: true,
  },
  {
    text: "가격은 비싼데 먹어보니 왜 이 가격인지 알겠어요.",
    product: "한우투뿔양지장조림",
    source: "owner",
    featured: true,
  },
  {
    text: "이제 다른 장조림은 못 먹겠어요.",
    product: "한우투뿔양지장조림",
    source: "owner",
  },
  {
    text: "국물까지 버리기 아까워서 숟가락으로 퍼먹었어요.",
    product: "한우투뿔양지장조림",
    source: "owner",
  },
  {
    text: "우리 아이가 이 장조림은 밥을 두 공기나 먹어요.",
    product: "한우투뿔양지장조림",
    source: "owner",
  },
  {
    text: "제가 여태 먹었던 장조림은 뭐였나 싶네요.",
    product: "한우투뿔양지장조림",
    source: "owner",
  },

  // ── 스마트스토어 구매 리뷰 원문 ────────────────────────────
  {
    text: "아기가 엄청 잘 먹어요!",
    product: "한우투뿔양지미역국",
    source: "store",
  },
  {
    text: "오프홈 소고기미역국은 집에서 한 것처럼 미역도 고기도 부드럽고 맛있어요.",
    product: "한우투뿔양지미역국",
    source: "store",
  },
  {
    text: "좋은 고기를 사용해서 그런지 맛도 깊고 좋아요. 든든한 한 끼 했어요.",
    product: "한우투뿔양지미역국",
    source: "store",
  },

  // ── 블로그 후기 (제휴 — 반드시 표시) ──────────────────────
  {
    text:
      "아이가 결대로 찢어지는 고기는 질겨서 잘 먹지 않는데, 이 장조림은 야들야들할 만큼 고기가 부드러워서 아이도 잘 먹어요. 아이가 먼저 찾는 장조림이에요.",
    product: "한우투뿔양지장조림",
    source: "blog",
    author: "쑥쑥토실",
    sponsored: true,
  },
  {
    text:
      "정성스럽게 끓여 낸 간장 양념이 한우투뿔양지에 깊게 스며들어서 부드럽고 야들야들한 식감이 정말 살아 있어요.",
    product: "한우투뿔양지장조림",
    source: "blog",
    author: "콩천사",
    sponsored: true,
  },
  {
    text:
      "두툼하게 슬라이스 된 한우양지가 들어 있어서 아이들도 정말 잘 먹어요. 곰탕 육수도 진해서 밥 말아 한 그릇 먹으면 속까지 든든해지더라고요.",
    product: "한우투뿔양지곰탕",
    source: "blog",
    author: "콩천사",
    sponsored: true,
  },
];

/** 스토어 평점 (2026-07-31 스토어 화면 실측) */
export const RATINGS: Record<string, { score: number; count: number }> = {
  한우투뿔양지장조림: { score: 5.0, count: 15 },
  한우투뿔양지곰탕: { score: 5.0, count: 14 },
  한돈돈까스: { score: 4.93, count: 14 },
  수제청국장: { score: 5.0, count: 19 },
  유니짜장소스: { score: 5.0, count: 12 },
  우엉볶음: { score: 5.0, count: 9 },
  한우투뿔육개장: { score: 5.0, count: 9 },
  도라지초무침: { score: 5.0, count: 8 },
  소고기잡채: { score: 5.0, count: 9 },
  진미채: { score: 5.0, count: 4 },
  한우투뿔양지미역국: { score: 5.0, count: 3 },
  오이소박이: { score: 5.0, count: 3 },
  한돈목살제육볶음: { score: 5.0, count: 5 },
  국내산닭갈비: { score: 5.0, count: 5 },
  배추겉절이: { score: 5.0, count: 2 },
  깻잎김치: { score: 5.0, count: 4 },
  곤드레나물: { score: 5.0, count: 5 },
  고사리나물: { score: 5.0, count: 5 },
};

export const featuredVoices = () => REVIEWS.filter((r) => r.featured);
export const voicesOf = (name: string) => REVIEWS.filter((r) => r.product === name);

export const sourceLabel = (r: Review) =>
  r.source === "store"
    ? "스마트스토어 구매 후기"
    : r.source === "owner"
      ? "매장에서 직접 들은 말"
      : `블로그 후기${r.sponsored ? " (제휴)" : ""}`;
