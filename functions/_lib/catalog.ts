/**
 * 주문 가격은 반드시 서버가 이 가격표로 계산한다. 브라우저가 보낸 가격은 믿지 않는다.
 * 가격표 = src/data/products.ts (스마트스토어 실측) — 사이트와 같은 파일.
 */
import { PRODUCTS, SHIPPING_FEE, slugOf, type Product } from "../../src/data/products";

export interface OrderLine {
  slug: string;
  name: string;
  size?: string;
  price: number;
  qty: number;
}

export const MAX_QTY = 20;
export const MAX_LINES = 30;

export function isOrderable(p: Product): p is Product & { price: number } {
  return typeof p.price === "number" && p.price > 0 && !p.soldOut;
}

const BY_SLUG = new Map(PRODUCTS.map((p) => [slugOf(p), p]));

export function priceOrder(input: unknown):
  | { ok: true; lines: OrderLine[]; subtotal: number; shipping: number; total: number }
  | { ok: false; error: string } {
  if (!Array.isArray(input) || input.length === 0) return { ok: false, error: "담긴 상품이 없어요." };
  if (input.length > MAX_LINES) return { ok: false, error: "한 번에 담을 수 있는 종류를 넘었어요." };
  const merged = new Map<string, number>();
  for (const raw of input) {
    const slug = typeof raw?.slug === "string" ? raw.slug : "";
    const qty = Number(raw?.qty);
    if (!slug || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return { ok: false, error: "수량을 확인해 주세요." };
    merged.set(slug, (merged.get(slug) ?? 0) + qty);
  }
  const lines: OrderLine[] = [];
  for (const [slug, qty] of merged) {
    const p = BY_SLUG.get(slug);
    if (!p) return { ok: false, error: "없는 상품이 담겨 있어요. 장바구니를 비우고 다시 담아 주세요." };
    if (!isOrderable(p)) return { ok: false, error: `「${p.name}」은(는) 지금 주문할 수 없어요.` };
    if (qty > MAX_QTY) return { ok: false, error: "수량을 확인해 주세요." };
    lines.push({ slug, name: p.name, size: p.size, price: p.price, qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = SHIPPING_FEE; // ⚠️ 무료배송 기준은 스토어 정책 확인 전까지 두지 않는다
  return { ok: true, lines, subtotal, shipping, total: subtotal + shipping };
}

export function orderName(lines: OrderLine[]): string {
  const first = lines[0].name;
  const rest = lines.length - 1;
  return rest > 0 ? `${first} 외 ${rest}건` : first;
}
