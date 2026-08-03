"use client";

import { motion } from "framer-motion";
import { Heart, ShoppingBag, Eye, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCatalog } from "@/lib/catalog.client";
import { useStore } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";

export default function WishlistPage() {
  const products = useCatalog();
  const { wishlist, toggleWishlist, addToCart, setCartOpen, setQuickView } = useStore();
  const { currency } = useSettings();

  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Saved</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-12" style={{ fontFamily: "var(--font-display-family)" }}>
            Your Wishlist
          </h1>

          {items.length === 0 ? (
            <div className="py-20 text-center border border-gold/10 bg-charcoal/20">
              <Heart size={26} className="text-warm-gray/40 mx-auto mb-5" strokeWidth={1} />
              <p className="text-[14px] text-warm-gray mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Nothing saved yet</p>
              <p className="text-[12px] text-muted mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Tap the heart on any fragrance to save it here.</p>
              <Link href="/collections" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {items.map((product, i) => {
                const size = product.sizes[1];
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative flex flex-col border border-gold/12 bg-charcoal rounded-lg overflow-hidden transition-all duration-400 hover:border-gold/35"
                  >
                    <button
                      aria-label="Remove from wishlist"
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-obsidian/70 backdrop-blur-sm border border-gold/18 rounded-full transition-all hover:border-red-400/50 hover:text-red-400"
                    >
                      <X size={13} strokeWidth={1.5} />
                    </button>
                    <Link href={`/products/${product.id}`}>
                      <div className={`relative aspect-square overflow-hidden ${product.gradient}`}>
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22vw"
                        />
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
                    <div className="p-4 flex-1 flex flex-col">
                      <p className="text-[8px] text-gold tracking-[0.22em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{product.collection}</p>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-elegant text-[15px] text-cream leading-tight mb-2 group-hover:text-gold-light transition-colors" style={{ fontFamily: "var(--font-elegant-family)" }}>
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-gold/10">
                        <span className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice(size.price, currency)}</span>
                        <span className="text-[9px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>{size.ml}ml</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
