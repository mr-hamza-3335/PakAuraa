"use client";

import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog.client";
import ProductCard from "@/components/ProductCard";
import { useTranslate } from "@/lib/i18n";

/** A "Recently Viewed" rail, sourced from the persisted store. Renders
 * nothing until there's real history to show — no empty-state clutter. */
export default function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const recentlyViewed = useStore((s) => s.recentlyViewed);
  const products = useCatalog();
  const t = useTranslate();

  const ids = recentlyViewed.filter((id) => id !== currentProductId).slice(0, 4);
  const items = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && !p.comingSoon);

  if (items.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-t border-gold/8">
      <div className="mb-10">
        <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>{t("recentlyViewed")}</p>
        <h2 className="font-display text-[clamp(24px,3vw,36px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>{t("recentlyViewed")}</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
