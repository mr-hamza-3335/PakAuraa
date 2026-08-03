"use client";

import { motion } from "framer-motion";

const pillars = [
  {
    num: "01",
    arabic: "أصول أصيلة",
    title: "Authentic Origins",
    body: "Every ingredient is traced to its source. Assam oud from 80-year-old aquilaria trees. Bulgarian rose collected at dawn. Kashmir saffron from a single valley. No compromises, no substitutes.",
  },
  {
    num: "02",
    arabic: "حرفية يدوية",
    title: "Handcrafted Mastery",
    body: "Each bottle is blended by hand in small batches at our Lahore atelier — Old World precision applied to Pakistan's finest raw materials.",
  },
  {
    num: "03",
    arabic: "عمق الثبات",
    title: "Long-Lasting Depth",
    body: "Extrait de Parfum concentration means 10–14 hours on skin. Our fragrances develop across the day — morning whisper, afternoon character, evening presence.",
  },
  {
    num: "04",
    arabic: "إرشاد خبير",
    title: "Expert Guidance",
    body: "Every fragrance comes with a full scent profile card. Our team is available seven days a week. We believe you should know exactly what you're wearing and why.",
  },
];

export default function WhyPakAuraa() {
  return (
    <section className="py-28 lg:py-40 bg-[#080808] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,_rgba(201,168,76,0.022)_0%,_transparent_65%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 lg:mb-28"
        >
          <p className="eyebrow mb-6 opacity-70">Our Promise</p>
          <h2
            className="text-cream leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(40px,5.5vw,68px)" }}
          >
            Why PakAuraa
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-8 text-warm-gray/50 max-w-[360px] mx-auto leading-[1.85] text-[13px]"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Four principles that separate the extraordinary from the ordinary.
          </p>
        </motion.div>

        {/* 2×2 grid with gold gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gold/[0.06]" style={{ border: "1px solid rgba(201,168,76,0.06)" }}>
          {pillars.map((p, i) => (
            <motion.div
              key={p.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-10 lg:p-14 bg-[#080808] overflow-hidden transition-colors duration-500 hover:bg-[#0D0D0D]"
            >
              {/* Ghost number */}
              <span
                className="absolute top-6 right-8 leading-none text-gold/[0.045] select-none pointer-events-none transition-all duration-700 group-hover:text-gold/[0.08] group-hover:scale-105 origin-top-right"
                style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(70px,8vw,110px)" }}
              >
                {p.num}
              </span>

              {/* Corner accent */}
              <div className="absolute top-0 left-0 w-9 h-9 pointer-events-none">
                <div className="absolute top-0 left-0 w-5 h-px bg-gold/20 transition-all duration-500 group-hover:w-9 group-hover:bg-gold/35" />
                <div className="absolute top-0 left-0 h-5 w-px bg-gold/20 transition-all duration-500 group-hover:h-9 group-hover:bg-gold/35" />
              </div>

              <p
                className="text-xl text-gold/28 mb-4 transition-colors duration-400 group-hover:text-gold/45"
                style={{ fontFamily: "Scheherazade New, serif" }}
              >
                {p.arabic}
              </p>

              <h3
                className="text-cream leading-tight mb-5 tracking-[-0.01em] transition-colors duration-400 group-hover:text-gold-light"
                style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(22px,2.5vw,30px)" }}
              >
                {p.title}
              </h3>

              <div className="h-px w-10 bg-gold/18 mb-6 transition-all duration-500 group-hover:w-16 group-hover:bg-gold/35" />

              <p
                className="text-warm-gray/48 leading-[1.9] max-w-[380px] text-[13px] transition-colors duration-400 group-hover:text-warm-gray/68"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
