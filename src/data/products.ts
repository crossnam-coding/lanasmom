/**
 * 라나엄마 상품 데이터 — 2026-07-31 확정본
 *
 * 가격·규격·리뷰수 : 스마트스토어 화면 실측 (오빠가 띄워준 화면 판독)
 * 상품ID           : 블로그 제휴링크 추적 → 링크와 이름이 같은 문맥일 때만 채택
 * 이미지           : 네이버 이미지검색에 색인된 스토어 공식 상품컷 원본
 *
 * 가격이 바뀌면 이 파일의 숫자만 고치면 전 페이지에 반영된다.
 */

export type Category = "국·탕" | "고기·메인" | "밑반찬" | "김치·젓갈" | "명절·선물";

export interface Product {
  id: string | null;
  name: string;
  size?: string;
  price: number | null;
  image?: string;
  category: Category;
  hero?: boolean;
  soldOut?: boolean;
  blurb?: string;
  note?: string;
}

export const CATEGORIES: Category[] = ["국·탕", "고기·메인", "밑반찬", "김치·젓갈", "명절·선물"];
export const SHIPPING_FEE = 4000;

const STORE_HOME = "https://smartstore.naver.com/offhome";
const STORE_PRODUCT = "https://smartstore.naver.com/offhome/products/";

/** 발행 링크에는 항상 utm — 첫 터치 귀속(전역 마케팅 규칙 필수 설비) */
export function storeUrl(id: string | null, medium = "menu"): string {
  const q = new URLSearchParams({
    utm_source: "lanasmom_site",
    utm_medium: medium,
    utm_campaign: "brand_site",
  }).toString();
  return id ? `${STORE_PRODUCT}${id}?${q}` : `${STORE_HOME}?${q}`;
}

