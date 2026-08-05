"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Eye } from "lucide-react";
import Image from "next/image";
import type { Product } from "@/lib/data";
import { useCatalog } from "@/lib/catalog.client";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";

function ProductCard({
  product,
  idx,
}: {
  product: Product;
  idx: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const { addToCart, toggleWishlist, isWishlisted, setQuickView, setCartOpen } = useStore();
  const { currency } = useSettings();
  const wishlisted = isWishlisted(product.id);
  const defaultSize = product.sizes[1];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, defaultSize.ml, defaultSize.price);
    setCartOpen(true);
  };

  const badgeStyle: Record<string, string> = {
    FLAGSHIP: "bg-gradient-to-r from-gold-deep to-gold text-obsidian",
    BESTSELLER: "bg-gold text-obsidian",
    "NEW ARRIVAL": "border border-gold/50 text-gold bg-gold/5",
    LIMITED: "bg-wine text-cream",
    EXCLUSIVE: "bg-gradient-to-r from-gold-deep to-gold text-obsidian",
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className="group relative flex flex-col overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(180deg, #111111 0%, #0C0C0C 100%)",
        border: "1px solid rgba(201,168,76,0.10)",
      }}
      whileHover={{
        borderColor: "rgba(201,168,76,0.32)",
        boxShadow: "0 24px 80px rgba(201,168,76,0.10), 0 8px 32px rgba(0,0,0,0.8)",
        y: -6,
      }}
      transition={{ duration: 0.8, delay: idx * 0.15, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-5 left-5 z-20">
          <span
            className={`text-[8px] tracking-[0.22em] uppercase px-3 py-1.5 ${badgeStyle[product.badge] ?? "border border-gold/40 text-gold"}`}
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            {product.badge}
          </span>
        </div>
      )}

      {/* Wishlist */}
      <motion.button
        aria-label="Add to wishlist"
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-5 right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full border border-gold/15 bg-obsidian/60 backdrop-blur-sm transition-all duration-300 hover:border-gold/40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Heart
          size={14}
          strokeWidth={1.5}
          className={`transition-colors duration-300 ${wishlisted ? "fill-gold text-gold" : "text-warm-gray"}`}
        />
      </motion.button>

      {/* Quick view */}
      <motion.button
        aria-label="Quick view"
        onClick={(e) => { e.preventDefault(); setQuickView(product); }}
        className="absolute top-5 right-[62px] z-20 w-9 h-9 flex items-center justify-center rounded-full border border-gold/15 bg-obsidian/60 backdrop-blur-sm transition-all duration-300 hover:border-gold/40 opacity-0 group-hover:opacity-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Eye size={14} strokeWidth={1.5} className="text-warm-gray" />
      </motion.button>

      {/* Image */}
      <a href={`/products/${product.id}`}>
        <div className={`relative aspect-[3/4] overflow-hidden ${product.gradient}`}>
          <motion.div style={{ y }} className="absolute inset-0 scale-[1.1]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-800 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>

          {/* Always-on subtle gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C0C]/60 via-transparent to-transparent pointer-events-none" />

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-[#080808]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="absolute inset-x-5 bottom-5 flex gap-2.5 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-450 ease-out">
            <motion.button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-gold text-obsidian text-[9px] tracking-[0.2em] uppercase py-3"
              style={{ fontFamily: "var(--font-body-family)" }}
              whileTap={{ scale: 0.97 }}
            >
              <ShoppingBag size={11} strokeWidth={2} /> Add to Cart
            </motion.button>
          </div>
        </div>
      </a>

      {/* Info */}
      <div className="p-6 lg:p-7 flex flex-col flex-1">
        <p
          className="text-[8px] text-gold/70 tracking-[0.3em] uppercase mb-2"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          {product.collection}
        </p>

        <a href={`/products/${product.id}`}>
          <h3
            className="text-[20px] lg:text-[22px] text-cream leading-tight mb-1 group-hover:text-gold-light transition-colors duration-400"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            {product.name}
          </h3>
        </a>

        <p
          className="text-base text-gold/35 mb-4"
          style={{ fontFamily: "var(--font-scheherazade), serif" }}
        >
          {product.arabicName}
        </p>

        <p
          className="text-[12px] text-warm-gray/85 leading-[1.85] mb-5 flex-1 line-clamp-3"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          {product.description}
        </p>

        {/* Notes preview */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {product.notes.top.slice(0, 3).map((n) => (
            <span
              key={n}
              className="text-[7px] text-warm-gray/85 border border-gold/[0.10] px-2.5 py-1 tracking-[0.12em] uppercase"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {n}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-gold/[0.08]">
          <div>
            <span
              className="text-[18px] text-cream"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {formatPrice(defaultSize.price, currency)}
            </span>
            <span
              className="text-[9px] text-warm-gray/85 ml-1.5"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              /{defaultSize.ml}ml
            </span>
          </div>
          <a
            href={`/products/${product.id}`}
            className="group/link flex items-center gap-2 text-[9px] text-gold/60 hover:text-gold tracking-[0.2em] uppercase transition-colors duration-300"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Explore
            <ArrowRight size={10} strokeWidth={2} className="transition-transform duration-300 group-hover/link:translate-x-1" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedCollection() {
  const products = useCatalog();
  const featured = products.slice(0, 3);
  return (
    <section className="py-32 lg:py-44 px-6 lg:px-16 bg-[#080808] relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,_rgba(201,168,76,0.025)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 lg:mb-28"
        >
          <p className="eyebrow mb-6 opacity-80">Our Icons</p>

          <h2
            className="text-[clamp(40px,5.5vw,72px)] text-cream leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            Signature Collection
          </h2>

          <div className="divider-gold" />

          <p
            className="text-[14px] text-warm-gray/85 mt-8 max-w-[420px] mx-auto leading-[1.85]"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Five extraordinary fragrances. Each a world unto itself.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} idx={i} />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-center mt-16 lg:mt-20"
        >
          <motion.a
            href="/collections"
            className="group inline-flex items-center gap-3 border border-gold/20 text-warm-gray/85 text-[9px] tracking-[0.3em] uppercase px-10 py-4 hover:border-gold/40 hover:text-cream transition-all duration-500"
            style={{ fontFamily: "var(--font-body-family)" }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(201,168,76,0.03)" }}
            whileTap={{ scale: 0.98 }}
          >
            View All Five Fragrances
            <ArrowRight size={11} strokeWidth={2} className="transition-transform duration-300 group-hover:translate-x-1" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
