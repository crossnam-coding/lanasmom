"use client";
/** 장바구니 = 이 브라우저에만 저장(localStorage). 가격은 표시용일 뿐 — 결제 금액은 서버가 다시 계산한다 */
export interface CartItem {
  slug: string;
  qty: number;
}

const KEY = "lanasmom_cart_v1";
const EVT = "lanasmom-cart";
export const CHECKOUT_ON = process.env.NEXT_PUBLIC_CHECKOUT === "on";

export function readCart(): CartItem[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((i) => typeof i?.slug === "string" && Number.isInteger(i?.qty) && i.qty > 0) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch { /* 사생활 보호 모드 등 */ }
  window.dispatchEvent(new Event(EVT));
}

export function addToCart(slug: string, qty = 1) {
  const items = readCart();
  const hit = items.find((i) => i.slug === slug);
  if (hit) hit.qty = Math.min(20, hit.qty + qty);
  else items.push({ slug, qty: Math.min(20, qty) });
  write(items);
}

export function setQty(slug: string, qty: number) {
  write(readCart().map((i) => (i.slug === slug ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)));
}

export function removeFromCart(slug: string) {
  write(readCart().filter((i) => i.slug !== slug));
}

export function clearCart() {
  write([]);
}

export function onCartChange(fn: () => void): () => void {
  window.addEventListener(EVT, fn);
  window.addEventListener("storage", fn);
  return () => {
    window.removeEventListener(EVT, fn);
    window.removeEventListener("storage", fn);
  };
}
