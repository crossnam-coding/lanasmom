import { json, type Env } from "../../_lib/env";
import { getSettings, kstDate } from "../../_lib/settings";
import type { OrderRow } from "../../_lib/orders";
import type { OrderLine } from "../../_lib/catalog";

/**
 * 대시보드 — 날짜(KST, 결제일 기준)별 매출·판매량·수익 + 오늘/내일 보낼 것 + 만들 것 합계 + CS 대기.
 * 수익 = 순매출(결제 − 환불) − 상품 원가 − 결제 수수료 − (택배비 + 포장비) × 박스 수
 * 원가·수수료·택배비가 비어 있으면 그 항목은 빼고 계산하고 missing 에 적는다(숫자를 지어내지 않음).
 */
const COUNTED = ["paid", "preparing", "shipped", "refunded"];
const OPEN = ["paid", "preparing"];

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const days = Math.min(90, Math.max(7, Number(new URL(request.url).searchParams.get("days")) || 14));
  const st = await getSettings(env);
  const costs = new Map(((await env.DB.prepare("SELECT slug, cost FROM product_costs").all<{ slug: string; cost: number }>()).results ?? []).map((c) => [c.slug, c.cost]));
  const today = kstDate();
  const since = new Date(Date.now() - (days + 40) * 86_400_000).toISOString();
  const { results } = await env.DB.prepare(
    `SELECT * FROM orders WHERE status IN (${COUNTED.map(() => "?").join(",")}) AND paid_at >= ? ORDER BY paid_at`,
  ).bind(...COUNTED, since).all<OrderRow>();
  const orders = results ?? [];

  const missing = new Set<string>();
  if (st.pgFeePct === null) missing.add("결제 수수료율");
  if (st.courierCost === null) missing.add("택배비");
  if (st.packCost === null) missing.add("포장비");

  type Day = { date: string; revenue: number; refunds: number; orders: number; qty: number; cost: number; fee: number; ship: number; profit: number };
  const byDay = new Map<string, Day>();
  const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    const date = kstDate(new Date(o.paid_at ?? o.created_at));
    const d = byDay.get(date) ?? { date, revenue: 0, refunds: 0, orders: 0, qty: 0, cost: 0, fee: 0, ship: 0, profit: 0 };
    const lines = JSON.parse(o.items_json) as OrderLine[];
    const net = o.total - (o.refunded ?? 0);
    d.revenue += net;
    d.refunds += o.refunded ?? 0;
    if (o.status !== "refunded") {
      d.orders += 1;
      for (const l of lines) {
        d.qty += l.qty;
        const c = costs.get(l.slug);
        if (c === undefined) missing.add(`원가: ${l.name}`);
        else d.cost += c * l.qty;
        if (date >= kstDate(new Date(Date.now() - (days - 1) * 86_400_000))) {
          const p = byProduct.get(l.slug) ?? { name: l.name, qty: 0, revenue: 0 };
          p.qty += l.qty; p.revenue += l.price * l.qty; byProduct.set(l.slug, p);
        }
      }
      d.ship += (st.courierCost ?? 0) + (st.packCost ?? 0);
    }
    d.fee += Math.round((net * (st.pgFeePct ?? 0)) / 100);
    d.profit = d.revenue - d.cost - d.fee - d.ship;
    byDay.set(date, d);
  }
  const series: Day[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = kstDate(new Date(Date.now() - i * 86_400_000));
    series.push(byDay.get(date) ?? { date, revenue: 0, refunds: 0, orders: 0, qty: 0, cost: 0, fee: 0, ship: 0, profit: 0 });
  }
  const sum = (arr: Day[]) => arr.reduce((a, d) => ({ revenue: a.revenue + d.revenue, orders: a.orders + d.orders, qty: a.qty + d.qty, profit: a.profit + d.profit, refunds: a.refunds + d.refunds }),
    { revenue: 0, orders: 0, qty: 0, profit: 0, refunds: 0 });
  const month = today.slice(0, 7);
  const monthDays = [...byDay.values()].filter((d) => d.date.startsWith(month));

  // 보낼 것: 오늘(밀린 것 포함) / 내일 이후 가장 가까운 발송일
  const open = (await env.DB.prepare(`SELECT * FROM orders WHERE status IN (${OPEN.map(() => "?").join(",")}) ORDER BY ship_date, paid_at`).bind(...OPEN).all<OrderRow>()).results ?? [];
  const tomorrow = kstDate(new Date(Date.now() + 86_400_000));
  const shipToday = open.filter((o) => (o.ship_date ?? today) <= today);
  const shipTomorrow = open.filter((o) => o.ship_date === tomorrow);
  const make = (list: OrderRow[]) => {
    const m = new Map<string, { name: string; size?: string; qty: number }>();
    for (const o of list) for (const l of JSON.parse(o.items_json) as OrderLine[]) {
      const x = m.get(l.slug) ?? { name: l.name, size: l.size, qty: 0 };
      x.qty += l.qty; m.set(l.slug, x);
    }
    return [...m.values()].sort((a, b) => b.qty - a.qty);
  };
  const cs = await env.DB.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'open'").first<{ n: number }>();
  const review = await env.DB.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'review'").first<{ n: number }>();

  return json({
    today: { date: today, ...sum(series.filter((d) => d.date === today)) },
    yesterday: sum(series.filter((d) => d.date === kstDate(new Date(Date.now() - 86_400_000)))),
    month: { label: month, ...sum(monthDays) },
    period: { days, ...sum(series) },
    series,
    topProducts: [...byProduct.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10),
    ship: {
      today: { date: today, count: shipToday.length, make: make(shipToday), overdue: shipToday.filter((o) => (o.ship_date ?? today) < today).length },
      tomorrow: { date: tomorrow, count: shipTomorrow.length, make: make(shipTomorrow) },
    },
    csOpen: cs?.n ?? 0,
    reviewCount: review?.n ?? 0,
    missing: [...missing].slice(0, 30),
    settings: { pgFeePct: st.pgFeePct, courierCost: st.courierCost, packCost: st.packCost },
  });
};
