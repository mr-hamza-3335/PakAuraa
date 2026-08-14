"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const ingredients = [
  {
    id: "oud",
    name: "Assam Oud",
    origin: "Assam, India",
    rarity: "Ultra Rare",
    profile: ["Dark Resin", "Forest", "Leather", "Smoke"],
    story:
      "Harvested from agarwood trees infected with a specific mold, genuine Assam oud takes 80+ years to form. Its dark, complex resin is the most expensive natural material in the world. We use only aged wild harvest — never cultivated.",
    usedIn: ["Sultan-e-Zafroon", "Zurtaan"],
  },
  {
    id: "rose",
    name: "Bulgarian Rose",
    origin: "Rose Valley, Bulgaria",
    rarity: "Seasonal",
    profile: ["Velvety", "Deep", "Honey", "Green"],
    story:
      "The Rose Valley blooms for three weeks in May. Our rose absolute is cold-extracted on the day of harvest, before 8am. It takes 4 tons of petals to produce 1kg of absolute. This is ours.",
    usedIn: ["Zarfah"],
  },
  {
    id: "saffron",
    name: "Kashmir Saffron",
    origin: "Pampore, Kashmir",
    rarity: "Rare",
    profile: ["Metallic", "Honeyed", "Warm", "Spiced"],
    story:
      "Kashmir saffron threads are hand-harvested before dawn by women who have done so for generations. The stamens are dried the same morning. Our saffron tincture captures a warmth that synthetic saffron can never replicate.",
    usedIn: ["Sultan-e-Zafroon"],
  },
  {
    id: "cedarwood",
    name: "Atlas Cedarwood",
    origin: "Atlas Mountains, Morocco",
    rarity: "Sustainable",
    profile: ["Dry Wood", "Pencil Shavings", "Warm", "Grounding"],
    story:
      "Steam-distilled from the heartwood of the Atlas cedar, felled only under Morocco's managed forestry programme. It forms the masculine backbone of our boldest composition — a pillar note that never fades into the background.",
    usedIn: ["Zurtaan"],
  },
  {
    id: "amber",
    name: "Arabian Amber",
    origin: "Arabian Peninsula",
    rarity: "Precious",
    profile: ["Warm", "Resinous", "Sweet", "Deep"],
    story:
      "Our amber accord is built around genuine labdanum absolute from Morocco, enriched with a bespoke resin blend developed over two years. It forms the heart of our warmest fragrances and anchors everything to the skin.",
    usedIn: ["Sultan-e-Zafroon", "Nuxtar", "Zurtaan"],
  },
  {
    id: "musk",
    name: "White Musk",
    origin: "Synthetic · IFRA Compliant",
    rarity: "Ethical",
    profile: ["Clean", "Skin", "Soft", "Airy"],
    story:
      "We use only white musk — a synthetic, cruelty-free alternative to animal musk that is indistinguishable on skin. It gives our fresh and floral fragrances their signature clean trail.",
    usedIn: ["Naazif", "Zarfah"],
  },
];

export default function Ingredients() {
  const [active, setActive] = useState("oud");
  const current = ingredients.find((i) => i.id === active) ?? ingredients[0];

  return (
    <section className="py-28 lg:py-40 bg-[#080808] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,_rgba(61,8,32,0.06)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 lg:mb-28"
        >
          <p className="eyebrow mb-6 opacity-70">Rare & Precious</p>
          <h2
            className="text-cream leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(40px,5.5vw,68px)" }}
          >
            Our Ingredients
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-8 text-warm-gray/85 max-w-[380px] mx-auto leading-[1.85] text-[13px]"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Six extraordinary materials. Sourced with obsessive care. Combined by a master.
          </p>
        </motion.div>

        {/* Split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 lg:gap-20 items-start">

          {/* LEFT: Ingredient list */}
          <div className="space-y-0">
            {ingredients.map((ing, i) => (
              <motion.button
                key={ing.id}
                onClick={() => setActive(ing.id)}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`w-full text-left flex items-center justify-between px-6 py-5 border-b transition-all duration-400 group ${
                  active === ing.id
                    ? "border-b-gold/30 bg-gold/[0.04]"
                    : "border-b-gold/[0.07] hover:bg-gold/[0.02]"
                } ${i === 0 ? "border-t border-t-gold/[0.07]" : ""}`}
              >
                <div>
                  <p
                    className={`text-[11px] tracking-[0.12em] uppercase mb-1 transition-colors duration-300 ${active === ing.id ? "text-cream" : "text-warm-gray/55 group-hover:text-warm-gray/80"}`}
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {ing.name}
                  </p>
                  <p
                    className="text-[9px] text-warm-gray/85"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {ing.origin}
                  </p>
                </div>
                <span
                  className={`text-[7px] tracking-[0.2em] uppercase px-2.5 py-1 border transition-all duration-300 ${
                    active === ing.id
                      ? "border-gold/40 text-gold bg-gold/8"
                      : "border-gold/[0.10] text-gold/40"
                  }`}
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {ing.rarity}
                </span>
              </motion.button>
            ))}
          </div>

          {/* RIGHT: Detail panel */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:pt-2"
          >
              <h3
                className="text-cream leading-tight mb-3 tracking-[-0.015em]"
                style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(32px,4vw,52px)" }}
              >
                {current.name}
              </h3>

              <p
                className="text-[9px] text-gold/78 tracking-[0.25em] uppercase mb-8"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {current.origin} · {current.rarity}
              </p>

              {/* Scent profile chips */}
              <div className="flex gap-2 flex-wrap mb-10">
                {current.profile.map((p) => (
                  <span
                    key={p}
                    className="text-[8px] text-gold/60 border border-gold/18 px-3 py-1.5 tracking-[0.15em] uppercase"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Story */}
              <p
                className="text-warm-gray/62 leading-[1.95] mb-10 max-w-[540px]"
                style={{ fontFamily: "var(--font-body-family)", fontSize: "clamp(14px,1.3vw,16px)" }}
              >
                {current.story}
              </p>

              {/* Used in */}
              <div>
                <p
                  className="text-[8px] text-warm-gray/85 tracking-[0.28em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  Found In
                </p>
                <div className="flex gap-2 flex-wrap">
                  {current.usedIn.map((name) => (
                    <span
                      key={name}
                      className="text-[10px] text-cream/70 border border-gold/12 px-4 py-2 tracking-wider hover:border-gold/30 hover:text-cream transition-all duration-300 cursor-pointer"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
