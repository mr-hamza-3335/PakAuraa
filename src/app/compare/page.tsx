"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag, Scale } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog.client";
import { useSettings, formatPrice } from "@/lib/settings";

const rowLabel = "text-[10px] text-muted tracking-[0.15em] uppercase whitespace-nowrap";
const cellText = "text-[12px] text-warm-gray leading-relaxed";

export default function ComparePage() {
  const { compareList, toggleCompare, addToCart, setCartOpen } = useStore();
  const { currency } = useSettings();
  const products = useCatalog();

  const items = compareList.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Compare</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-10" style={{ fontFamily: "var(--font-display-family)" }}>
            Compare Fragrances
          </h1>

          {items.length === 0 ? (
            <div className="py-20 text-center border border-gold/10 bg-charcoal/20">
              <Scale size={24} className="text-warm-gray/40 mx-auto mb-4" strokeWidth={1} />
              <p className="text-[13px] text-warm-gray mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                Add fragrances from the collections page to compare them side by side.
              </p>
              <Link href="/collections" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
                Browse Fragrances
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gold/12">
              <table className="w-full border-collapse min-w-[600px]">
                <tbody>
                  <tr className="border-b border-gold/10">
                    <td className="p-4 w-[140px]" />
                    {items.map((p) => (
                      <td key={p.id} className="p-4 align-top min-w-[220px]">
                        <div className="relative">
                          <button
                            aria-label={`Remove ${p.name}`}
                            onClick={() => toggleCompare(p.id)}
                            className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-obsidian border border-gold/30 flex items-center justify-center"
                          >
                            <X size={12} className="text-warm-gray" />
                          </button>
                          <Link href={`/products/${p.id}`} className={`block aspect-square relative mb-3 ${p.gradient} overflow-hidden`}>
                            <Image src={p.image} alt={p.name} fill className="object-cover" sizes="220px" />
                          </Link>
                          <Link href={`/products/${p.id}`}>
                            <p className="text-[8px] text-gold tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{p.collection}</p>
                            <h3 className="font-elegant text-[16px] text-cream" style={{ fontFamily: "var(--font-elegant-family)" }}>{p.name}</h3>
                          </Link>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Price (50ml)</td>
                    {items.map((p) => {
                      const size = p.sizes.find((s) => s.ml === 50) ?? p.sizes[0];
                      return <td key={p.id} className="p-4 text-[14px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice(size.price, currency)}</td>;
                    })}
                  </tr>

                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Fragrance Family</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.fragranceFamily.join(", ")}</td>)}
                  </tr>

                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Top Notes</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.notes.top.join(", ")}</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Heart Notes</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.notes.heart.join(", ")}</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Base Notes</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.notes.base.join(", ")}</td>)}
                  </tr>

                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Longevity</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.longevity}/10</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Projection</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.projection}/10</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Concentration</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.concentration}</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Best For</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.occasions.join(", ")}</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Season</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText}`} style={{ fontFamily: "var(--font-body-family)" }}>{p.seasons.join(", ")}</td>)}
                  </tr>
                  <tr className="border-b border-gold/10">
                    <td className={`p-4 ${rowLabel}`} style={{ fontFamily: "var(--font-body-family)" }}>Gender</td>
                    {items.map((p) => <td key={p.id} className={`p-4 ${cellText} capitalize`} style={{ fontFamily: "var(--font-body-family)" }}>{p.gender}</td>)}
                  </tr>

                  <tr>
                    <td className="p-4" />
                    {items.map((p) => {
                      const size = p.sizes.find((s) => s.ml === 50) ?? p.sizes[0];
                      return (
                        <td key={p.id} className="p-4">
                          <button
                            onClick={() => { addToCart(p, size.ml, size.price); setCartOpen(true); }}
                            className="flex items-center gap-2 text-[10px] text-gold border border-gold/30 px-4 py-2.5 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            <ShoppingBag size={12} strokeWidth={1.5} /> Add to Cart
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
