"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { collections } from "@/lib/data";

export default function CollectionsGrid() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-obsidian">
      <div className="max-w-[1400px] mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <p
            className="text-[10px] text-gold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Explore
          </p>
          <h2
            className="font-display text-[clamp(32px,4.5vw,50px)] text-cream leading-tight"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            Our Collections
          </h2>
          <div className="divider-gold mt-6" />
        </motion.div>

        {/* Grid — 2 large + 4 small */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
          {collections.map((col, i) => {
            const isLarge = i < 2;
            return (
              <motion.a
                key={col.id}
                href={col.href}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-lg border border-gold/12 hover:border-gold/35 transition-all duration-500 ${
                  isLarge ? "col-span-1 md:col-span-1 aspect-[3/4]" : "aspect-square"
                }`}
                style={{ background: col.gradient }}
                whileHover={{ scale: 1.01 }}
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.06)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Corner accents */}
                <div className="absolute top-4 left-4 w-6 h-px bg-gold/40 transition-all duration-400 group-hover:w-10" />
                <div className="absolute top-4 left-4 w-px h-6 bg-gold/40 transition-all duration-400 group-hover:h-10" />
                <div className="absolute bottom-4 right-4 w-6 h-px bg-gold/40 transition-all duration-400 group-hover:w-10" />
                <div className="absolute bottom-4 right-4 w-px h-6 bg-gold/40 transition-all duration-400 group-hover:h-10" />

                {/* Arabesque ornament */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
                  <div
                    className="text-[120px] text-gold leading-none"
                    style={{ fontFamily: "var(--font-scheherazade), serif" }}
                  >
                    ◈
                  </div>
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />

                  <div className="relative z-10">
                    <h3
                      className={`font-display text-cream leading-tight mb-1 transition-colors duration-300 group-hover:text-gold-light ${
                        isLarge ? "text-2xl lg:text-3xl" : "text-lg"
                      }`}
                      style={{ fontFamily: "var(--font-display-family)" }}
                    >
                      {col.name}
                    </h3>
                    <p
                      className="text-[11px] text-warm-gray tracking-wider mb-4"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {col.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gold tracking-[0.15em] uppercase transition-all duration-300 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0">
                      <span style={{ fontFamily: "var(--font-body-family)" }}>Explore</span>
                      <ArrowRight size={11} strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
