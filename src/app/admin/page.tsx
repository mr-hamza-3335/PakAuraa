"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Package, Star, Eye, Users, TrendingUp, UserCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getAllProductsClient } from "@/lib/catalog.client";

interface Stats {
  orderCount: number;
  revenue: number;
  pendingReviews: number;
}

interface TrendPoint {
  date: string;
  value: number;
}

interface Traffic {
  viewsToday: number;
  views7d: number;
  uniqueVisitors7d: number;
  topPages: [string, number][];
  trend: TrendPoint[];
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface Sales {
  trend: TrendPoint[];
  topProducts: TopProduct[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [sales, setSales] = useState<Sales | null>(null);
  const [customerCount, setCustomerCount] = useState<number | null>(null);

  useEffect(() => {
    getAllProductsClient().then((list) => setProductCount(list.length));

    fetch("/api/admin/customers")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => setCustomerCount(body?.customers?.length ?? null))
      .catch(() => setCustomerCount(null));

    const supabase = createClient();
    if (!supabase) return;

    (async () => {
      const [{ data: orders }, { count: pendingReviews }] = await Promise.all([
        supabase.from("orders").select("total"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", false),
      ]);

      setStats({
        orderCount: orders?.length ?? 0,
        revenue: orders?.reduce((sum: number, o: { total: number }) => sum + o.total, 0) ?? 0,
        pendingReviews: pendingReviews ?? 0,
      });
    })();

    (async () => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const sevenDaysAgo = new Date(now.getTime() - 7 * DAY_MS);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);

      const [{ count: viewsToday }, { count: views7d }, { data: sessions7d }, { data: recent }] = await Promise.all([
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
        supabase.from("page_views").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("page_views").select("session_id").gte("created_at", sevenDaysAgo.toISOString()).limit(20000),
        supabase.from("page_views").select("path, created_at").gte("created_at", fourteenDaysAgo.toISOString()).limit(20000),
      ]);

      const uniqueVisitors7d = new Set((sessions7d ?? []).map((r) => r.session_id)).size;

      const pageCounts = new Map<string, number>();
      const dayCounts = new Map<string, number>();
      for (const r of recent ?? []) {
        pageCounts.set(r.path, (pageCounts.get(r.path) ?? 0) + 1);
        const day = r.created_at.slice(0, 10);
        dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
      }
      const topPages = [...pageCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5) as [string, number][];
      const trend: TrendPoint[] = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(fourteenDaysAgo.getTime() + i * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        return { date: key, value: dayCounts.get(key) ?? 0 };
      });

      setTraffic({ viewsToday: viewsToday ?? 0, views7d: views7d ?? 0, uniqueVisitors7d, topPages, trend });
    })();

    (async () => {
      const now = new Date();
      const fourteenDaysAgo = new Date(now.getTime() - 14 * DAY_MS);

      const { data: recentOrders } = await supabase
        .from("orders")
        .select("total, items, created_at")
        .gte("created_at", fourteenDaysAgo.toISOString());

      const revenueByDay = new Map<string, number>();
      const productStats = new Map<string, TopProduct>();

      for (const o of recentOrders ?? []) {
        const day = (o.created_at as string).slice(0, 10);
        revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + o.total);

        for (const item of (o.items ?? []) as { product?: { id?: string; name?: string }; price: number; quantity: number }[]) {
          const id = item.product?.id ?? item.product?.name;
          const name = item.product?.name;
          if (!id || !name) continue;
          const cur = productStats.get(id) ?? { name, qty: 0, revenue: 0 };
          cur.qty += item.quantity;
          cur.revenue += item.price * item.quantity;
          productStats.set(id, cur);
        }
      }

      const trend: TrendPoint[] = Array.from({ length: 14 }, (_, i) => {
        const d = new Date(fourteenDaysAgo.getTime() + i * DAY_MS);
        const key = d.toISOString().slice(0, 10);
        return { date: key, value: revenueByDay.get(key) ?? 0 };
      });
      const topProducts = [...productStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

      setSales({ trend, topProducts });
    })();
  }, []);

  const cards = [
    { label: "Total Orders", value: stats?.orderCount ?? "—", Icon: ShoppingCart },
    { label: "Revenue (PKR)", value: stats ? stats.revenue.toLocaleString() : "—", Icon: DollarSign },
    { label: "Products Live", value: productCount ?? "—", Icon: Package },
    { label: "Pending Reviews", value: stats?.pendingReviews ?? "—", Icon: Star },
    { label: "Registered Customers", value: customerCount ?? "—", Icon: UserCircle },
  ];

  const trafficCards = [
    { label: "Visits Today", value: traffic?.viewsToday ?? "—", Icon: Eye },
    { label: "Visits (7 Days)", value: traffic?.views7d ?? "—", Icon: TrendingUp },
    { label: "Unique Visitors (7 Days)", value: traffic?.uniqueVisitors7d ?? "—", Icon: Users },
  ];

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Dashboard</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>Live figures from your Supabase orders, reviews, and traffic tables.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="border border-gold/12 bg-charcoal/30 p-6">
            <Icon size={18} className="text-gold mb-4" strokeWidth={1.5} />
            <p className="text-[24px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>{value}</p>
            <p className="text-[10px] text-muted tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{label}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gold tracking-[0.3em] uppercase mt-10 mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Customer Traffic</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {trafficCards.map(({ label, value, Icon }) => (
          <div key={label} className="border border-gold/12 bg-charcoal/30 p-6">
            <Icon size={18} className="text-gold mb-4" strokeWidth={1.5} />
            <p className="text-[24px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>{value}</p>
            <p className="text-[10px] text-muted tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-gold/12 bg-charcoal/30 p-6">
          <p className="text-[12px] text-cream mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Visits — Last 14 Days</p>
          {traffic ? (
            <TrendChart data={traffic.trend} emptyLabel="No visits recorded yet." formatValue={(v) => `${v} visits`} />
          ) : (
            <p className="text-[11px] text-muted">Loading…</p>
          )}
        </div>

        <div className="border border-gold/12 bg-charcoal/30 p-6">
          <p className="text-[12px] text-cream mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Top Pages (14 Days)</p>
          {traffic && traffic.topPages.length > 0 ? (
            <ul className="space-y-3">
              {traffic.topPages.map(([path, count]) => (
                <li key={path} className="flex items-center justify-between gap-3 text-[11px]" style={{ fontFamily: "var(--font-body-family)" }}>
                  <span className="text-warm-gray truncate">{path}</span>
                  <span className="text-gold flex-shrink-0">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No visits recorded yet.</p>
          )}
        </div>
      </div>

      <p className="text-[10px] text-gold tracking-[0.3em] uppercase mt-10 mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Sales</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-gold/12 bg-charcoal/30 p-6">
          <p className="text-[12px] text-cream mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Revenue — Last 14 Days</p>
          {sales ? (
            <TrendChart data={sales.trend} emptyLabel="No sales recorded yet." formatValue={(v) => `PKR ${v.toLocaleString()}`} />
          ) : (
            <p className="text-[11px] text-muted">Loading…</p>
          )}
        </div>

        <div className="border border-gold/12 bg-charcoal/30 p-6">
          <p className="text-[12px] text-cream mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Top Products (14 Days)</p>
          {sales && sales.topProducts.length > 0 ? (
            <ul className="space-y-3">
              {sales.topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 text-[11px]" style={{ fontFamily: "var(--font-body-family)" }}>
                  <span className="text-warm-gray truncate">{p.name} <span className="text-muted">×{p.qty}</span></span>
                  <span className="text-gold flex-shrink-0">PKR {p.revenue.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No sales recorded yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 border border-gold/12 bg-charcoal/30 p-6">
        <p className="text-[12px] text-cream mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Shipping</p>
        <p className="text-[12px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
          Free shipping, Pakistan-wide, on every order — 3–5 business days. Returns accepted within 5 days of delivery — contact us for any reason and we&apos;ll make it right.
        </p>
      </div>
    </div>
  );
}

function TrendChart({ data, emptyLabel, formatValue }: { data: TrendPoint[]; emptyLabel: string; formatValue: (v: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 560;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: height - padding - (d.value / max) * (height - padding * 2),
    ...d,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  if (data.every((d) => d.value === 0)) {
    return <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>{emptyLabel}</p>;
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]" onMouseLeave={() => setHover(null)}>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#3A3636" strokeWidth={1} />
        <path d={path} fill="none" stroke="#C9A84C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <rect key={p.date} x={p.x - stepX / 2} y={0} width={stepX || width} height={height} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
        {hover !== null && (
          <>
            <line x1={points[hover].x} y1={padding} x2={points[hover].x} y2={height - padding} stroke="#6B6460" strokeWidth={1} strokeDasharray="2,2" />
            <circle cx={points[hover].x} cy={points[hover].y} r={4} fill="#C9A84C" stroke="#080808" strokeWidth={2} />
          </>
        )}
      </svg>
      {hover !== null && (
        <div
          className="absolute -top-2 px-2 py-1 bg-charcoal border border-gold/20 text-[10px] text-cream pointer-events-none whitespace-nowrap"
          style={{ left: `${(points[hover].x / width) * 100}%`, transform: "translate(-50%, -100%)", fontFamily: "var(--font-body-family)" }}
        >
          {new Date(points[hover].date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {formatValue(points[hover].value)}
        </div>
      )}
    </div>
  );
}
