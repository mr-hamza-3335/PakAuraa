"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { FeaturedReview } from "@/lib/reviews.server";

export default function Testimonials({ reviews }: { reviews: FeaturedReview[] }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);

  const next = useCallback(() => {
    setDir(1);
    setActive((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prev = useCallback(() => {
    setDir(-1);
    setActive((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length < 2) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [next, reviews.length]);

  // No real, approved customer reviews yet — nothing fake to show in the meantime.
  if (reviews.length === 0) return null;

  const review = reviews[active];

  return (
    <section className="py-28 lg:py-40 bg-[#060606] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,_rgba(201,168,76,0.025)_0%,_transparent_65%)] pointer-events-none" />

      <div className="max-w-[900px] mx-auto px-6 lg:px-12 text-center relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
        >
          <p className="eyebrow mb-6 opacity-70">What They Say</p>
          <h2
            className="text-cream leading-[0.95] tracking-[-0.02em] mb-4"
            style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(38px,5vw,62px)" }}
          >
            Our Customers Speak
          </h2>
          <div className="divider-gold mb-16 lg:mb-20" />
        </motion.div>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} className="fill-gold text-gold" />
          ))}
        </div>

        {/* Review content */}
        <div className="relative min-h-[200px] flex items-center justify-center mb-12">
          <motion.div
            key={active}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute w-full"
          >
            {/* Open quote */}
            <span
              className="block text-6xl text-gold/15 leading-none mb-4"
              style={{ fontFamily: "var(--font-display-family)" }}
            >
              &ldquo;
            </span>

            <p
              className="text-cream/80 leading-[1.95] mx-auto"
              style={{
                fontFamily: "var(--font-display-family)",
                fontSize: "clamp(17px,2vw,22px)",
                fontStyle: "italic",
                maxWidth: "680px",
              }}
            >
              {review.quote}
            </p>
          </motion.div>
        </div>

        {/* Author */}
        <motion.div
          key={`author-${active}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <div className="h-px w-8 bg-gold/30 mx-auto mb-5" />
          <p
            className="text-[14px] text-cream/80 mb-1"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            {review.author}
          </p>
          <p
            className="text-[10px] text-warm-gray/85 tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            {review.location}{review.productName ? ` · ${review.productName}` : ""}
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-6">
          <motion.button
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-10 h-10 border border-gold/18 text-warm-gray/85 hover:text-gold hover:border-gold/40 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
          >
            <ChevronLeft size={14} strokeWidth={1.5} />
          </motion.button>

          {/* Dots */}
          <div className="flex items-center gap-1">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                aria-label={`Go to testimonial ${i + 1}`}
                aria-current={i === active}
                className="w-6 h-6 flex items-center justify-center"
              >
                <span className={`block transition-all duration-400 ${
                  i === active ? "w-6 h-1 bg-gold" : "w-2 h-1 bg-gold/20 hover:bg-gold/40"
                }`} />
              </button>
            ))}
          </div>

          <motion.button
            onClick={next}
            aria-label="Next testimonial"
            className="w-10 h-10 border border-gold/18 text-warm-gray/85 hover:text-gold hover:border-gold/40 flex items-center justify-center transition-all duration-300"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
          >
            <ChevronRight size={14} strokeWidth={1.5} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
