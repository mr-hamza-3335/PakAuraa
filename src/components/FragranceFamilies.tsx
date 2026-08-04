"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const families = [
  {
    id: "oud",
    name: "Oud",
    arabicName: "العود",
    tagline: "Ancient · Majestic · Revered",
    description:
      "The most precious material in all of perfumery. Centuries-old agarwood from the forests of Assam and Cambodia.",
    gradient:
      "linear-gradient(145deg, #1a1208 0%, #2d200a 55%, #1a1208 100%)",
    accentColor: "#C9A84C",
    symbol: "◈",
    href: "/collections?family=oud",
  },
  {
    id: "floral",
    name: "Floral",
    arabicName: "الزهور",
    tagline: "Romantic · Feminine · Ethereal",
    description:
      "Bulgarian rose, jasmine sambac and white peony — the most beloved notes on earth, captured at their peak.",
    gradient:
      "linear-gradient(145deg, #1a0a14 0%, #2d1020 55%, #1a0a14 100%)",
    accentColor: "#E8C97A",
    symbol: "✦",
    href: "/collections?family=floral",
  },
  {
    id: "oriental",
    name: "Oriental",
    arabicName: "الشرقي",
    tagline: "Rich · Spiced · Opulent",
    description:
      "Warm amber, exotic spices and ancient resins — evoking the trade routes of the old Silk Road.",
    gradient:
      "linear-gradient(145deg, #1a0f08 0%, #2d1a0a 55%, #1a0f08 100%)",
    accentColor: "#C9A84C",
    symbol: "◆",
    href: "/collections?family=oriental",
  },
  {
    id: "musk",
    name: "Musk",
    arabicName: "المسك",
    tagline: "Clean · Sensual · Intimate",
    description:
      "Effortlessly beautiful. White musk and powdery accords that fuse with your skin and become truly yours.",
    gradient:
      "linear-gradient(145deg, #10101a 0%, #1a1a2d 55%, #10101a 100%)",
    accentColor: "#E8C97A",
    symbol: "◎",
    href: "/collections?family=musk",
  },
  {
    id: "woody",
    name: "Woody",
    arabicName: "الخشبي",
    tagline: "Grounding · Deep · Soulful",
    description:
      "Mysore sandalwood, Atlas cedarwood and smoky vetiver — foundations that give every great fragrance its soul.",
    gradient:
      "linear-gradient(145deg, #0f1a0a 0%, #182d10 55%, #0f1a0a 100%)",
    accentColor: "#C9A84C",
    symbol: "▲",
    href: "/collections?family=woody",
  },
  {
    id: "fresh",
    name: "Fresh",
    arabicName: "المنعش",
    tagline: "Vibrant · Bright · Uplifting",
    description:
      "Italian bergamot, neroli and aquatic notes that open a fragrance like the first cool light of morning.",
    gradient:
      "linear-gradient(145deg, #0a1212 0%, #0f201d 55%, #0a1212 100%)",
    accentColor: "#E8C97A",
    symbol: "✿",
    href: "/collections?family=fresh",
  },
];

export default function FragranceFamilies() {
  return (
    <section className="py-28 lg:py-36 px-6 lg:px-12 bg-obsidian">
      <div className="max-w-[1440px] mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p
            className="text-[9px] text-gold tracking-[0.42em] uppercase mb-5"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Explore
          </p>
          <h2
            className="font-display text-[clamp(36px,5vw,58px)] text-cream leading-tight"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            Fragrance Families
          </h2>
          <div className="divider-gold mt-7" />
          <p
            className="text-[14px] text-warm-gray max-w-lg mx-auto mt-7 leading-relaxed"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Every fragrance belongs to a family. Discover yours.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {families.map((family, i) => (
            <motion.a
              key={family.id}
              href={family.href}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.75, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              className="group relative overflow-hidden border border-gold/12 rounded-lg transition-all duration-500 hover:border-gold/38 block"
              style={{ background: family.gradient }}
              whileHover={{ y: -5, boxShadow: "0 20px 60px rgba(201,168,76,0.1), 0 4px 24px rgba(0,0,0,0.8)" }}
            >
              {/* Radial glow on hover */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.07)_0%,_transparent_68%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner accents */}
              <div className="absolute top-4 left-4 w-5 h-px bg-gold/35 transition-all duration-500 group-hover:w-9" />
              <div className="absolute top-4 left-4 w-px h-5 bg-gold/35 transition-all duration-500 group-hover:h-9" />
              <div className="absolute bottom-4 right-4 w-5 h-px bg-gold/35 transition-all duration-500 group-hover:w-9" />
              <div className="absolute bottom-4 right-4 w-px h-5 bg-gold/35 transition-all duration-500 group-hover:h-9" />

              <div className="p-7 lg:p-8 relative z-10">
                {/* Symbol */}
                <p
                  className="text-3xl text-gold/30 mb-5 group-hover:text-gold/60 transition-colors duration-500"
                  style={{ fontFamily: "var(--font-display-family)" }}
                >
                  {family.symbol}
                </p>

                {/* Arabic name */}
                <p
                  className="text-sm text-gold/40 mb-2 transition-colors duration-500 group-hover:text-gold/65"
                  style={{ fontFamily: "var(--font-scheherazade), serif" }}
                >
                  {family.arabicName}
                </p>

                {/* Name */}
                <h3
                  className="font-display text-[26px] text-cream leading-tight mb-1 transition-colors duration-400 group-hover:text-gold-light"
                  style={{ fontFamily: "var(--font-display-family)" }}
                >
                  {family.name}
                </h3>

                {/* Tagline */}
                <p
                  className="text-[9px] text-gold/60 tracking-[0.18em] uppercase mb-5"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {family.tagline}
                </p>

                {/* Divider */}
                <div className="w-8 h-px bg-gold/25 mb-5 transition-all duration-500 group-hover:w-14" />

                {/* Description */}
                <p
                  className="text-[13px] text-warm-gray leading-relaxed mb-7"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {family.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[10px] text-gold tracking-[0.18em] uppercase transition-all duration-400 group-hover:gap-3">
                  <span style={{ fontFamily: "var(--font-body-family)" }}>
                    Explore {family.name}
                  </span>
                  <ArrowRight
                    size={11}
                    strokeWidth={2}
                    className="transition-transform duration-400 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
