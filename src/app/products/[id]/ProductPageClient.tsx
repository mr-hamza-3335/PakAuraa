"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ShoppingBag, Star, Share2, ChevronDown, Minus, Plus,
  Sun, Moon, Package, Gift, Pen, Truck, RotateCcw, ArrowRight, Zap, ZoomIn, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product, Review } from "@/lib/data";
import { useStore, GIFT_WRAP_PRICE, ENGRAVE_PRICE } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { productFaqItems } from "@/lib/seo";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import NotifyBackInStock from "@/components/NotifyBackInStock";
import { useTranslate } from "@/lib/i18n";

/* ── Longevity / Projection Meter ───────────────────────── */
function Meter({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const labels = ["", "Very Light", "Light", "Moderate", "Moderate+", "Medium", "Medium+", "Strong", "Very Strong", "Intense", "Beast Mode"];
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-gold opacity-70">{icon}</span>
          <span className="text-[11px] text-warm-gray tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{label}</span>
        </div>
        <span className="text-[10px] text-gold tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{labels[value]}</span>
      </div>
      <div className="h-[3px] bg-gold/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${value * 10}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="h-full rounded-full bg-gradient-to-r from-gold-deep to-gold-light"
        />
      </div>
    </div>
  );
}

/* ── Scent Pyramid ──────────────────────────────────────── */
function ScentPyramid({ notes }: { notes: Product["notes"] }) {
  const [active, setActive] = useState<"top" | "heart" | "base" | null>(null);
  const tiers = [
    { key: "top" as const, label: "Top Notes", sublabel: "First impression · 15–30 min", emoji: "✦", notes: notes.top },
    { key: "heart" as const, label: "Heart Notes", sublabel: "The character · 2–4 hours", emoji: "◈", notes: notes.heart },
    { key: "base" as const, label: "Base Notes", sublabel: "The foundation · 4–12 hours", emoji: "◆", notes: notes.base },
  ];
  return (
    <div className="flex flex-col gap-3">
      {tiers.map((tier, i) => {
        const widths = ["w-[55%]", "w-[75%]", "w-full"];
        const isActive = active === tier.key;
        return (
          <div key={tier.key} className="flex flex-col items-center">
            <motion.div
              onClick={() => setActive(isActive ? null : tier.key)}
              className={`${widths[i]} cursor-pointer border transition-all duration-400 py-4 px-5 text-center relative overflow-hidden`}
              style={{
                borderColor: isActive ? "rgba(201,168,76,0.6)" : "rgba(201,168,76,0.15)",
                background: isActive ? "rgba(201,168,76,0.07)" : "rgba(17,17,17,0.8)",
              }}
              whileHover={{ borderColor: "rgba(201,168,76,0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.08)_0%,_transparent_70%)]"
                />
              )}
              <p className="text-gold text-sm mb-0.5 relative z-10">{tier.emoji}</p>
              <p className="text-[10px] text-cream tracking-[0.18em] uppercase relative z-10" style={{ fontFamily: "var(--font-body-family)" }}>{tier.label}</p>
              <p className="text-[9px] text-muted tracking-wider mt-0.5 relative z-10" style={{ fontFamily: "var(--font-body-family)" }}>{tier.sublabel}</p>
            </motion.div>
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`${widths[i]} overflow-hidden`}
                >
                  <div className="py-3 px-5 border-x border-b border-gold/15 bg-charcoal/50 flex flex-wrap gap-2 justify-center">
                    {tier.notes.map((n) => (
                      <span key={n} className="text-[10px] text-gold-light tracking-wider border border-gold/20 px-3 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      <p className="text-center text-[9px] text-muted mt-1" style={{ fontFamily: "var(--font-body-family)" }}>
        Tap each tier to reveal the notes
      </p>
    </div>
  );
}

/* ── Accordion ──────────────────────────────────────────── */
function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gold/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left"
      >
        <span className="text-[12px] text-cream tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{title}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={14} strokeWidth={1.5} className="text-warm-gray" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ── Write a Review ─────────────────────────────────────── */
function WriteReview({ productId }: { productId: string }) {
  const [user, setUser] = useState<{ id: string; email?: string; name?: string } | null>(null);
  const [checked, setChecked] = useState(false);
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.full_name });
        setAuthor(data.user.user_metadata?.full_name ?? "");
      }
      setChecked(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !quote.trim()) return;
    const supabase = createClient();
    if (!supabase) return;
    setSubmitting(true);
    setError(null);
    const { error: dbError } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      quote: quote.trim(),
      author: author.trim() || "PakAuraa Customer",
      approved: false,
    });
    setSubmitting(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setDone(true);
  };

  if (!checked) return null;

  if (done) {
    return (
      <div className="mt-8 p-5 border border-gold/20 bg-gold/5 text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
        Thank you — your review is awaiting approval and will appear here once published.
      </div>
    );
  }

  if (!isSupabaseConfigured || !user) {
    return (
      <div className="mt-8 p-5 border border-gold/12 bg-charcoal/30 text-[13px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
        <Link href="/account/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link> to write a review.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-5 border border-gold/12 bg-charcoal/30 space-y-4">
      <p className="text-[10px] text-gold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>Write a Review</p>
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)} aria-label={`${i + 1} stars`}>
            <Star size={18} className={i < rating ? "fill-gold text-gold" : "text-gold/25"} />
          </button>
        ))}
      </div>
      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Your name"
        className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
        style={{ fontFamily: "var(--font-body-family)" }}
      />
      <textarea
        required
        rows={3}
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        placeholder="Share your experience with this fragrance…"
        className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
        style={{ fontFamily: "var(--font-body-family)" }}
      />
      {error && <p className="text-[12px] text-red-300" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>}
      <button
        type="submit"
        disabled={submitting || !quote.trim()}
        className="text-[11px] text-obsidian bg-gold px-6 py-2.5 tracking-[0.15em] uppercase disabled:opacity-50"
        style={{ fontFamily: "var(--font-body-family)" }}
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function ProductPageClient({ product, related, reviews }: { product: Product; related: Product[]; reviews: Review[] }) {
  const router = useRouter();
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(1);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [giftWrap, setGiftWrap] = useState(false);
  const [engrave, setEngrave] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "reviews" | "details">("overview");
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen, addRecentlyViewed } = useStore();
  const { currency } = useSettings();
  const t = useTranslate();
  const primaryCtaRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    // Mobile sticky Add to Cart bar appears once the main CTA scrolls out of
    // view — long luxury PDPs (notes, meters, FAQ) otherwise bury the buy
    // action far below the fold.
    const el = primaryCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Deferred a tick so this always runs after StoreHydration's persist.rehydrate()
    // microtask resolves — otherwise rehydrate's merge can clobber this entry.
    const id = setTimeout(() => addRecentlyViewed(product.id), 0);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const size = product.sizes[selectedSizeIdx];
  const unitAddon = (giftWrap ? GIFT_WRAP_PRICE : 0) + (engrave ? ENGRAVE_PRICE : 0);
  const wishlisted = isWishlisted(product.id);
  const productReviews = reviews;
  const avgRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : null;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product, size.ml, size.price, { giftWrap, engrave });
    setAdded(true);
    setCartOpen(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product, size.ml, size.price, { giftWrap, engrave });
    router.push("/checkout");
  };

  const tabs = ["overview", "notes", "reviews", "details"] as const;

  return (
    <main className="pt-20 bg-obsidian min-h-screen">
      {/* ── BREADCRUMB ── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 border-b border-gold/8">
        <div className="flex items-center gap-2 text-[10px] text-muted tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections" className="hover:text-gold transition-colors">Collections</Link>
          <span>/</span>
          <span className="text-warm-gray">{product.name}</span>
        </div>
      </div>

      {/* ── PRODUCT HERO ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_540px] gap-12 lg:gap-16">

          {/* LEFT: Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => setLightboxOpen(true)}
              className="relative aspect-[4/5] rounded-xl overflow-hidden border border-gold/15 shadow-[0_24px_80px_rgba(0,0,0,0.7)] cursor-zoom-in group"
            >
              <div className={`absolute inset-0 ${product.gradient}`} />
              <Image
                src={product.gallery[activeImage] ?? product.image}
                alt={`${product.name} — ${product.tagline} | Luxury Arabic Perfume by PakAuraa`}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
              <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full glass-dark border border-gold/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <ZoomIn size={15} strokeWidth={1.5} className="text-gold" />
              </div>
              {/* Corner ornaments */}
              {["top-5 left-5", "top-5 right-5 rotate-90", "bottom-5 left-5 -rotate-90", "bottom-5 right-5 rotate-180"].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-8 h-8 opacity-30`}>
                  <div className="absolute top-0 left-0 w-3 h-px bg-gold" />
                  <div className="absolute top-0 left-0 w-px h-3 bg-gold" />
                </div>
              ))}
              {product.badge && (
                <div className="absolute top-5 left-5">
                  <span className="text-[9px] tracking-[0.22em] uppercase bg-gold text-obsidian px-3 py-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                    {product.badge}
                  </span>
                </div>
              )}
            </motion.div>
            {/* Thumbnails */}
            {product.gallery.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.gallery.map((src, i) => (
                  <button
                    key={src + i}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`aspect-square rounded-lg overflow-hidden border transition-colors cursor-pointer relative ${
                      activeImage === i ? "border-gold/60" : "border-gold/15 hover:border-gold/35"
                    }`}
                  >
                    <div className={`absolute inset-0 ${product.gradient}`} />
                    <Image
                      src={src}
                      alt={`${product.name} luxury perfume bottle — photo ${i + 1}`}
                      fill
                      className="object-cover object-center"
                      sizes="25vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col"
          >
            {/* Collection + name */}
            <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
              {product.collection} · {product.concentration}
            </p>
            <h1 className="font-display text-[clamp(32px,4vw,48px)] text-cream leading-tight mb-1" style={{ fontFamily: "var(--font-display-family)" }}>
              {product.name}
            </h1>
            <p className="text-xl text-gold/40 mb-2" style={{ fontFamily: "var(--font-scheherazade), serif" }}>
              {product.arabicName}
            </p>
            <p className="text-[12px] text-gold/70 tracking-wider italic mb-5" style={{ fontFamily: "var(--font-body-family)" }}>
              &ldquo;{product.tagline}&rdquo;
            </p>

            {product.stock !== undefined && product.stock <= 0 && (
              <p className="inline-flex w-fit items-center gap-2 text-[10px] text-red-300 tracking-wider uppercase border border-red-500/25 px-3 py-1.5 mb-5" style={{ fontFamily: "var(--font-body-family)" }}>
                {t("outOfStock")}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={avgRating !== null && i < Math.round(avgRating) ? "fill-gold text-gold" : "text-gold/25"}
                  />
                ))}
              </div>
              <span className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                {avgRating !== null
                  ? `${avgRating.toFixed(1)} (${productReviews.length} review${productReviews.length === 1 ? "" : "s"})`
                  : "Be the first to review"}
              </span>
            </div>

            {/* Audience */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.audience.map((a) => (
                <span
                  key={a}
                  className="text-[9px] text-gold/80 border border-gold/25 px-2.5 py-1 tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {a}
                </span>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-gold/20 to-transparent mb-6" />

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                {formatPrice(size.price, currency)}
              </span>
              <span className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                Excl. shipping
              </span>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] text-warm-gray tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                  Size
                </p>
                <span className="text-[10px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                  {size.ml}ml selected
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.sizes.map((s, i) => (
                  <motion.button
                    key={s.ml}
                    onClick={() => setSelectedSizeIdx(i)}
                    className={`py-3 text-center transition-all duration-300 border ${
                      selectedSizeIdx === i
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-gold/18 text-warm-gray hover:border-gold/35 hover:text-cream"
                    }`}
                    whileTap={{ scale: 0.97 }}
                  >
                    <p className="text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>{s.ml}ml</p>
                    <p className="text-[10px] text-muted mt-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
                      {formatPrice(s.price, currency)}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-[10px] text-warm-gray tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                Qty
              </p>
              <div className="flex items-center border border-gold/20">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-gold transition-colors">
                  <Minus size={13} strokeWidth={1.5} />
                </button>
                <span className="w-12 text-center text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center text-warm-gray hover:text-gold transition-colors">
                  <Plus size={13} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Add to cart / Buy now / Notify Me */}
            <div ref={primaryCtaRef} className="flex flex-col sm:flex-row gap-3 mb-3">
              {product.stock !== undefined && product.stock <= 0 ? (
                <NotifyBackInStock productId={product.id} />
              ) : (
              <>
              <motion.button
                onClick={handleAddToCart}
                className={`flex-1 py-4 text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-3 font-medium transition-all duration-400 relative overflow-hidden ${
                  added
                    ? "bg-[#1a3a1a] border border-green-600/40 text-green-400"
                    : "border border-gold/40 text-gold hover:bg-gold/8"
                }`}
                style={{ fontFamily: "var(--font-body-family)" }}
                whileHover={added ? {} : { scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {added ? (
                  `✓ ${t("addedToCart")}`
                ) : (
                  <>
                    <ShoppingBag size={15} strokeWidth={2} />
                    {t("addToCart")}
                  </>
                )}
              </motion.button>
              <motion.button
                onClick={handleBuyNow}
                className="flex-1 py-4 text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-3 font-medium bg-gradient-to-r from-gold-deep to-gold text-obsidian transition-all duration-400"
                style={{ fontFamily: "var(--font-body-family)" }}
                whileHover={{ scale: 1.01, boxShadow: "0 10px 40px rgba(201,168,76,0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Zap size={15} strokeWidth={2} />
                {t("buyNow")} — {formatPrice((size.price + unitAddon) * qty, currency)}
              </motion.button>
              </>
              )}
            </div>

            <div className="flex gap-3 mb-7">
              <motion.button
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 py-3.5 border text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                  wishlisted ? "border-gold/50 text-gold bg-gold/6" : "border-gold/22 text-warm-gray hover:border-gold/40"
                }`}
                style={{ fontFamily: "var(--font-body-family)" }}
                whileTap={{ scale: 0.97 }}
              >
                <Heart size={13} strokeWidth={1.5} className={wishlisted ? "fill-gold" : ""} />
                {wishlisted ? "Saved" : "Wishlist"}
              </motion.button>
              <button className="w-12 border border-gold/22 text-warm-gray hover:text-gold hover:border-gold/40 flex items-center justify-center transition-all">
                <Share2 size={14} strokeWidth={1.5} />
              </button>
            </div>

            {/* Gift & Engraving */}
            <div className="space-y-3 mb-7 p-4 border border-gold/10 bg-charcoal/30">
              <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Personalise Your Order</p>
              {[
                { key: "gift", state: giftWrap, setter: setGiftWrap, Icon: Gift, label: "Luxury Gift Wrapping", price: "+PKR 200" },
                { key: "engrave", state: engrave, setter: setEngrave, Icon: Pen, label: "Personal Engraving", price: "+PKR 500" },
              ].map(({ key, state, setter, Icon, label, price }) => (
                <button
                  key={key}
                  onClick={() => setter(!state)}
                  className={`w-full flex items-center justify-between p-3 border transition-all duration-300 ${
                    state ? "border-gold/40 bg-gold/6" : "border-gold/12 hover:border-gold/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={14} strokeWidth={1.5} className={state ? "text-gold" : "text-warm-gray"} />
                    <span className="text-[11px] text-cream tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>{price}</span>
                    <div className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-all ${state ? "bg-gold border-gold" : "border-gold/30"}`}>
                      {state && <span className="text-obsidian text-[9px]">✓</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Shipping info */}
            <div className="space-y-2.5">
              {[
                { Icon: Truck, text: "Free shipping, Pakistan-wide — 3–5 business days" },
                { Icon: Package, text: "Delivered in luxury matte black packaging" },
                { Icon: RotateCcw, text: "5-day easy returns, no questions asked" },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={13} strokeWidth={1.5} className="text-gold/60 flex-shrink-0" />
                  <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DETAIL TABS ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-t border-gold/8">
        {/* Tab Nav */}
        <div className="flex gap-0 border-b border-gold/10 mb-12 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3.5 text-[10px] tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-300 flex-shrink-0 ${
                activeTab === tab ? "text-gold" : "text-warm-gray hover:text-cream"
              }`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
              )}
            </button>
          ))}
        </div>

        <>
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            >
              {/* Description */}
              <div>
                <p className="text-[9px] text-gold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>About This Fragrance</p>
                <p className="text-[15px] text-warm-gray leading-[1.9] mb-6" style={{ fontFamily: "var(--font-body-family)" }}>{product.longDescription}</p>

                <div className="mb-8 p-4 border border-gold/12 bg-charcoal/30">
                  <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>The Name</p>
                  <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{product.meaning}</p>
                </div>

                {/* Tags */}
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2.5" style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Family</p>
                    <div className="flex flex-wrap gap-2">
                      {product.fragranceFamily.map((f) => (
                        <Link
                          key={f}
                          href={`/collections?family=${encodeURIComponent(f.toLowerCase())}`}
                          className="text-[10px] text-cream border border-gold/20 px-3 py-1.5 tracking-wider hover:border-gold/45 hover:text-gold transition-colors"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          {f}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2.5" style={{ fontFamily: "var(--font-body-family)" }}>For</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] text-cream border border-gold/20 px-3 py-1.5 tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
                        {product.gender === "men" ? "Men" : product.gender === "women" ? "Women" : "Unisex"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2.5" style={{ fontFamily: "var(--font-body-family)" }}>Occasions</p>
                    <div className="flex flex-wrap gap-2">
                      {product.occasions.map((o) => (
                        <span key={o} className="text-[10px] text-cream border border-gold/20 px-3 py-1.5 tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{o}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2.5" style={{ fontFamily: "var(--font-body-family)" }}>Best Seasons</p>
                    <div className="flex flex-wrap gap-2">
                      {product.seasons.map((s) => (
                        <span key={s} className="text-[10px] text-cream border border-gold/20 px-3 py-1.5 tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-gold tracking-[0.25em] uppercase mb-2.5" style={{ fontFamily: "var(--font-body-family)" }}>Day / Night</p>
                    <div className="flex gap-2">
                      {(product.dayNight === "day" || product.dayNight === "both") && (
                        <span className="flex items-center gap-1.5 text-[10px] text-cream border border-gold/20 px-3 py-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          <Sun size={11} strokeWidth={1.5} className="text-gold" /> Day
                        </span>
                      )}
                      {(product.dayNight === "night" || product.dayNight === "both") && (
                        <span className="flex items-center gap-1.5 text-[10px] text-cream border border-gold/20 px-3 py-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          <Moon size={11} strokeWidth={1.5} className="text-gold" /> Night
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Meters */}
              <div>
                <p className="text-[9px] text-gold tracking-[0.3em] uppercase mb-8" style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Profile</p>
                <div className="space-y-6">
                  <Meter label="Longevity" value={product.longevity} icon={<span className="text-[12px]">◷</span>} />
                  <Meter label="Projection" value={product.projection} icon={<span className="text-[12px]">◎</span>} />
                  <Meter label="Sillage" value={product.sillage} icon={<span className="text-[12px]">≈</span>} />
                </div>

                {/* Details */}
                <div className="mt-10 space-y-3 pt-8 border-t border-gold/10">
                  {[
                    { label: "Concentration", value: product.concentration },
                    { label: "Vibe", value: product.vibe },
                    { label: "Made In", value: product.madeIn },
                    { label: "Bottle Size", value: `${size.ml}ml` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[11px] text-muted tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{label}</span>
                      <span className="text-[11px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-[560px] mx-auto"
            >
              <p className="text-center text-[9px] text-gold tracking-[0.35em] uppercase mb-10" style={{ fontFamily: "var(--font-body-family)" }}>
                Fragrance Pyramid
              </p>
              <ScentPyramid notes={product.notes} />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-[700px]"
            >
              {productReviews.length > 0 ? (
                <>
                  <div className="flex items-center gap-8 mb-10">
                    <div className="text-center">
                      <p className="text-5xl font-display text-gold" style={{ fontFamily: "var(--font-display-family)" }}>
                        {avgRating!.toFixed(1)}
                      </p>
                      <div className="flex gap-1 justify-center my-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={12} className={i < Math.round(avgRating!) ? "fill-gold text-gold" : "text-gold/25"} />
                        ))}
                      </div>
                      <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                        {productReviews.length} review{productReviews.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  {productReviews.map((r) => (
                    <div key={r.id} className="py-6 border-b border-gold/10">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{r.author}</p>
                          <p className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>{r.location}</p>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < r.rating ? "fill-gold text-gold" : "text-gold/20"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{r.quote}</p>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-16 text-center border border-gold/10 bg-charcoal/30">
                  <Star size={22} className="text-gold/30 mx-auto mb-4" />
                  <p className="text-[14px] text-cream mb-2" style={{ fontFamily: "var(--font-body-family)" }}>No reviews yet</p>
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                    Be the first to share your experience with {product.name}.
                  </p>
                </div>
              )}
              <WriteReview productId={product.id} />
            </motion.div>
          )}

          {activeTab === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-[640px]"
            >
              <Accordion title="Full Description">
                <p>{product.longDescription}</p>
              </Accordion>
              <Accordion title="Ingredients">
                <p className="text-[12px] leading-relaxed">{product.ingredients}</p>
              </Accordion>
              <Accordion title="Shipping & Returns">
                <ul className="space-y-2">
                  <li>Free shipping, Pakistan-wide, on every order.</li>
                  <li>Delivered in 3–5 business days.</li>
                  <li>All orders arrive in our signature luxury packaging.</li>
                  <li>Returns accepted within 5 days of delivery — didn&apos;t like it or found an issue? Contact us and we&apos;ll make it right.</li>
                </ul>
              </Accordion>
              <Accordion title="Authenticity Guarantee">
                <p>Every PakAuraa fragrance is sourced, blended and quality-checked in-house. We guarantee 100% authentic fragrances or your money back.</p>
              </Accordion>
              <div className="mt-8 pt-8 border-t border-gold/10">
                <p className="text-[9px] text-gold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                  Frequently Asked Questions
                </p>
                {productFaqItems(product).map((f) => (
                  <Accordion key={f.q} title={f.q}>
                    <p>{f.a}</p>
                  </Accordion>
                ))}
              </div>
            </motion.div>
          )}
        </>
      </section>

      {/* ── RELATED PRODUCTS ── */}
      <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-t border-gold/8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>You May Also Love</p>
            <h2 className="font-display text-[clamp(24px,3vw,36px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>{t("relatedFragrances")}</h2>
          </div>
          <Link href="/collections" className="hidden sm:flex items-center gap-2 text-[10px] text-gold tracking-[0.15em] uppercase hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
            View All <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <RecentlyViewed currentProductId={product.id} />

      {/* ── Gallery lightbox ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 md:p-12"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="absolute top-5 right-5 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center text-cream hover:text-gold transition-colors"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl aspect-[4/5]"
            >
              <Image
                src={product.gallery[activeImage] ?? product.image}
                alt={`${product.name} — ${product.tagline} | Luxury Arabic Perfume by PakAuraa`}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky mobile Add to Cart bar ── */}
      <AnimatePresence>
        {showStickyBar && (product.stock === undefined || product.stock > 0) && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-gold/15 px-4 py-3 flex items-center gap-3"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex-shrink-0 min-w-0">
              <p className="text-[10px] text-cream truncate" style={{ fontFamily: "var(--font-body-family)" }}>{product.name}</p>
              <p className="text-[11px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice((size.price + unitAddon) * qty, currency)}</p>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 font-medium transition-all duration-300 ${
                added ? "bg-[#1a3a1a] border border-green-600/40 text-green-400" : "border border-gold/40 text-gold"
              }`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <ShoppingBag size={13} strokeWidth={2} />
              {added ? t("addedToCart") : t("addToCart")}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 text-[10px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 font-medium bg-gradient-to-r from-gold-deep to-gold text-obsidian"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <Zap size={13} strokeWidth={2} />
              {t("buyNow")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
