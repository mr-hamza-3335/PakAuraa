"use client";

import { motion } from "framer-motion";

const steps = [
  {
    roman: "I",
    title: "Sourcing",
    subtitle: "The Foundation",
    body: "We travel to the source. Assam forests for oud. Rose Valley, Bulgaria, at dawn. Kashmir valleys in harvest season. Only the first grade material leaves with us.",
    detail: "6–18 months · 14 global origins",
  },
  {
    roman: "II",
    title: "Blending",
    subtitle: "The Alchemy",
    body: "In our Karachi atelier, our master blender works with scales accurate to 0.01g. Each accord is built across weeks of micro-adjustments, listening to skin rather than chemistry.",
    detail: "4–8 weeks per accord",
  },
  {
    roman: "III",
    title: "Maceration",
    subtitle: "The Patience",
    body: "The blended concentrate rests in glass for a minimum of 4 weeks before filtering. This allows each molecule to marry fully — the difference between good and transcendent.",
    detail: "4–8 weeks · Temperature-controlled",
  },
  {
    roman: "IV",
    title: "Bottling",
    subtitle: "The Ceremony",
    body: "Each bottle is filled by hand, inspected against a backlight, and sealed. The cap is torqued to specification. The box is assembled around it. Every order is a ceremony.",
    detail: "Hand-filled · Individually inspected",
  },
];

export default function Craftsmanship() {
  return (
    <section className="py-28 lg:py-40 bg-[#060606] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_0%,_rgba(201,168,76,0.028)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20 lg:mb-32"
        >
          <p className="eyebrow mb-6 opacity-70">The Art Behind</p>
          <h2
            className="text-cream leading-[0.95] tracking-[-0.02em] mb-8"
            style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(40px,5.5vw,68px)" }}
          >
            Craftsmanship
          </h2>
          <div className="divider-gold" />
          <p
            className="mt-8 text-warm-gray/85 max-w-[400px] mx-auto leading-[1.85] text-[13px]"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            From raw ingredient to finished bottle — a journey measured in months, not minutes.
          </p>
        </motion.div>

        {/* Timeline — horizontal on desktop */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[52px] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.roman}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                {/* Roman numeral marker */}
                <div className="relative mb-8 lg:mb-10 flex items-center justify-center w-full lg:justify-start">
                  <motion.div
                    className="relative w-[68px] h-[68px] flex items-center justify-center border border-gold/25 bg-[#060606] group-hover:border-gold/45 transition-all duration-500"
                    whileHover={{ borderColor: "rgba(201,168,76,0.6)" }}
                  >
                    <span
                      className="text-[16px] text-gold/70 group-hover:text-gold transition-colors duration-400"
                      style={{ fontFamily: "var(--font-display-family)" }}
                    >
                      {step.roman}
                    </span>
                    {/* Dot on connecting line */}
                    <div className="absolute -right-px top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-gold/30 hidden lg:block" />
                  </motion.div>
                </div>

                {/* Text */}
                <p
                  className="text-[8px] text-gold/78 tracking-[0.3em] uppercase mb-3"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {step.subtitle}
                </p>

                <h3
                  className="text-cream mb-4 leading-tight transition-colors duration-400 group-hover:text-gold-light"
                  style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(22px,2.5vw,28px)" }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-warm-gray/85 leading-[1.85] mb-5 text-[13px] max-w-[260px] mx-auto lg:mx-0 group-hover:text-warm-gray/68 transition-colors duration-400"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {step.body}
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-px w-5 bg-gold/25" />
                  <span
                    className="text-[8px] text-gold/45 tracking-[0.2em] uppercase"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {step.detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
