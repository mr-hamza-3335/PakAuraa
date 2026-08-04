"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";

/** Shared product tile used by Related Fragrances, Recently Viewed, and Compare add-ons. */
export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useStore();
  const { currency } = useSettings();
  const size = product.sizes[1] ?? product.sizes[0];
  return (
    <motion.div
      whileHover={{ y: -4, borderColor: "rgba(201,168,76,0.40)" }}
      className="group cursor-pointer border border-gold/14 bg-charcoal rounded-lg overflow-hidden transition-all duration-400"
    >
      <Link href={`/products/${product.id}`}>
        <div className={`aspect-square relative ${product.gradient} overflow-hidden`}>
          <Image
            src={product.image}
            alt={`${product.name} — ${product.collection} luxury perfume | PakAuraa`}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="p-4">
          <p className="text-[8px] text-gold tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{product.collection}</p>
          <h4 className="font-elegant text-[15px] text-cream mb-3 group-hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-elegant-family)" }}>{product.name}</h4>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice(size.price, currency)}</span>
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product, size.ml, size.price); setCartOpen(true); }}
              className="text-[9px] text-gold border border-gold/30 px-3 py-1.5 tracking-wider hover:bg-gold/10 transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Add
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