export const PRODUCTS: Product[] = [
  // ── 국·탕 ────────────────────────────────────────────────
  {
    id: "12224539591", name: "한우투뿔양지곰탕", size: "1000g", price: 29000,
    image: "/products/gomtang.jpg", category: "국·탕", hero: true,
    blurb: "한우 양지를 푹 고아 천일염으로만 간을 맞췄습니다.",
    note: "냉동 배송. 냉장에서 해동한 뒤 데워 드세요.",
  },
  {
    id: "12258542800", name: "한우투뿔육개장", size: "900g / 2인분", price: 23000,
    image: "/products/yukgaejang.jpg", category: "국·탕",
    blurb: "한우 양지로 낸 국물에 고사리·대파·콩나물을 넉넉히 넣었습니다.",
    note: "냉동 배송. 건더기가 많아 이것만으로 한 끼가 됩니다.",
  },
  {
    id: null, name: "한우사골우거지탕", size: "900g / 2인분", price: 19000,
    image: "/products/ugeoji.jpg", category: "국·탕",
    blurb: "한우 사골을 오래 고아 우거지를 넉넉히 풀었습니다.", note: "냉동 배송.",
  },
  {
    id: null, name: "들깨버섯탕", size: "900g", price: 16000,
    image: "/products/deulkkae.jpg", category: "국·탕",
    blurb: "멸치육수로 깊게 끓여낸 들깨버섯탕. 걸쭉하고 고소합니다.", note: "냉동 배송.",
  },
  {
    id: "12301610213", name: "한우투뿔양지미역국", size: "900g / 2인분", price: 14000,
    image: "/products/miyeokguk.jpg", category: "국·탕", hero: true,
    blurb: "산모도 아이도 먹을 수 있게, 미역도 고기도 부드럽게.", note: "냉동 배송.",
  },
  {
    id: null, name: "명란순두부", size: "2~3인분", price: 25000,
    image: "/products/myeongran-sundubu.jpg", category: "국·탕",
    blurb: "맑고 시원한 국물에 명란을 넉넉히 풀었습니다.",
  },
  {
    id: null, name: "수제청국장", size: "2~3인분", price: 12000, category: "국·탕",
    blurb: "100% 집에서 띄운 수제 청국장으로 끓였습니다.",
  },

  // ── 고기·메인 ─────────────────────────────────────────────
  {
    id: "12234154258", name: "한우투뿔양지장조림", size: "300g", price: 29000,
    image: "/products/jangjorim.jpg", category: "고기·메인",
    blurb: "재주문 1위. 1++ 한우 양지를 결이 살아있게 조렸습니다.",
    note: "냉장 보관. 먹을 만큼만 덜어 데우세요. 남은 간장은 밥에 비벼 드셔도 좋습니다.",
  },
  {
    id: null, name: "투뿔한우소불고기", size: "500g", price: 29000,
    image: "/products/bulgogi.jpg", category: "고기·메인", hero: true,
    blurb: "남녀노소 누구나 좋아하는 소불고기. 간장이 깊게 뱄습니다.",
  },
  {
    id: null, name: "한돈목살제육볶음", size: "450g / 2~3인분", price: 24000,
    image: "/products/jeyuk.jpg", category: "고기·메인",
    blurb: "국내산 한돈 목살을 매콤하게 볶았습니다.",
  },
  {
    id: null, name: "모듬전 (새우완자전·한우육전)", price: 19000,
    image: "/products/modeumjeon.jpg", category: "고기·메인",
    blurb: "골라 먹는 재미가 있는 모듬전. 명절과 손님상에.",
  },
  {
    id: null, name: "국내산닭갈비", size: "500g", price: 17500,
    image: "/products/dakgalbi.jpg", category: "고기·메인",
    blurb: "채소까지 손질해 담았습니다. 팬에 볶기만 하면 됩니다.",
  },
  {
    id: "12234191447", name: "한돈돈까스", size: "350g (3~4장)", price: 13000,
    image: "/products/donkkaseu.jpg", category: "고기·메인",
    blurb: "국내산 한돈 등심. 비조리 냉동이라 집에서 갓 튀긴 바삭함 그대로.",
    note: "170~180℃ 기름에 앞뒤로 3~4분.",
  },
  {
    id: "12312281393", name: "소고기잡채", size: "300g", price: 10000, category: "고기·메인",
    blurb: "국내산 참깨와 한우로 만들어 냉동했습니다. 살짝 해동해 볶기만 하면 됩니다.",
  },

  // ── 밑반찬 ───────────────────────────────────────────────
  {
    id: null, name: "명란무침", size: "150g", price: 12000,
    image: "/products/myeongran-muchim.jpg", category: "밑반찬",
    blurb: "밥 한 그릇이 그냥 없어지는 밥도둑.",
  },
  { id: null, name: "유니짜장소스", size: "450g", price: 9000, category: "밑반찬",
    blurb: "밥에도 면에도. 아이들이 특히 좋아합니다." },
  { id: null, name: "진미채", size: "150g", price: 9000,
    image: "/products/jinmichae.jpg", category: "밑반찬",
    blurb: "달지 않게, 부드럽게 무쳤습니다." },
  { id: null, name: "도라지초무침", size: "180g", price: 8000, category: "밑반찬", soldOut: true,
    blurb: "쌉싸름한 도라지를 새콤하게 무쳤습니다." },
  { id: null, name: "곤드레나물", size: "120g", price: 7000, category: "밑반찬" },
  { id: null, name: "고사리나물", size: "120g", price: 7000,
    image: "/products/gosari.jpg", category: "밑반찬",
    blurb: "국산 고사리만 씁니다." },
  { id: null, name: "우엉볶음", size: "90g", price: 7000, category: "밑반찬" },
  { id: "12312219354", name: "오이지무침", size: "120g", price: null, category: "밑반찬",
    blurb: "새콤달콤하게, 아삭한 식감을 살렸습니다." },
  { id: null, name: "아몬드멸치볶음", size: "75g", price: null, category: "밑반찬",
    blurb: "딱딱해지지 않게, 바삭하게만 볶았습니다." },
  { id: null, name: "메추리알장조림", price: null, category: "밑반찬",
    blurb: "양지 육수로 조려 냈습니다." },

  // ── 김치·젓갈 ─────────────────────────────────────────────
  { id: null, name: "오이소박이", size: "700g", price: 12500, category: "김치·젓갈" },
  { id: null, name: "깻잎김치", size: "300g", price: 10000, category: "김치·젓갈" },
  { id: null, name: "배추겉절이", size: "450g", price: 9000, category: "김치·젓갈", soldOut: true },
  { id: null, name: "백명란젓", size: "150g", price: null,
    image: "/products/baek-myeongran.jpg", category: "김치·젓갈",
    blurb: "짜지 않게 담근 백명란젓." },
  { id: null, name: "열무김치", price: null, category: "김치·젓갈" },
  { id: null, name: "나박김치", price: null, category: "김치·젓갈" },
  { id: null, name: "백김치", price: null, category: "김치·젓갈" },
  { id: null, name: "씨앗젓갈", price: null, category: "김치·젓갈" },

  // ── 명절·선물 ─────────────────────────────────────────────
  {
    id: "12374845727", name: "설 차례상 (중)", price: null, category: "명절·선물",
    blurb: "명절 상차림을 한 번에. 시즌 한정 예약을 받습니다.",
  },
];

