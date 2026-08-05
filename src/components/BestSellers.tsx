"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCatalog } from "@/lib/catalog.client";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";

export default function BestSellers() {
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen, setQuickView } = useStore();
  const { currency } = useSettings();
  const products = useCatalog();

  return (
    <section className="py-28 lg:py-40 bg-[#0A0A0A] relative overflow-hidden">
      {/* Subtle ambient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,_rgba(61,8,32,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 lg:mb-20 gap-5"
        >
          <div>
            <p className="eyebrow mb-5 opacity-70">Most Loved</p>
            <h2
              className="text-[clamp(36px,4.5vw,58px)] text-cream leading-[0.95] tracking-[-0.02em]"
              style={{ fontFamily: "var(--font-display-family)" }}
            >
              Best Sellers
            </h2>
          </div>
          <a
            href="/collections"
            className="text-[9px] text-gold/78 hover:text-gold tracking-[0.25em] uppercase transition-colors duration-300 border-b border-gold/20 hover:border-gold/50 pb-0.5 self-end sm:self-auto"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            View All →
          </a>
        </motion.div>

        {/* Products grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
          {products.map((product, i) => {
            const wishlisted = isWishlisted(product.id);
            const size = product.sizes[1];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col"
                style={{
                  background: "linear-gradient(180deg, #131313 0%, #0E0E0E 100%)",
                  border: "1px solid rgba(201,168,76,0.08)",
                }}
                whileHover={{
                  borderColor: "rgba(201,168,76,0.25)",
                  boxShadow: "0 16px 56px rgba(201,168,76,0.08), 0 4px 20px rgba(0,0,0,0.7)",
                  y: -4,
                  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
              >
                {/* Wishlist */}
                <button
                  aria-label="Wishlist"
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center bg-obsidian/70 border border-gold/10 rounded-full text-warm-gray/85 hover:text-gold hover:border-gold/30 transition-all duration-300"
                >
                  <Heart
                    size={11}
                    strokeWidth={1.5}
                    className={wishlisted ? "fill-gold text-gold" : ""}
                  />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="text-[6px] tracking-[0.18em] uppercase bg-gold text-obsidian px-2 py-0.5"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {product.badge}
                    </span>
                  </div>
                )}

                {/* Image */}
                <Link href={`/products/${product.id}`}>
                  <div className={`relative aspect-square overflow-hidden ${product.gradient}`}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover object-center transition-transform duration-600 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-obsidian/70 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-center justify-center gap-2">
                      <motion.button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart(product, size.ml, size.price);
                          setCartOpen(true);
                        }}
                        className="flex items-center gap-1.5 bg-gold text-obsidian text-[8px] tracking-[0.18em] uppercase px-4 py-2.5"
                        style={{ fontFamily: "var(--font-body-family)" }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ShoppingBag size={10} strokeWidth={2} />
                        Add
                      </motion.button>
                      <motion.button
                        aria-label="Quick view"
                        onClick={(e) => {
                          e.preventDefault();
                          setQuickView(product);
                        }}
                        className="flex items-center justify-center w-8 h-8 border border-gold/30 text-gold bg-obsidian/40"
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye size={11} strokeWidth={2} />
                      </motion.button>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col">
                  <p
                    className="text-[7px] text-gold/60 tracking-[0.22em] uppercase mb-1 truncate"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {product.collection}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <h3
                      className="text-[14px] text-cream leading-tight mb-2 group-hover:text-gold-light transition-colors duration-400 truncate"
                      style={{ fontFamily: "var(--font-display-family)" }}
                    >
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex gap-0.5 mb-2.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={8} className="fill-gold text-gold" />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gold/[0.07]">
                    <span
                      className="text-[12px] text-cream"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {formatPrice(size.price, currency)}
                    </span>
                    {product.badge && (
                      <span
                        className="text-[6px] text-gold/50 tracking-wider"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      >
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
