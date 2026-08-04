"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-24 lg:py-32 px-6 bg-burgundy overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,_rgba(201,168,76,0.07)_0%,_transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,_rgba(107,26,42,0.3)_0%,_transparent_50%)] pointer-events-none" />

      {/* Ornamental top/bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-[640px] mx-auto text-center relative z-10">
        {/* Arabic accent */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-gold text-xl mb-2"
          style={{ fontFamily: "var(--font-scheherazade), serif" }}
        >
          انضم إلينا
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2
            className="font-display text-[clamp(30px,5vw,52px)] text-cream leading-tight mb-4"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            Join the
            <br />
            <span className="text-gold-gradient">Inner Circle</span>
          </h2>
          <p
            className="text-[14px] text-warm-gray leading-relaxed mb-10"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Exclusive fragrance launches, curated stories, and offers crafted only
            for our most discerning members.
          </p>
        </motion.div>

        {/* Form */}
        <>
          {!submitted ? (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                required
                className="flex-1 bg-obsidian/60 border border-gold/20 text-cream text-[14px] px-5 py-4 placeholder:text-muted focus:outline-none focus:border-gold/60 transition-colors duration-300"
                style={{ fontFamily: "var(--font-body-family)" }}
              />
              <motion.button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-gold text-obsidian text-[11px] tracking-[0.2em] uppercase px-8 py-4 hover:bg-gold-light transition-colors duration-300 disabled:opacity-70 whitespace-nowrap"
                style={{ fontFamily: "var(--font-body-family)" }}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={13} strokeWidth={2} />
                  </>
                )}
              </motion.button>
              {error && (
                <p className="sm:col-span-2 text-[11px] text-red-300 mt-1" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>
              )}
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-4 py-6"
            >
              <div className="w-14 h-14 rounded-full border border-gold/50 flex items-center justify-center">
                <Check size={24} className="text-gold" strokeWidth={1.5} />
              </div>
              <p
                className="text-[15px] text-cream"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Welcome to the Inner Circle.
              </p>
              <p
                className="text-[12px] text-warm-gray"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Your first exclusive offer is on its way.
              </p>
            </motion.div>
          )}
        </>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-[11px] text-muted mt-5"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          No spam. Unsubscribe at any time. We respect your privacy.
        </motion.p>
      </div>
    </section>
  );
}