export const HERO_PRODUCTS = PRODUCTS.filter((p) => p.hero);
export const byCategory = (c: Category) => PRODUCTS.filter((p) => p.category === c);
export const formatPrice = (p: Product) =>
  p.price === null ? "스토어에서 확인" : `${p.price.toLocaleString("ko-KR")}원`;

/* ────────────────────────────────────────────────────────────────
   상품 상세 페이지용 — slug / 원재료 / 조리·보관 / 관련 레시피
   URL은 검색엔진이 읽기 쉽게 영문 slug 로 둔다.
   ──────────────────────────────────────────────────────────────── */

export const SLUGS: Record<string, string> = {
  한우투뿔양지장조림: "hanwoo-jangjorim",
  한우투뿔양지곰탕: "hanwoo-gomtang",
  한우투뿔육개장: "hanwoo-yukgaejang",
  한우사골우거지탕: "hanwoo-ugeoji-tang",
  들깨버섯탕: "deulkkae-beoseot-tang",
  한우투뿔양지미역국: "hanwoo-miyeokguk",
  명란순두부: "myeongran-sundubu",
  수제청국장: "sujecheonggukjang",
  투뿔한우소불고기: "hanwoo-bulgogi",
  한돈목살제육봄음: "handon-jeyuk",
  한돈목살제육볶음: "handon-jeyuk",
  "모듬전 (새우완자전·한우육전)": "modeumjeon",
  국내산닭갈비: "dakgalbi",
  한돈돈까스: "handon-donkkaseu",
  소고기잡채: "sogogi-japchae",
  명란무침: "myeongran-muchim",
  유니짜장소스: "unijjajang",
  진미채: "jinmichae",
  도라지초무침: "doraji-chomuchim",
  곤드레나물: "gondre-namul",
  고사리나물: "gosari-namul",
  우엉볶음: "ueong-bokkeum",
  오이지무침: "oiji-muchim",
  아몬드멸치볶음: "almond-myeolchi",
  메추리알장조림: "mechurial-jangjorim",
  오이소박이: "oi-sobagi",
  깻잎김치: "kkaennip-kimchi",
  배추겉절이: "baechu-geotjeori",
  백명란젓: "baek-myeongranjeot",
  열무김치: "yeolmu-kimchi",
  나박김치: "nabak-kimchi",
  백김치: "baek-kimchi",
  씨앗젓갈: "ssiat-jeotgal",
  "설 차례상 (중)": "seol-charyesang",
};

export const slugOf = (p: Product) => SLUGS[p.name] ?? encodeURIComponent(p.name);
export const getProductBySlug = (slug: string) => PRODUCTS.find((p) => slugOf(p) === slug);

export interface ProductDetail {
  /** 한 줄 헤드라인 — 이 음식을 한마디로 */
  headline?: string;
  /** 이 음식이 시작된 이야기 (브랜드 서사와 연결) */
  origin?: string[];
  /** 만드는 방식 설명 */
  story?: string;
  /** 사진으로 보는 이야기 */
  gallery?: { src: string; alt: string; caption?: string }[];
  /** 원재료 — 확인된 것만. 미확인이면 넣지 않는다. */
  ingredients?: string[];
  /** 데우는 법 */
  howto?: string[];
  /** 보관 */
  storage?: string;
  /** 이렇게 드시면 좋습니다 */
  tips?: string[];
  /** 관련 레시피 slug */
  recipe?: string;
  /** 관련 부엌일기 slug */
  journal?: string[];
  /** 이럴 때 찾으세요 — 검색 의도 대응 (SEO) */
  occasions?: string[];
}

