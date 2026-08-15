"use client";

import Link from "next/link";
import Image from "next/image";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import { type Product, defaultSize } from "@/lib/data";
import { useStore } from "@/lib/store";
import { useSettings } from "@/lib/settings";
import PriceTag from "@/components/PriceTag";

/** Shared product tile used by Related Fragrances, Recently Viewed, and Compare add-ons. */
export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, setCartOpen } = useStore();
  const { currency } = useSettings();
  const size = defaultSize(product);

  if (product.comingSoon) {
    return (
      <div className="border border-gold/14 bg-charcoal rounded-lg overflow-hidden">
        <div className={`aspect-square relative ${product.gradient} overflow-hidden opacity-50 grayscale`}>
          <Image
            src={product.image}
            alt={`${product.name} — coming soon | PakAuraa`}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-obsidian/50 flex items-center justify-center">
            <span className="text-[10px] text-gold border border-gold/40 px-3 py-1.5 tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
              Coming Soon
            </span>
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-elegant text-[15px] text-cream/70 text-center" style={{ fontFamily: "var(--font-elegant-family)" }}>{product.name}</h4>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center justify-between gap-2">
            <PriceTag price={size.price} originalPrice={product.originalPrice} currency={currency} />
            <button
              onClick={(e) => { e.preventDefault(); addToCart(product, size.ml, size.price); setCartOpen(true); }}
              className="text-[9px] text-gold border border-gold/30 px-3 py-1.5 tracking-wider hover:bg-gold/10 transition-colors flex-shrink-0"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Add
            </button>
          </div>
        </div>
      </Link>
      {product.pdfCard && (
        <a
          href={product.pdfCard}
          download
          className="flex items-center justify-center gap-1.5 text-[9px] text-warm-gray/85 hover:text-gold border-t border-gold/10 hover:bg-gold/5 px-3 py-2.5 tracking-wider uppercase transition-colors"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          <Download size={11} strokeWidth={1.5} /> Details Card
        </a>
      )}
    </motion.div>
  );
}
