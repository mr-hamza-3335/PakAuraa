"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const values = [
  { icon: "◈", label: "Authentic Oud", desc: "Sourced from the finest oud trees across Arabia" },
  { icon: "◇", label: "Master Crafted", desc: "Each fragrance composed by expert perfumers" },
  { icon: "◆", label: "Long Lasting", desc: "Up to 12 hours of presence on skin" },
];

export default function BrandStory() {
  return (
    <section className="py-24 lg:py-32 bg-burgundy overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left: Visual */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative order-2 lg:order-1"
          >
            {/* Main image frame */}
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1208] via-[#2d1f0a] to-[#0f0c06] border border-gold/20 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
              {/* Artistic interior */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,_rgba(201,168,76,0.12)_0%,_transparent_60%)]" />

              {/* Arabesque pattern (CSS) */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div
                  className="text-[180px] text-gold leading-none select-none"
                  style={{ fontFamily: "var(--font-scheherazade), serif" }}
                >
                  ◈
                </div>
              </div>

              {/* Centered perfume composition */}
              <div className="absolute inset-0 flex items-end justify-center pb-12">
                <div className="relative">
                  {/* Large bottle */}
                  <div className="w-[90px] h-[200px] rounded-[28px_28px_12px_12px] bg-gradient-to-b from-[#c9a84c33] via-[#2d1f0a] to-[#1a1208] border border-gold/30 shadow-[0_0_60px_rgba(201,168,76,0.2),inset_0_1px_0_rgba(201,168,76,0.4)]">
                    <div className="absolute top-1/2 -translate-y-1/2 left-3 right-3">
                      <div className="h-px bg-gold/40 mb-2" />
                      <p className="text-center text-[7px] tracking-[0.2em] text-gold/80 uppercase" style={{ fontFamily: "var(--font-display-family)" }}>PakAuraa</p>
                      <div className="h-px bg-gold/40 mt-2" />
                    </div>
                    <div className="absolute top-8 left-4 w-[12px] h-[60px] bg-gradient-to-b from-white/20 to-transparent rounded-full blur-[1px]" />
                  </div>
                  <div className="absolute bottom-[198px] left-1/2 -translate-x-1/2 w-[22px] h-[38px] bg-gradient-to-b from-[#c9a84c22] to-transparent border-x border-gold/15" />
                  <div className="absolute bottom-[234px] left-1/2 -translate-x-1/2 w-[38px] h-[28px] rounded-sm bg-gradient-to-b from-gold to-gold-deep shadow-[0_4px_16px_rgba(201,168,76,0.5)]" />

                  {/* Small bottle beside */}
                  <div className="absolute right-[-55px] bottom-0 w-[50px] h-[110px] rounded-[14px_14px_8px_8px] bg-gradient-to-b from-[#c9a84c22] to-[#1a0a12] border border-gold/20" />
                  <div className="absolute right-[-55px] bottom-[110px] left-auto w-[12px] h-[20px] bg-gradient-to-b from-[#c9a84c15] to-transparent border-x border-gold/10 ml-[19px]" />
                  <div className="absolute right-[-55px] bottom-[128px] w-[22px] h-[16px] rounded-sm bg-gold-deep ml-[14px]" />

                  {/* Ground glow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-3 bg-gold/15 blur-xl rounded-full" />
                </div>
              </div>

              {/* Gold accent lines */}
              <div className="absolute top-8 left-8 w-16 h-px bg-gradient-to-r from-gold/60 to-transparent" />
              <div className="absolute top-8 left-8 w-px h-16 bg-gradient-to-b from-gold/60 to-transparent" />
              <div className="absolute bottom-8 right-8 w-16 h-px bg-gradient-to-l from-gold/60 to-transparent" />
              <div className="absolute bottom-8 right-8 w-px h-16 bg-gradient-to-t from-gold/60 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute -bottom-8 -right-6 bg-charcoal border border-gold/25 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
            >
              <p
                className="text-4xl font-display text-gold"
                style={{ fontFamily: "var(--font-display-family)" }}
              >
                5
              </p>
              <p
                className="text-[11px] text-warm-gray tracking-wider mt-1"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Signature Fragrances
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Story text */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="order-1 lg:order-2"
          >
            <p
              className="text-[10px] text-gold tracking-[0.35em] uppercase mb-5"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Our Heritage
            </p>
            <h2
              className="font-display text-[clamp(36px,4.5vw,54px)] text-cream leading-tight mb-6"
              style={{ fontFamily: "var(--font-display-family)" }}
            >
              The Scent of
              <br />
              <span className="text-gold-gradient">Royalty</span>
            </h2>

            {/* Gold quote line */}
            <div className="flex gap-4 mb-8">
              <div className="w-1 bg-gradient-to-b from-gold to-transparent rounded-full flex-shrink-0" />
              <p
                className="text-lg text-warm-gray font-light leading-relaxed italic"
                style={{ fontFamily: "var(--font-elegant-family)" }}
              >
                &quot;A fragrance is the invisible part of your personality that speaks before you
                even enter a room.&quot;
              </p>
            </div>

            <p
              className="text-[15px] text-warm-gray leading-relaxed mb-4"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Founded in the heart of Pakistan, PakAuraa was born from a singular obsession —
              to create fragrances that rival the world&apos;s finest houses, with a soul that
              is unmistakably ours.
            </p>
            <p
              className="text-[15px] text-warm-gray leading-relaxed mb-10"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              We source our raw materials from the finest regions — Assam oud, Bulgarian
              rose, Kashmir saffron — and blend them with modern perfumery techniques to
              create something truly unforgettable.
            </p>

            {/* Values */}
            <div className="space-y-5 mb-10">
              {values.map((v, i) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="text-gold text-lg mt-0.5 flex-shrink-0">{v.icon}</span>
                  <div>
                    <p
                      className="text-[12px] text-cream tracking-wider uppercase mb-0.5"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {v.label}
                    </p>
                    <p
                      className="text-[13px] text-warm-gray/85"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/story"
              className="inline-flex items-center gap-3 text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/40 pb-1 hover:border-gold transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
              whileHover={{ x: 5 }}
            >
              Read Our Full Story
              <ArrowRight size={13} strokeWidth={2} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