export const DETAILS: Record<string, ProductDetail> = {
  한우투뿔양지장조림: {
    headline: "고기를 안 먹는 아이가 있었습니다. 그래서 고기부터 바꿨습니다.",
    origin: [
      "라나가 네다섯 살 때였습니다. 다른 아이들은 장조림을 그렇게 잘 먹는다는데, 라나는 시중 장조림을 씹다가 입안에서 퍽퍽해질 때까지 물고만 있었습니다. 밖에서 아무리 좋은 고기를 사줘도 조금 씹다가 결국 뱉어 버렸습니다.",
      "그 모습을 보면서 생각했습니다. 레시피를 고칠 게 아니라 고기를 바꿔야겠다고. 오래 씹어도 부드럽고 고소한 부위를 찾기 시작했습니다.",
      "고기를 먼저 바꾸고, 그다음에 아이도 간장 국물을 떠먹을 수 있을 만큼 짜지 않게 계속 고쳤습니다. 그렇게 라나를 위해 만든 장조림이 지금의 라나엄마 장조림이 되었습니다.",
    ],
    story:
      "마장동에서 1++ 등급 중에서도 7·8·9등급만 선별해 받습니다. 시중에서 장조림용으로 흔히 쓰는 부위가 아닙니다. 한 마리에서 나오는 양이 많지 않아 2~3일 동안 물량을 모아 입고받습니다. 지방이 적당히 섞여 있어 씹을수록 고소하고, 오래 씹어도 입안에서 퍽퍽해지지 않는 부위이기 때문입니다. 저는 장조림을 간장 맛으로 먹는 반찬이 아니라, 고기 자체가 맛있는 메인 반찬으로 만들고 싶었습니다.",
    gallery: [
      { src: "/journal/shop-case.jpg", alt: "매장 쇼케이스", caption: "매장 시절, 이 유리 앞에서 제일 많이 나갔습니다." },
      { src: "/journal/dish-mechurial.jpg", alt: "메추리알 장조림", caption: "같은 간장으로 메추리알도 조립니다." },
    ],
    ingredients: ["한우 양지 (1++ 등급 7·8·9, 마장동 선별)", "진간장", "설탕", "국내산 마늘", "청양고추", "통후추"],
    howto: [
      "냉장고에서 해동합니다.",
      "먹을 만큼만 덜어 전자레인지에 30초~1분 데웁니다.",
      "전체를 다 데우지 마세요. 여러 번 데우면 고기가 질겨집니다.",
    ],
    storage: "냉장 보관. 개봉 후에는 되도록 일주일 안에 드세요.",
    tips: [
      "국물까지 드셔 보세요. 아이가 떠먹어도 될 만큼 짜지 않게 맞췄습니다. 남은 간장은 밥에 비벼 드시면 그게 또 별미입니다.",
      "아이에게 주실 때는 결을 따라 한 번 더 잘게 찢어 주세요.",
      "냉동해서 여행 갈 때 가져가시는 분들도 계십니다.",
    ],
    recipe: "hanwoo-jangjorim",
    journal: ["morning-showcase", "with-lana"],
    occasions: ["고기를 잘 안 먹는 아이", "밥은 있는데 반찬이 없을 때", "어르신께 보내드릴 때", "명절 선물"],
  },

  한우투뿔양지곰탕: {
    headline: "153에서 팔던 그 국물입니다.",
    origin: [
      "2018년 미사강변에서 153을 할 때 상에 올리던 국입니다. 긴 나무 테이블에 앉은 분들이 밥을 말아 드시던 그 곰탕이고, 지금도 만드는 방식은 그대로입니다.",
      "그때 멀리 계셔서 못 오시는 분들께 아이스팩을 넣어 보내드리기 시작한 것이 지금 하는 일의 시작이 되었습니다.",
    ],
    story:
      "한우 양지를 오래 고아 낸 국물입니다. 조미료를 넣지 않고 천일염으로만 간을 맞춥니다. 고기는 두툼하게 썰어 넣어 밥을 말면 한 그릇이 든든합니다.",
    gallery: [
      { src: "/journal/153-bapsang.jpg", alt: "153의 밥상", caption: "153에서 내던 상. 국이 늘 가운데 있었습니다." },
      { src: "/journal/153-table.jpg", alt: "153의 긴 테이블", caption: "모르는 분들이 나란히 앉아 드셨습니다." },
    ],
    ingredients: ["한우 양지 (국내산)", "물", "천일염", "대파"],
    howto: ["냉장에서 해동합니다.", "냄비에 붓고 끓기 시작하면 2~3분 더 끓입니다.", "밥을 말고 파를 올려 드세요."],
    storage: "받으신 뒤 바로 냉동실에 넣어 주세요.",
    tips: [
      "간은 일부러 심심하게 맞췄습니다. 드시면서 소금으로 맞춰 드세요.",
      "밥을 말기 전에 파를 넉넉히 올리면 국물 맛이 달라집니다.",
    ],
    recipe: "gomtang",
    journal: ["153-misagangbyeon"],
    occasions: ["몸이 허할 때", "입맛 없는 어르신께", "해장", "아이 국"],
  },

  한우투뿔양지미역국: {
    headline: "산모도, 아이도 먹을 수 있게.",
    origin: [
      "아이를 낳고 나서 제가 제일 많이 먹은 국입니다. 그때 알았습니다. 산모에게는 간이 세면 안 되고, 미역은 충분히 불려야 하고, 고기는 얇아야 목으로 넘어간다는 걸요.",
      "출산 선물로 보내 달라는 주문이 가장 많은 메뉴입니다. 받으실 분 주소로 바로 보내드립니다.",
    ],
    story: "미역은 부드럽게 불리고 한우 양지는 얇게 썰어 넣습니다. 참기름에 볶아 국간장으로만 간을 맞춥니다.",
    gallery: [
      { src: "/journal/apron-item.jpg", alt: "작은 리넨 앞치마", caption: "이 아이를 낳고 알게 된 것들이 많습니다." },
    ],
    ingredients: ["한우 양지 (국내산)", "미역", "국간장", "참기름", "마늘"],
    howto: ["냉장에서 해동합니다.", "냄비에 붓고 한소끔 끓입니다."],
    storage: "냉동 보관.",
    tips: [
      "아이에게 주실 때는 고기를 가위로 한 번 더 잘라 주세요.",
      "산모께 보내실 때는 밥과 함께 드시도록 안내해 주세요.",
    ],
    journal: ["with-lana"],
    occasions: ["출산 선물", "산후조리", "생일상", "아이 국"],
  },

  한우투뿔육개장: {
    headline: "건더기로 배가 부른 육개장.",
    origin: [
      "육개장은 파는 곳이 워낙 많습니다. 그래서 국물보다 건더기로 승부를 봅니다. 고사리와 대파와 콩나물을 국물이 안 보일 만큼 넣습니다.",
    ],
    story: "한우 양지로 국물을 내고 고사리·대파·콩나물을 넉넉히 넣었습니다. 반찬 없이 이것 하나로 한 끼가 됩니다.",
    gallery: [{ src: "/journal/cook-namul.jpg", alt: "손질해 둔 나물", caption: "고사리는 국산만 씁니다." }],
    howto: ["냉장에서 해동한 뒤 끓여 드세요."],
    storage: "냉동 보관.",
    tips: ["칼국수 면이나 당면을 넣으면 한 그릇이 두 그릇이 됩니다."],
    occasions: ["얼큰한 게 당길 때", "반찬 없이 한 끼", "해장"],
  },

  한돈돈까스: {
    headline: "튀기지 않은 채로 보내드립니다.",
    origin: [
      "돈까스는 튀겨서 보내면 눅눅해집니다. 그래서 튀기지 않은 상태로 냉동해 보내드립니다. 집에서 튀기는 그 3분이 맛의 전부입니다.",
    ],
    story: "국내산 한돈 등심을 두툼하게 썰어 고운 빵가루를 입혔습니다. 아이들이 제일 좋아하는 메뉴이기도 합니다.",
    ingredients: ["돼지 등심 (국내산 한돈)", "빵가루", "밀가루", "달걀"],
    howto: ["냉장에서 해동합니다.", "기름을 넉넉히 두르고 170~180℃에서 앞뒤로 3~4분 튀깁니다.", "기름을 빼고 썰어 드세요."],
    storage: "냉동 보관.",
    tips: ["기름이 충분히 뜨거울 때 넣어야 기름을 덜 먹습니다.", "튀긴 뒤 1~2분 세워 두면 더 바삭합니다."],
    occasions: ["아이 반찬", "주말 점심", "간식"],
  },

  들깨버섯탕: {
    headline: "이렇게 걸쭉하게 파는 곳이 많지 않습니다.",
    origin: [
      "들깨탕은 묽게 파는 곳이 많습니다. 저는 들깨를 곱게 갈아 넉넉히 넣어 걸쭉하게 만듭니다. 숟가락이 설 정도는 아니지만, 국물이 밥에 붙을 정도는 됩니다.",
    ],
    story: "멸치육수를 깊게 내고 들깨를 곱게 갈아 넣습니다. 버섯은 여러 가지를 섞어 씹는 맛을 살렸습니다.",
    storage: "냉동 보관.",
    tips: ["칼국수 면을 넣으면 들깨칼국수가 됩니다.", "들깨는 가라앉으니 데우기 전에 한 번 저어 주세요."],
    occasions: ["속이 편한 게 필요할 때", "채식 위주 식사", "쌀쌀한 날"],
  },

  소고기잡채: {
    headline: "명절에 잡채까지 만들기는 어렵습니다.",
    origin: [
      "명절 전에 가장 많이 나가는 메뉴입니다. 잡채는 재료가 많아 손이 제일 많이 갑니다. 그래서 다 볶아서 냉동해 두었습니다.",
    ],
    story: "국내산 참깨와 한우로 만들어 냉동했습니다. 살짝 해동해 팬에 볶기만 하면 갓 만든 것처럼 됩니다.",
    howto: ["냉장에서 살짝 해동합니다.", "달군 팬에 기름을 조금 두르고 볶습니다."],
    storage: "냉동 보관.",
    journal: ["gift-box"],
    occasions: ["명절 상차림", "손님상", "생일상"],
  },

  투뿔한우소불고기: {
    headline: "누구 하나 안 먹는 사람이 없습니다.",
    origin: ["온 가족이 모이는 날 제일 안전한 메뉴입니다. 아이도 먹고 어르신도 드십니다."],
    story: "간장 양념에 재워 고기 속까지 배게 했습니다. 채소를 곁들여 팬에 볶기만 하면 됩니다.",
    storage: "냉동 보관.",
    tips: ["당면을 함께 넣으면 불고기전골이 됩니다."],
    occasions: ["가족 모임", "명절", "손님상", "생일상"],
  },

  명란순두부: {
    headline: "맑은데 깊습니다.",
    story: "고춧가루로 색을 내지 않고 명란으로 맛을 냅니다. 순두부는 부드러운 것으로만 씁니다.",
    storage: "냉동 보관.",
    occasions: ["해장", "아침 식사", "속이 불편할 때"],
  },

  수제청국장: {
    headline: "여덟 살 라나가 제일 좋아하는 음식입니다.",
    origin: [
      "라나는 편식이 심한 아이입니다. 그런데 좋아하는 게 조금 독특합니다. 토마토 파스타, 그리고 청국장.",
      "아이가 좋아하니 대충 만들 수가 없었습니다. 청국장은 파는 것마다 냄새와 맛이 제각각이라, 직접 띄운 것만 쓰기로 했습니다.",
    ],
    story: "100% 집에서 띄운 수제 청국장으로 끓입니다. 라나엄마에서 후기가 가장 많은 메뉴이기도 합니다.",
    storage: "냉동 보관.",
    tips: ["두부를 더 넣으시면 아이도 편하게 먹습니다."],
    journal: ["with-lana"],
    occasions: ["집밥이 그리울 때", "아이가 좋아하는 국", "어르신 상", "쌀쌀한 날"],
  },

  한우사골우거지탕: {
    headline: "사골을 오래 고아 우거지를 풀었습니다.",
    story: "한우 사골을 오래 고아 국물을 내고 우거지를 넉넉히 넣었습니다. 된장으로 간을 맞춰 구수합니다.",
    storage: "냉동 보관.",
    occasions: ["쌀쌀한 날", "해장", "어르신 상"],
  },

  명란무침: {
    headline: "밥 한 그릇이 그냥 없어집니다.",
    story: "명란에 참기름과 파를 넣어 무쳤습니다. 그대로 밥에 올려 드시면 됩니다.",
    storage: "냉장 보관.",
    tips: ["뜨거운 밥에 올려 참기름 한 방울 더 두르면 좋습니다.", "김에 싸서 드셔도 좋습니다."],
    occasions: ["반찬 없을 때", "아침 밥상", "술안주"],
  },
};

export const detailOf = (p: Product): ProductDetail | undefined => DETAILS[p.name];
