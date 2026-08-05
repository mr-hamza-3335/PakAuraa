"use client";

import { motion } from "framer-motion";
import { Truck, Package, Shield, Sparkles } from "lucide-react";

const features = [
  {
    Icon: Truck,
    title: "Free Shipping",
    subtitle: "On orders above PKR 5,000",
    desc: "Delivered to your door across Pakistan with full tracking.",
  },
  {
    Icon: Package,
    title: "Luxury Packaging",
    subtitle: "Gift-ready by default",
    desc: "Every order is wrapped in our signature matte black gift box.",
  },
  {
    Icon: Shield,
    title: "100% Authentic",
    subtitle: "Guaranteed originals",
    desc: "We source directly. Every fragrance is verified and authentic.",
  },
  {
    Icon: Sparkles,
    title: "Expert Guidance",
    subtitle: "Personalised recommendations",
    desc: "Our fragrance experts are available to help you find your signature.",
  },
];

export default function LuxuryExperience() {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 overflow-hidden bg-charcoal border-y border-gold/8">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(201,168,76,0.04)_0%,_transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p
            className="text-[10px] text-gold tracking-[0.35em] uppercase mb-4"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            The PakAuraa Promise
          </p>
          <h2
            className="font-display text-[clamp(32px,4.5vw,50px)] text-cream leading-tight"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            A Luxury Experience,
            <br />
            <span className="text-gold-gradient">From First Click to Last Drop</span>
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group text-center"
            >
              {/* Icon */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6 mx-auto">
                <div className="absolute inset-0 rounded-full border border-gold/20 group-hover:border-gold/50 transition-colors duration-400" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/5 to-transparent" />
                <f.Icon
                  size={22}
                  strokeWidth={1}
                  className="text-gold relative z-10"
                />
              </div>

              <h3
                className="text-[15px] text-cream tracking-wide mb-1 group-hover:text-gold transition-colors duration-300"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {f.title}
              </h3>
              <p
                className="text-[11px] text-gold tracking-[0.15em] uppercase mb-3"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {f.subtitle}
              </p>
              <p
                className="text-[13px] text-warm-gray/85 leading-relaxed"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom strip */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        />
      </div>
    </section>
  );
}
