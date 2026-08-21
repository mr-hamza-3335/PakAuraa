"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown, Truck, ShieldCheck, Banknote } from "lucide-react";
import Image from "next/image";
import { products, type Product } from "@/lib/data";

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

// The hero showcases the two live fragrances, in this order — pulled straight
// from data.ts so the copy can never drift from the real product content.
const HERO_IDS = ["zurtaan", "zarfah"];
const heroProducts: Product[] = HERO_IDS.map((id) => products.find((p) => p.id === id)).filter(
  (p): p is Product => !!p
);

const GENDER_RING: Record<Product["gender"], string> = { men: "For Him", women: "For Her", unisex: "Unisex" };

function heroStats(product: Product) {
  return [
    { label: "Fragrance Family", value: product.fragranceFamily.slice(0, 2).join(" · ") },
    { label: "For", value: GENDER_RING[product.gender] },
    product.performanceText
      ? { label: "Performance", value: product.performanceText }
      : { label: "Bottle Size", value: product.size },
  ];
}

const AUTO_ADVANCE_MS = 6500;

const TRUST_POINTS = [
  { Icon: Truck, label: "Free Delivery" },
  { Icon: Banknote, label: "Cash on Delivery" },
  { Icon: ShieldCheck, label: "100% Genuine" },
];

