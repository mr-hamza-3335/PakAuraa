"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const timeline = [
  { year: "2024", title: "The Idea", desc: "The vision for PakAuraa was born: a luxury fragrance house that rivals the world's finest, with a soul unmistakably Pakistani." },
  { year: "2025", title: "Building the Foundation", desc: "Sourcing raw materials, testing formulations, and shaping the brand — the quiet, careful work behind every great fragrance house." },
  { year: "2026", title: "We Open Our Doors", desc: "PakAuraa officially launches — Pakistan's newest luxury fragrance house, ready to introduce the world to a scent entirely our own." },
];

const steps = [
  { number: "01", title: "Raw Ingredient Sourcing", desc: "We source our oud from Assam, roses from Bulgaria, sandalwood from Mysore, and amber from the Arabian Gulf. Only the finest ingredients make the cut." },
  { number: "02", title: "Master Blending", desc: "Our perfumer balances hundreds of ingredients by hand, guided by instinct refined over decades. Each formula is tested over 6–18 months before approval." },
  { number: "03", title: "Maceration & Maturation", desc: "The blended concentrate is allowed to macerate for a minimum of 8 weeks, allowing molecules to bind and the fragrance to deepen and mature." },
  { number: "04", title: "Luxury Bottling", desc: "Each bottle is hand-filled, sealed and inspected individually. The signature matte black packaging is assembled by hand in our Karachi facility." },
];

