"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { X, Scale } from "lucide-react";
import { useStore } from "@/lib/store";
import { useCatalog } from "@/lib/catalog.client";

/** Floating tray that appears once 2+ products are queued for comparison. */
export default function CompareBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { compareList, toggleCompare, clearCompare } = useStore();
  const products = useCatalog();

  if (pathname?.startsWith("/admin") || pathname === "/compare" || compareList.length === 0) return null;

  const items = compareList.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-charcoal border-t border-gold/20 px-4 sm:px-8 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1440px] mx-auto flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Scale size={16} className="text-gold" strokeWidth={1.5} />
          <span className="text-[11px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
            {items.length} to compare
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {items.map((p) => (
            <div key={p.id} className="relative flex-shrink-0 w-11 h-11 border border-gold/20">
              <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
              <button
                aria-label={`Remove ${p.name}`}
                onClick={() => toggleCompare(p.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-obsidian border border-gold/40 flex items-center justify-center"
              >
                <X size={9} className="text-warm-gray" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={clearCompare}
            className="text-[10px] text-warm-gray hover:text-cream tracking-wider uppercase"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Clear
          </button>
          <button
            onClick={() => router.push("/compare")}
            disabled={items.length < 2}
            className="text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase disabled:opacity-40"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