export default function HeroSection() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
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

  useEffect(() => {
    // Restarting on activeIndex keeps a fixed "quiet time" after every
    // change, whether it came from the timer or a manual dot click.
    const t = setInterval(() => setActiveIndex((i) => (i + 1) % heroProducts.length), AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [activeIndex]);

  const active = heroProducts[activeIndex];
  const stats = heroStats(active);
  const ringText = `${active.fragranceFamily.slice(0, 2).join(" · ").toUpperCase()} · ${GENDER_RING[active.gender].toUpperCase()} ·`;

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100svh] lg:h-screen lg:min-h-[720px] overflow-hidden"
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
      <div
        className="relative z-10 min-h-[100svh] lg:h-full max-w-[1560px] mx-auto px-6 lg:px-20 pb-16 lg:pb-0 flex items-center"
        style={{ paddingTop: "calc(var(--site-header-height) + 24px)" }}
      >
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

          {/* LEFT: Editorial text */}
          <motion.div
            className="flex flex-col justify-center space-y-6 lg:space-y-8 z-10"
            style={{ y: textY, opacity: masterOpacity }}
          >
            {ready && (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                {/* ── Mobile: compact, single-screen layout ── */}
                <div className="lg:hidden flex flex-col items-center text-center gap-3.5">
                  <div className="relative w-[168px] aspect-[4/5]">
                    <div className="absolute inset-[-30px] bg-[radial-gradient(ellipse_at_center,_rgba(61,8,32,0.7)_0%,_transparent_65%)] pointer-events-none" />
                    <div className="relative w-full h-full overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.9)]">
                      <Image
                        src={active.image}
                        alt={`${active.name} — PakAuraa`}
                        fill
                        className="object-cover object-center"
                        sizes="168px"
                        priority
                      />
                    </div>
                  </div>

                  <span className="eyebrow opacity-70 text-[8px]">
                    {active.concentration} · Karachi, Pakistan
                  </span>

                  <h1
                    className="text-gold-gradient tracking-[-0.01em]"
                    style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(26px, 9vw, 36px)", lineHeight: 1 }}
                  >
                    {active.name}
                  </h1>

                  <p
                    className="text-[13px] text-warm-gray/85 leading-[1.6] max-w-[280px] line-clamp-2 font-light"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {active.description}
                  </p>

                  <a
                    href={`/products/${active.id}`}
                    className="group relative overflow-hidden inline-flex items-center gap-2.5 mt-1 px-8 py-3.5 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[10px] tracking-[0.24em] uppercase font-medium"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    Shop {active.name}
                    <ArrowRight size={11} strokeWidth={2.5} />
                  </a>

                  <div className="flex items-center gap-3.5 mt-1">
                    {TRUST_POINTS.map(({ Icon, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <Icon size={11} strokeWidth={1.5} className="text-gold/60" />
                        <span
                          className="text-[8px] text-warm-gray/85 tracking-[0.04em]"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Desktop: full editorial layout ── */}
                <div className="hidden lg:flex flex-col space-y-8">
                  {/* Eyebrow line */}
                  <div className="flex items-center gap-5">
                    <motion.div
                      className="h-px bg-gradient-to-r from-gold/60 to-transparent"
                      initial={{ width: 0 }}
                      animate={{ width: 48 }}
                      transition={{ delay: 0.15, duration: 0.8 }}
                    />
                    <span className="eyebrow opacity-70">
                      {active.concentration} · Karachi, Pakistan
                    </span>
                  </div>

                  {/* Main headline */}
                  <h1
                    className="leading-[0.85] tracking-[-0.02em] overflow-hidden"
                    style={{ fontFamily: "var(--font-display-family)" }}
                  >
                    <span className="block overflow-hidden">
                      <motion.span
                        className="inline-block text-gold-gradient"
                        initial={{ y: 100, skewY: 3 }}
                        animate={{ y: 0, skewY: 0 }}
                        transition={{ delay: 0.1, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                        style={{ fontSize: "clamp(30px, 8vw, 92px)", lineHeight: 0.9 }}
                      >
                        {active.name}
                      </motion.span>
                    </span>
                    <motion.span
                      className="block mt-3 h-px bg-gradient-to-r from-gold/50 via-gold/15 to-transparent"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: "left", width: "60%" }}
                    />
                  </h1>

                  {/* Description */}
                  <p
                    className="text-[17px] text-warm-gray/85 leading-[1.9] max-w-[480px] font-light"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {active.description}
                  </p>

                  {/* CTAs */}
                  <div className="flex items-start gap-4">
                    <motion.a
                      href={`/products/${active.id}`}
                      className="group relative overflow-hidden inline-flex items-center gap-3 px-9 py-4 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[10px] tracking-[0.28em] uppercase font-medium"
                      style={{ fontFamily: "var(--font-body-family)" }}
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 56px rgba(201,168,76,0.38)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-[200%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-800" />
                      Discover {active.name}
                      <ArrowRight size={11} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </motion.a>

                    <motion.a
                      href="/collections"
                      className="inline-flex items-center gap-3 px-9 py-4 border border-gold/20 text-warm-gray/85 text-[10px] tracking-[0.28em] uppercase hover:border-gold/45 hover:text-cream transition-all duration-500"
                      style={{ fontFamily: "var(--font-body-family)" }}
                      whileHover={{ backgroundColor: "rgba(201,168,76,0.04)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      View All Fragrances
                    </motion.a>
                  </div>

                  {/* Trust points */}
                  <div className="flex items-center gap-6">
                    {TRUST_POINTS.map(({ Icon, label }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon size={13} strokeWidth={1.5} className="text-gold/60" />
                        <span
                          className="text-[10px] text-warm-gray/85 tracking-[0.05em]"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Fragrance stats */}
                  <div className="flex items-center gap-8 pt-6 border-t border-gold/[0.07]">
                    {stats.map(({ label, value }) => (
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
                  </div>
                </div>
              </motion.div>
            )}

            {/* Slide indicators */}
            {ready && heroProducts.length > 1 && (
              <div className="flex items-center justify-center lg:justify-start gap-2 mt-1 lg:mt-0">
                {heroProducts.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={`Show ${p.name}`}
                    onClick={() => setActiveIndex(i)}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-8 bg-gold" : "w-4 bg-gold/25 hover:bg-gold/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Product image */}
          <motion.div
            className="hidden lg:flex items-center justify-center lg:justify-end"
            style={{ y: imageY }}
          >
            {ready && (
              <motion.div
                key={activeIndex}
                style={{ x: imgMoveX, y: imgMoveY }}
                className="relative"
                initial={{ opacity: 0, scale: 0.94, x: 40 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
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
                      src={active.image}
                      alt={`${active.name} — PakAuraa`}
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

                  {/* Rotating identity ring */}
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
                          {ringText}
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span
          className="text-[7px] text-warm-gray/85 tracking-[0.5em] uppercase"
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
