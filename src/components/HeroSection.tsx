"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Image from "next/image";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

function generateParticles(): Particle[] {
  return Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 1.8 + 0.4,
    delay: Math.random() * 9,
    duration: Math.random() * 6 + 9,
    opacity: Math.random() * 0.3 + 0.08,
  }));
}

export default function HeroSection() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const masterOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { damping: 55, stiffness: 90, mass: 0.5 });
  const mouseY = useSpring(rawY, { damping: 55, stiffness: 90, mass: 0.5 });

  const imgMoveX = useTransform(mouseX, [-1, 1], [-18, 18]);
  const imgMoveY = useTransform(mouseY, [-1, 1], [-12, 12]);
  const bgGlowX = useTransform(mouseX, [-1, 1], [-6, 6]);
  const bgGlowY = useTransform(mouseY, [-1, 1], [-4, 4]);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    // Particles use Math.random() and must only render post-hydration,
    // so the client-only value is intentionally set on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(generateParticles());
    const t = setTimeout(() => setReady(true), 80);
    const onMove = (e: MouseEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); clearTimeout(t); };
  }, [rawX, rawY]);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[720px] overflow-hidden"
      style={{ background: "#080808" }}
    >
      {/* ── Background ── */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        {/* Deep burgundy radial — right side where product is */}
        <motion.div
          className="absolute inset-0"
          style={{ x: bgGlowX, y: bgGlowY }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_72%_50%,_rgba(61,8,32,0.55)_0%,_rgba(20,2,8,0.25)_45%,_transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_72%_50%,_rgba(92,16,48,0.20)_0%,_transparent_55%)]" />
        </motion.div>
        {/* Warm left ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_60%,_rgba(201,168,76,0.04)_0%,_transparent_60%)]" />
        {/* Cinematic top key-light streak */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,_transparent_38%,_rgba(201,168,76,0.05)_48%,_transparent_58%)]" />
        {/* Bottom fade to site background */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
      </motion.div>

      {/* ── Arabesque ornament, faint, right side ── */}
      <div
        className="absolute inset-y-0 right-0 w-[55%] flex items-center justify-end opacity-[0.04] pointer-events-none select-none overflow-hidden"
        aria-hidden
      >
        <div
          className="text-[64vh] leading-none translate-x-[18%]"
          style={{ color: "#c9a84c" }}
        >
          ◈
        </div>
      </div>

      {/* ── Floating Gold Particles ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-gold"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `floatSlow ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="relative z-10 h-full max-w-[1560px] mx-auto px-6 lg:px-20 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

          {/* LEFT: Editorial text */}
          <motion.div
            className="flex flex-col justify-center space-y-6 lg:space-y-8 z-10"
            style={{ y: textY, opacity: masterOpacity }}
          >
            {/* Eyebrow line */}
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-5"
              >
                <motion.div
                  className="h-px bg-gradient-to-r from-gold/60 to-transparent"
                  initial={{ width: 0 }}
                  animate={{ width: 48 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                />
                <span className="eyebrow opacity-70">
                  Extrait de Parfum · Lahore, Pakistan
                </span>
              </motion.div>
            )}

            {/* Arabic name */}
            {ready && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-[22px] lg:text-[26px] text-gold/55 leading-none"
                style={{ fontFamily: "Scheherazade New, serif" }}
              >
                سلطان الزعفران
              </motion.p>
            )}

            {/* Main headline */}
            {ready && (
              <h1
                className="leading-[0.85] tracking-[-0.02em] overflow-hidden whitespace-nowrap"
                style={{ fontFamily: "var(--font-display-family)" }}
              >
                <span className="block overflow-hidden">
                  {[
                    { text: "Sultan-e-", gold: false },
                    { text: "Zafroon", gold: true },
                  ].map((word, i) => (
                    <motion.span
                      key={i}
                      className={`inline-block ${word.gold ? "text-gold-gradient" : "text-cream"}`}
                      initial={{ y: 100, opacity: 0, skewY: 3 }}
                      animate={{ y: 0, opacity: 1, skewY: 0 }}
                      transition={{
                        delay: 0.45 + i * 0.1,
                        duration: 1.1,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      style={{
                        fontSize: "clamp(38px, 4.4vw, 92px)",
                        lineHeight: 0.9,
                      }}
                    >
                      {word.text}
                    </motion.span>
                  ))}
                </span>
                <motion.span
                  className="block mt-3 h-px bg-gradient-to-r from-gold/50 via-gold/15 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.85, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "left", width: "60%" }}
                />
              </h1>
            )}

            {/* Description */}
            {ready && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="text-[15px] lg:text-[17px] text-warm-gray/70 leading-[1.9] max-w-[420px] lg:max-w-[480px] font-light"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                The reigning sovereign of rare Kashmir saffron and aged Assam oud.
                A fragrance that commands presence before a word is spoken.
              </motion.p>
            )}

            {/* CTAs */}
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-start gap-4"
              >
                <motion.a
                  href="/products/sultan-e-zafroon"
                  className="group relative overflow-hidden inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[10px] tracking-[0.28em] uppercase font-medium"
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 56px rgba(201,168,76,0.38)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-800" />
                  Discover Sultan-e-Zafroon
                  <ArrowRight size={11} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                </motion.a>

                <motion.a
                  href="/collections"
                  className="inline-flex items-center gap-3 px-9 py-4 border border-gold/20 text-warm-gray/70 text-[10px] tracking-[0.28em] uppercase hover:border-gold/45 hover:text-cream transition-all duration-500"
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={{ backgroundColor: "rgba(201,168,76,0.04)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  View All Fragrances
                </motion.a>
              </motion.div>
            )}

            {/* Fragrance stats */}
            {ready && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
                className="flex items-center gap-8 pt-6 border-t border-gold/[0.07]"
              >
                {[
                  { label: "Longevity", value: "10–12 hrs" },
                  { label: "Projection", value: "Intense" },
                  { label: "Volume", value: "30 · 50 · 100ml" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p
                      className="text-[7px] text-muted/80 tracking-[0.28em] uppercase mb-1.5"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[12px] text-gold/80"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Mobile-only bottle image */}
            {ready && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="lg:hidden relative mx-auto mt-2 w-[220px] aspect-[4/5]"
              >
                <div className="absolute inset-[-40px] bg-[radial-gradient(ellipse_at_center,_rgba(61,8,32,0.7)_0%,_transparent_65%)] pointer-events-none" />
                <div className="relative w-full h-full overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.9)]">
                  <Image
                    src="/sultan-e-zafroon.jpeg"
                    alt="Sultan-e-Zafroon — PakAuraa Flagship Perfume"
                    fill
                    className="object-cover object-center"
                    sizes="220px"
                  />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* RIGHT: Sultan product image */}
          <motion.div
            className="hidden lg:flex items-center justify-center lg:justify-end"
            style={{ y: imageY }}
          >
            {ready && (
              <motion.div
                style={{ x: imgMoveX, y: imgMoveY }}
                className="relative"
                initial={{ opacity: 0, scale: 0.93, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Floating animation layer */}
                <motion.div
                  animate={{ y: [0, -22, 0] }}
                  transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Glow layers */}
                  <div className="absolute inset-[-90px] bg-[radial-gradient(ellipse_at_center,_rgba(61,8,32,0.75)_0%,_transparent_65%)] pointer-events-none" />
                  <div className="absolute inset-[-50px] bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.10)_0%,_transparent_60%)] pointer-events-none" />
                  <div className="absolute inset-[-20px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,_rgba(255,236,190,0.12)_0%,_transparent_60%)] pointer-events-none" />

                  {/* Product image */}
                  <div className="relative w-[380px] lg:w-[440px] xl:w-[500px] 2xl:w-[560px] aspect-[4/5] overflow-hidden shadow-[0_56px_140px_rgba(0,0,0,0.95),0_0_100px_rgba(61,8,32,0.55)]">
                    <Image
                      src="/sultan-e-zafroon.jpeg"
                      alt="Sultan-e-Zafroon — PakAuraa Flagship Perfume"
                      fill
                      className="object-cover object-center"
                      sizes="560px"
                      priority
                    />
                    {/* Inner subtle vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/10 pointer-events-none" />
                    {/* Subtle left edge softening */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Gold corner ornaments */}
                  {([
                    "top-0 left-0",
                    "top-0 right-0 rotate-90",
                    "bottom-0 left-0 -rotate-90",
                    "bottom-0 right-0 rotate-180",
                  ] as const).map((cls, i) => (
                    <div key={i} className={`absolute ${cls} w-10 h-10 pointer-events-none`}>
                      <div className="absolute top-0 left-0 w-5 h-[0.5px] bg-gold/40" />
                      <div className="absolute top-0 left-0 h-5 w-[0.5px] bg-gold/40" />
                    </div>
                  ))}

                  {/* Flagship badge */}
                  <motion.div
                    className="absolute -top-5 -right-5 w-[72px] h-[72px]"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  >
                    <svg viewBox="0 0 72 72" className="w-full h-full">
                      <path
                        id="circ"
                        d="M36,6 a30,30 0 1,1 -0.01,0"
                        fill="none"
                      />
                      <text className="fill-gold/60" style={{ fontSize: "7px", fontFamily: "var(--font-body-family)", letterSpacing: "0.22em" }}>
                        <textPath href="#circ">
                          FLAGSHIP · NO.01 · EXTRAIT DE PARFUM ·
                        </textPath>
                      </text>
                    </svg>
                  </motion.div>

                  {/* Ground shadow */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[280px] h-10 bg-gold/6 blur-3xl rounded-full pointer-events-none" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span
          className="text-[7px] text-muted/60 tracking-[0.5em] uppercase"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={14} strokeWidth={1} className="text-gold/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
