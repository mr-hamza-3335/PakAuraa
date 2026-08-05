"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, Star, Heart, ShoppingBag, Eye, Scale } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { collections, matchesCategory, type Product } from "@/lib/data";
import { useCatalog } from "@/lib/catalog.client";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";

const categories = [{ id: "all", name: "All Fragrances" }, ...collections.map((c) => ({ id: c.id, name: c.name }))];
const concentrations = ["All", "Eau de Parfum", "Extrait de Parfum"];
const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under PKR 12,000", min: 0, max: 12000 },
  { label: "PKR 12,000–16,000", min: 12000, max: 16000 },
  { label: "Above PKR 16,000", min: 16000, max: Infinity },
];
const sorts = ["Featured", "Price: Low to High", "Price: High to Low", "Newest"];

function ProductCard({ product, idx }: { product: Product; idx: number }) {
  const { addToCart, toggleWishlist, isWishlisted, setQuickView, setCartOpen, toggleCompare, isComparing } = useStore();
  const { currency } = useSettings();
  const wishlisted = isWishlisted(product.id);
  const comparing = isComparing(product.id);
  const size = product.sizes[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col border border-gold/12 bg-charcoal rounded-lg overflow-hidden transition-all duration-400 hover:border-gold/35"
      style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}
      whileHover={{ y: -3, boxShadow: "0 14px 50px rgba(201,168,76,0.1), 0 4px 24px rgba(0,0,0,0.8)" }}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-[8px] tracking-[0.2em] uppercase bg-gold text-obsidian px-2.5 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist + Compare */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          aria-label="Wishlist"
          onClick={() => toggleWishlist(product.id)}
          className="w-8 h-8 flex items-center justify-center bg-obsidian/70 backdrop-blur-sm border border-gold/18 rounded-full transition-all hover:border-gold/45"
        >
          <Heart size={13} strokeWidth={1.5} className={wishlisted ? "fill-gold text-gold" : "text-warm-gray"} />
        </button>
        <button
          aria-label="Add to Compare"
          onClick={() => toggleCompare(product.id)}
          className={`w-8 h-8 flex items-center justify-center bg-obsidian/70 backdrop-blur-sm border rounded-full transition-all ${
            comparing ? "border-gold/60" : "border-gold/18 hover:border-gold/45"
          }`}
        >
          <Scale size={13} strokeWidth={1.5} className={comparing ? "text-gold" : "text-warm-gray"} />
        </button>
      </div>

      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className={`relative aspect-square overflow-hidden ${product.gradient}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex items-center justify-center gap-2">
            <motion.button
              onClick={(e) => { e.preventDefault(); addToCart(product, size.ml, size.price); setCartOpen(true); }}
              className="flex items-center gap-1.5 bg-gold text-obsidian text-[9px] tracking-[0.15em] uppercase px-4 py-2.5"
              style={{ fontFamily: "var(--font-body-family)" }}
              whileTap={{ scale: 0.97 }}
            >
              <ShoppingBag size={11} strokeWidth={2} /> Add
            </motion.button>
            <motion.button
              onClick={(e) => { e.preventDefault(); setQuickView(product); }}
              className="w-9 h-9 border border-gold/40 text-gold flex items-center justify-center"
              whileTap={{ scale: 0.97 }}
            >
              <Eye size={13} strokeWidth={1.5} />
            </motion.button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[8px] text-gold tracking-[0.22em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{product.collection}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-elegant text-[16px] text-cream leading-tight mb-2 group-hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-elegant-family)" }}>
            {product.name}
          </h3>
        </Link>
        <div className="flex gap-0.5 mb-3">
          {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={9} className="fill-gold text-gold" />)}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gold/10">
          <span className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice(size.price, currency)}</span>
          <span className="text-[9px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>{size.ml}ml</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense fallback={null}>
      <CollectionsPageInner />
    </Suspense>
  );
}

function CollectionsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const products = useCatalog();
  const activeCat = searchParams.get("cat") ?? "all";
  const activeFamily = searchParams.get("family");

  const [concentration, setConcentration] = useState("All");
  const [priceIdx, setPriceIdx] = useState(0);
  const [sort, setSort] = useState(searchParams.get("sort") === "new" ? "Newest" : "Featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const families = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.fragranceFamily))).sort(),
    [products]
  );

  const setCategory = (cat: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === "all") params.delete("cat");
    else params.set("cat", cat);
    router.push(params.toString() ? `/collections?${params.toString()}` : "/collections", { scroll: false });
  };

  const setFamily = (family: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!family) params.delete("family");
    else params.set("family", family.toLowerCase());
    router.push(params.toString() ? `/collections?${params.toString()}` : "/collections", { scroll: false });
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCat !== "all") list = list.filter((p) => matchesCategory(p, activeCat));
    if (activeFamily) {
      const f = activeFamily.toLowerCase();
      list = list.filter((p) => p.fragranceFamily.some((fam) => fam.toLowerCase() === f));
    }
    if (concentration !== "All") list = list.filter((p) => p.concentration === concentration);
    const range = priceRanges[priceIdx];
    list = list.filter((p) => p.price >= range.min && p.price <= range.max);
    if (sort === "Price: Low to High") list.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") list.sort((a, b) => b.price - a.price);
    if (sort === "Newest") {
      list.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
    }
    return list;
  }, [products, activeCat, activeFamily, concentration, priceIdx, sort]);

  const activeCategoryLabel = activeFamily
    ? `${activeFamily.charAt(0).toUpperCase()}${activeFamily.slice(1)} Family`
    : categories.find((c) => c.id === activeCat)?.name ?? "All Fragrances";

  return (
    <>
      <Header />
      <main className="pt-20 bg-obsidian min-h-screen">
        {/* Hero banner */}
        <section className="relative h-[340px] flex items-center justify-center overflow-hidden border-b border-gold/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0f] to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,_rgba(201,168,76,0.08)_0%,_transparent_60%)]" />
          <div className="relative z-10 text-center px-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-[9px] text-gold tracking-[0.4em] uppercase mb-5"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Explore
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display text-[clamp(36px,6vw,72px)] text-cream leading-tight mb-4"
              style={{ fontFamily: "var(--font-display-family)" }}
            >
              {activeCategoryLabel}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-[14px] text-warm-gray"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {filtered.length} of {products.length} luxury fragrances, crafted for the extraordinary
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        </section>

        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">
          {/* Category pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 text-[9px] tracking-[0.18em] uppercase px-4 py-2.5 border transition-all duration-300 whitespace-nowrap ${
                  activeCat === c.id ? "border-gold/60 text-gold bg-gold/8" : "border-gold/14 text-warm-gray hover:border-gold/30"
                }`}
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden flex items-center gap-2 border border-gold/25 text-warm-gray text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 hover:border-gold/45 transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <SlidersHorizontal size={13} strokeWidth={1.5} />
              Filters
            </button>

            {/* Desktop filters inline */}
            <div className="hidden lg:flex items-center gap-3 flex-wrap">
              {/* Concentration */}
              <div className="flex items-center gap-1">
                {concentrations.map((c) => (
                  <button
                    key={c}
                    onClick={() => setConcentration(c)}
                    className={`text-[9px] tracking-[0.15em] uppercase px-3 py-2 border transition-all duration-300 ${
                      concentration === c ? "border-gold/60 text-gold bg-gold/8" : "border-gold/14 text-warm-gray hover:border-gold/30"
                    }`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-gold/20" />
              {/* Price */}
              <div className="flex items-center gap-1">
                {priceRanges.map((r, i) => (
                  <button
                    key={r.label}
                    onClick={() => setPriceIdx(i)}
                    className={`text-[9px] tracking-[0.1em] uppercase px-3 py-2 border transition-all duration-300 ${
                      priceIdx === i ? "border-gold/60 text-gold bg-gold/8" : "border-gold/14 text-warm-gray hover:border-gold/30"
                    }`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="w-px h-5 bg-gold/20" />
              {/* Fragrance Family */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setFamily(null)}
                  className={`text-[9px] tracking-[0.1em] uppercase px-3 py-2 border transition-all duration-300 ${
                    !activeFamily ? "border-gold/60 text-gold bg-gold/8" : "border-gold/14 text-warm-gray hover:border-gold/30"
                  }`}
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  All Families
                </button>
                {families.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFamily(f)}
                    className={`text-[9px] tracking-[0.1em] uppercase px-3 py-2 border transition-all duration-300 ${
                      activeFamily === f.toLowerCase() ? "border-gold/60 text-gold bg-gold/8" : "border-gold/14 text-warm-gray hover:border-gold/30"
                    }`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + count */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-charcoal border border-gold/18 text-warm-gray text-[10px] tracking-wider uppercase px-3 py-2 outline-none hover:border-gold/35 transition-colors cursor-pointer"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {sorts.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden mb-6 overflow-hidden border border-gold/14 bg-charcoal p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] text-gold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>Filters</span>
                  <button onClick={() => setFiltersOpen(false)}><X size={16} className="text-warm-gray" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-muted tracking-wider uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Concentration</p>
                    <div className="flex flex-wrap gap-2">
                      {concentrations.map((c) => (
                        <button key={c} onClick={() => setConcentration(c)}
                          className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border transition-all ${concentration === c ? "border-gold/60 text-gold" : "border-gold/14 text-warm-gray"}`}
                          style={{ fontFamily: "var(--font-body-family)" }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted tracking-wider uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Price</p>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((r, i) => (
                        <button key={r.label} onClick={() => setPriceIdx(i)}
                          className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border transition-all ${priceIdx === i ? "border-gold/60 text-gold" : "border-gold/14 text-warm-gray"}`}
                          style={{ fontFamily: "var(--font-body-family)" }}>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted tracking-wider uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Family</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setFamily(null)}
                        className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border transition-all ${!activeFamily ? "border-gold/60 text-gold" : "border-gold/14 text-warm-gray"}`}
                        style={{ fontFamily: "var(--font-body-family)" }}>
                        All
                      </button>
                      {families.map((f) => (
                        <button key={f} onClick={() => setFamily(f)}
                          className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border transition-all ${activeFamily === f.toLowerCase() ? "border-gold/60 text-gold" : "border-gold/14 text-warm-gray"}`}
                          style={{ fontFamily: "var(--font-body-family)" }}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {filtered.length > 0 ? (
            <motion.div
              key={`${concentration}-${priceIdx}-${sort}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-5 relative"
            >
              {filtered.map((p, i) => (
                <div key={p.id} className="relative">
                  <ProductCard product={p} idx={i} />
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-full border border-gold/20 flex items-center justify-center">
                <SlidersHorizontal size={18} strokeWidth={1.2} className="text-gold/50" />
              </div>
              <p className="text-[15px] text-cream mb-2" style={{ fontFamily: "var(--font-elegant-family)" }}>No fragrances match your filters</p>
              <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Try widening your price range or clearing a filter.</p>
              <button
                onClick={() => { setConcentration("All"); setPriceIdx(0); setCategory("all"); setFamily(null); }}
                className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5 hover:border-gold transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
