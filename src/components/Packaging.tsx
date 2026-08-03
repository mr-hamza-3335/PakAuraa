"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    id: "box",
    label: "Matte Black Box",
    icon: "◼",
    detail: "Rigid matte black construction with magnetic closure. Gold arabesque corner ornaments, hand-embossed. The box itself is a luxury keepsake.",
    spec: "Rigid Board · Magnetic · Gold Emboss",
  },
  {
    id: "bottle",
    label: "Crystal Bottle",
    icon: "◇",
    detail: "Heavy crystal-clear glass, square-cut. Warm amber liquid glows through the glass. Gold metallic atomizer cap with satisfying weight.",
    spec: "Crystal Glass · Gold Cap · Square Cut",
  },
  {
    id: "bag",
    label: "Shopping Bag",
    icon: "◈",
    detail: "Matte black paper bag with gold rope handles. PakAuraa logo gold-stamped on front. Arrives tissue-wrapped.",
    spec: "Matte Finish · Gold Cord · Gold Stamp",
  },
  {
    id: "interior",
    label: "Satin Interior",
    icon: "✦",
    detail: "Deep black satin lining cradles the bottle. Precision-cut foam insert. Nothing moves. Nothing rattles. Perfect silence.",
    spec: "Black Satin · Precision Foam · Velvet Base",
  },
  {
    id: "engraving",
    label: "Personalisation",
    icon: "✒",
    detail: "Add your name or a message in gold laser engraving. Make it a gift that will never be forgotten. Available at checkout.",
    spec: "Gold Laser · Custom Text · Free on 100ml",
  },
];

export default function Packaging() {
  const [active, setActive] = useState("box");
  const current = features.find((f) => f.id === active) ?? features[0];

  return (
    <section className="relative overflow-hidden bg-[#080808]">
      {/* ── Top: Real packaging photography — full bleed ── */}
      <div className="relative h-[55vh] lg:h-[75vh] min-h-[440px] overflow-hidden">
        <Image
          src="/packaging-lifestyle.jpeg"
          alt="PakAuraa Luxury Packaging — Matte Black Box, Crystal Bottle, Shopping Bag"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Gradient overlays for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/92 via-[#080808]/55 to-[#080808]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/20" />

        {/* Text overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 w-full">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[540px]"
            >
              <p className="eyebrow mb-6 opacity-70">Packaging Legacy</p>

              <h2
                className="text-cream leading-[0.9] tracking-[-0.02em] mb-8"
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "clamp(38px, 5.5vw, 72px)",
                }}
              >
                An Experience
                <br />
                <span className="text-gold-gradient italic">Before the Bottle Opens</span>
              </h2>

              <div className="divider-gold-left mb-8" />

              <p
                className="text-warm-gray/65 leading-[1.9] max-w-[380px]"
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "clamp(13px, 1.4vw, 16px)",
                }}
              >
                Every element is intentional. The weight. The texture. The sound of the magnetic
                closure. Luxury begins with the hands.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Feature explorer ── */}
      <div className="py-20 lg:py-28 px-6 lg:px-16 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 lg:gap-20">

          {/* Tabs */}
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {features.map((f, i) => (
              <motion.button
                key={f.id}
                onClick={() => setActive(f.id)}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`group flex-shrink-0 lg:flex-shrink text-left px-5 py-4 border transition-all duration-400 ${
                  active === f.id
                    ? "border-gold/35 bg-gold/[0.05]"
                    : "border-gold/[0.07] hover:border-gold/18 hover:bg-gold/[0.02]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm transition-colors duration-300 ${active === f.id ? "text-gold" : "text-gold/25 group-hover:text-gold/45"}`}>
                    {f.icon}
                  </span>
                  <span
                    className={`text-[10px] tracking-[0.16em] uppercase whitespace-nowrap transition-colors duration-300 ${
                      active === f.id ? "text-cream" : "text-warm-gray/45 group-hover:text-warm-gray/70"
                    }`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {f.label}
                  </span>
                </div>
                {active === f.id && (
                  <motion.div
                    layoutId="pkg-line"
                    className="hidden lg:block mt-3 h-px bg-gradient-to-r from-gold/45 to-transparent"
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center py-4"
          >
              <span
                className="text-[56px] lg:text-[72px] text-gold/15 mb-8 block leading-none"
                style={{ fontFamily: "var(--font-display-family)" }}
              >
                {current.icon}
              </span>

              <h3
                className="text-cream leading-tight mb-6 tracking-[-0.015em]"
                style={{
                  fontFamily: "var(--font-display-family)",
                  fontSize: "clamp(28px, 3.5vw, 46px)",
                }}
              >
                {current.label}
              </h3>

              <p
                className="text-warm-gray/60 leading-[1.95] mb-10 max-w-[520px]"
                style={{
                  fontFamily: "var(--font-body-family)",
                  fontSize: "clamp(14px, 1.3vw, 16px)",
                }}
              >
                {current.detail}
              </p>

              <div className="flex items-center gap-4">
                <div className="h-px w-8 bg-gold/25" />
                <span
                  className="text-[8px] text-gold/55 tracking-[0.28em] uppercase"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {current.spec}
                </span>
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