const values = [
  { title: "Authenticity", desc: "No synthetic shortcuts. Every note is chosen for its purity and presence." },
  { title: "Craftsmanship", desc: "Each bottle represents hundreds of hours of human attention to detail." },
  { title: "Luxury", desc: "We define luxury not by price alone, but by the irreplaceable feeling each fragrance creates." },
  { title: "Heritage", desc: "Rooted in the ancient perfumery traditions of the subcontinent and Arabia." },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20 bg-obsidian">

        {/* ── HERO ── */}
        <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#080808] via-[#1a0a0f] to-[#080808]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.06)_0%,_transparent_65%)]" />
          {/* Gold corner ornaments */}
          {["top-10 left-10", "top-10 right-10 rotate-90", "bottom-10 left-10 -rotate-90", "bottom-10 right-10 rotate-180"].map((pos, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.5 + i * 0.1 }} className={`absolute ${pos} w-12 h-12`}>
              <div className="absolute top-0 left-0 w-5 h-px bg-gold" />
              <div className="absolute top-0 left-0 w-px h-5 bg-gold" />
            </motion.div>
          ))}
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-[9px] text-gold tracking-[0.4em] uppercase mb-5" style={{ fontFamily: "var(--font-body-family)" }}>
              Our Heritage
            </motion.p>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }}
              className="font-display text-[clamp(48px,8vw,88px)] text-cream leading-[0.95] tracking-[-0.02em] mb-8" style={{ fontFamily: "var(--font-display-family)" }}>
              The Scent of <br />
              <span className="text-gold-gradient">Royalty</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="text-[16px] text-warm-gray leading-[1.9] max-w-xl mx-auto" style={{ fontFamily: "var(--font-body-family)" }}>
              PakAuraa was born from a deeply personal conviction: that Pakistan deserves a luxury fragrance house that speaks to the world. Not a copy of what exists, but something entirely our own.
            </motion.p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent pointer-events-none" />
        </section>

        {/* ── FOUNDER STATEMENT ── */}
        <section className="py-24 lg:py-32 px-6 bg-burgundy">
          <div className="max-w-[900px] mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
              <div className="text-7xl text-gold/15 mb-0 select-none" style={{ fontFamily: "var(--font-display-family)" }}>&ldquo;</div>
              <blockquote className="text-[clamp(18px,2.5vw,26px)] text-cream font-light leading-[1.7] mb-8 -mt-6" style={{ fontFamily: "var(--font-elegant-family)" }}>
                I grew up surrounded by the most extraordinary fragrances in Pakistan — oud burning in corridors, rose water on prayer mats, sandalwood in old libraries. I wanted to bottle all of that into something the world had never seen.
              </blockquote>
              <div className="w-8 h-px bg-gold/50 mx-auto mb-4" />
              <p className="text-[12px] text-cream tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>Founder, PakAuraa</p>
              <p className="text-[10px] text-warm-gray tracking-wider mt-1" style={{ fontFamily: "var(--font-body-family)" }}>Karachi, Pakistan</p>
            </motion.div>
          </div>
        </section>

        {/* ── TIMELINE ── */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-obsidian">
          <div className="max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <p className="text-[9px] text-gold tracking-[0.4em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>Journey</p>
              <h2 className="font-display text-[clamp(32px,4.5vw,52px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>Our Story, Year by Year</h2>
            </motion.div>
            <div className="relative">
              {/* Center line */}
              <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/25 to-transparent hidden lg:block" />
              <div className="space-y-8 lg:space-y-0">
                {timeline.map((item, i) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className={`lg:grid lg:grid-cols-2 lg:gap-12 lg:mb-16 ${i % 2 === 0 ? "" : "lg:[direction:rtl]"}`}
                  >
                    <div className={`lg:[direction:ltr] ${i % 2 === 0 ? "lg:text-right lg:pr-12" : "lg:text-left lg:pl-12"}`}>
                      <div className="relative inline-block">
                        <span className="font-display text-4xl text-gold-gradient" style={{ fontFamily: "var(--font-display-family)" }}>{item.year}</span>
                        {/* Dot on center line */}
                        <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gold bg-obsidian ${i % 2 === 0 ? "-right-[49px]" : "-left-[49px]"}`} />
                      </div>
                      <h3 className="font-display text-xl text-cream mt-1 mb-2" style={{ fontFamily: "var(--font-display-family)" }}>{item.title}</h3>
                      <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{item.desc}</p>
                    </div>
                    <div />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── DUA / PRAYER REQUEST ── */}
        <section className="py-20 px-6 bg-obsidian text-center border-t border-gold/8">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-[700px] mx-auto">
            <p className="text-[9px] text-gold tracking-[0.4em] uppercase mb-5" style={{ fontFamily: "var(--font-body-family)" }}>A Small Request</p>
            <p className="text-[15px] text-warm-gray leading-[1.9]" style={{ fontFamily: "var(--font-body-family)" }}>
              PakAuraa has been a dream since 2024 — and in 2026, we&rsquo;re finally opening our doors. We ask you to keep us in your prayers, that Allah grants this business success.
            </p>
            <p className="text-[16px] text-cream leading-[1.9] mt-5" dir="rtl" style={{ fontFamily: "var(--font-body-family)" }}>
              براہ کرم ہمیں اپنی دعاؤں میں یاد رکھیں — اللہ تعالیٰ ہمیں اس بزنس میں کامیابی عطا فرمائے۔ آمین۔
            </p>
          </motion.div>
        </section>

        {/* ── CRAFTSMANSHIP STEPS ── */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-charcoal border-y border-gold/8">
          <div className="max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <p className="text-[9px] text-gold tracking-[0.4em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>How We Create</p>
              <h2 className="font-display text-[clamp(32px,4.5vw,52px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>The Art of Perfumery</h2>
              <div className="divider-gold mt-6" />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group"
                >
                  <div className="text-5xl font-display text-gold/12 mb-4 group-hover:text-gold/25 transition-colors duration-500" style={{ fontFamily: "var(--font-display-family)" }}>
                    {step.number}
                  </div>
                  <div className="w-8 h-px bg-gold/30 mb-4 transition-all duration-500 group-hover:w-12" />
                  <h3 className="text-[15px] text-cream tracking-wide mb-3" style={{ fontFamily: "var(--font-body-family)" }}>{step.title}</h3>
                  <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="py-24 lg:py-32 px-6 lg:px-12 bg-obsidian">
          <div className="max-w-[1400px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <p className="text-[9px] text-gold tracking-[0.4em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>What We Stand For</p>
              <h2 className="font-display text-[clamp(32px,4.5vw,52px)] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>Our Values</h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className="group border border-gold/12 p-7 hover:border-gold/35 transition-all duration-400"
                  style={{ background: "rgba(17,17,17,0.7)" }}
                  whileHover={{ y: -4 }}
                >
                  <h3 className="font-display text-lg text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>{v.title}</h3>
                  <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-6 bg-burgundy text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="font-display text-[clamp(32px,5vw,56px)] text-cream mb-6" style={{ fontFamily: "var(--font-display-family)" }}>
              Find Your Signature
            </h2>
            <p className="text-[15px] text-warm-gray mb-10 max-w-md mx-auto leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
              Every PakAuraa fragrance is an invitation to discover a new version of yourself.
            </p>
            <motion.a
              href="/collections"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[11px] tracking-[0.22em] uppercase px-12 py-4 font-medium"
              style={{ fontFamily: "var(--font-body-family)" }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 40px rgba(201,168,76,0.45)" }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Collection
              <ArrowRight size={13} strokeWidth={2} />
            </motion.a>
          </motion.div>
        </section>

      </main>
      <Footer />
    </>
  );
}
