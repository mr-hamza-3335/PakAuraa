"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, ShoppingBag, Star, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";
import { getReviewsFor } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export default function QuickView() {
  const { quickViewProduct, setQuickView, addToCart, toggleWishlist, isWishlisted } = useStore();
  const { currency } = useSettings();
  const [selectedSize, setSelectedSize] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  const product = quickViewProduct;

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    const supabase = createClient();
    if (!supabase) {
      // No backend configured — immediate synchronous fallback, not a fetch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReviewCount(getReviewsFor(product.id).length);
      return;
    }
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("product_id", product.id)
      .eq("approved", true)
      .then(({ count }) => {
        if (!cancelled) setReviewCount(count ?? 0);
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  if (!product) return null;

  const size = product.sizes[selectedSize];
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(product, size.ml, size.price);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-obsidian/80 backdrop-blur-sm"
            onClick={() => setQuickView(null)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-[50%] -translate-y-1/2 z-[201] max-w-[860px] mx-auto bg-[#0d0d0d] border border-gold/20 shadow-[0_32px_100px_rgba(0,0,0,0.95)] overflow-hidden"
          >
            {/* Close */}
            <motion.button
              onClick={() => setQuickView(null)}
              whileHover={{ scale: 1.1, rotate: 90 }}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-warm-gray hover:text-gold transition-colors"
            >
              <X size={18} strokeWidth={1.5} />
            </motion.button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto md:min-h-[420px]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, 430px"
                />
                {product.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <span className="text-[9px] tracking-[0.2em] uppercase bg-gold text-obsidian px-3 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-8 flex flex-col">
                <p className="text-[9px] text-gold tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                  {product.collection}
                </p>
                <h2 className="font-display text-2xl text-cream leading-tight mb-1" style={{ fontFamily: "var(--font-display-family)" }}>
                  {product.name}
                </h2>
                <p className="text-lg text-gold/50 mb-3" style={{ fontFamily: "var(--font-scheherazade), serif" }}>
                  {product.arabicName}
                </p>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} className="fill-gold text-gold" />
                  ))}
                  {reviewCount !== null && (
                    <span className="text-[11px] text-warm-gray ml-2" style={{ fontFamily: "var(--font-body-family)" }}>
                      ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                    </span>
                  )}
                </div>

                <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
                  {product.description}
                </p>

                {/* Size selector */}
                <p className="text-[9px] text-warm-gray tracking-[0.2em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
                  Select Size
                </p>
                <div className="flex gap-2 mb-6">
                  {product.sizes.map((s, i) => (
                    <button
                      key={s.ml}
                      onClick={() => setSelectedSize(i)}
                      className={`flex-1 py-2.5 text-[11px] tracking-wider border transition-all duration-300 ${
                        selectedSize === i
                          ? "border-gold bg-gold/10 text-gold"
                          : "border-gold/20 text-warm-gray hover:border-gold/40"
                      }`}
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {s.ml}ml
                    </button>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-2xl text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                    {formatPrice(size.price, currency)}
                  </span>
                  <span className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                    / {size.ml}ml
                  </span>
                </div>

                {/* CTAs */}
                <motion.button
                  onClick={handleAddToCart}
                  className={`w-full py-4 text-[11px] tracking-[0.2em] uppercase mb-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                    added
                      ? "bg-green-800/50 border border-green-600/50 text-green-400"
                      : "bg-gradient-to-r from-gold-deep to-gold text-obsidian"
                  }`}
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={added ? {} : { boxShadow: "0 8px 32px rgba(201,168,76,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  {added ? (
                    "✓ Added to Cart"
                  ) : (
                    <>
                      <ShoppingBag size={13} strokeWidth={2} /> Add to Cart
                    </>
                  )}
                </motion.button>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => toggleWishlist(product.id)}
                    className={`flex-1 py-3 border text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 transition-all duration-300 ${
                      wishlisted ? "border-gold/50 text-gold bg-gold/5" : "border-gold/25 text-warm-gray hover:border-gold/40"
                    }`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Heart size={12} strokeWidth={1.5} className={wishlisted ? "fill-gold" : ""} />
                    {wishlisted ? "Saved" : "Wishlist"}
                  </motion.button>

                  <motion.a
                    href={`/products/${product.id}`}
                    onClick={() => setQuickView(null)}
                    className="flex-1 py-3 border border-gold/25 text-warm-gray text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:border-gold/40 hover:text-cream transition-all"
                    style={{ fontFamily: "var(--font-body-family)" }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Full Details <ArrowRight size={11} />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
