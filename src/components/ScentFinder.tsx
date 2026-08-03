"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, RotateCcw } from "lucide-react";
import Image from "next/image";
import { scentMoods } from "@/lib/data";
import { useCatalog } from "@/lib/catalog.client";
import { useSettings, formatPrice } from "@/lib/settings";
import { recommendFromQuiz, type ScentQuizAnswers } from "@/lib/recommend";

const steps = [
  {
    key: "gender" as const,
    question: "Who are you shopping for?",
    options: [
      { value: "men", label: "Men" },
      { value: "women", label: "Women" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    key: "mood" as const,
    question: "What mood are you dressing for?",
    options: scentMoods.map((m) => ({ value: m.id, label: m.label, arabic: m.arabic })),
  },
  {
    key: "intensity" as const,
    question: "How strong should it feel?",
    options: [
      { value: "light", label: "Light" },
      { value: "moderate", label: "Moderate" },
      { value: "intense", label: "Intense" },
    ],
  },
  {
    key: "time" as const,
    question: "Day, night, or both?",
    options: [
      { value: "day", label: "Day" },
      { value: "night", label: "Night" },
      { value: "both", label: "Both" },
    ],
  },
];

export default function ScentFinder() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<ScentQuizAnswers>({});
  const [revealed, setRevealed] = useState(false);
  const { currency } = useSettings();
  const products = useCatalog();

  const recommendations = revealed ? recommendFromQuiz(products, answers, 3) : [];

  const handleAnswer = (key: keyof ScentQuizAnswers, value: string) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      setRevealed(true);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleRestart = () => {
    setAnswers({});
    setStepIndex(0);
    setRevealed(false);
  };

  const currentStep = steps[stepIndex];

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-burgundy overflow-hidden">
      <div className="max-w-[900px] mx-auto text-center">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] text-gold tracking-[0.35em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
            AI Fragrance Finder
          </p>
          <h2 className="font-display text-[clamp(32px,5vw,54px)] text-cream leading-tight mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
            Discover Your
            <br />
            <span className="text-gold-gradient">Signature Scent</span>
          </h2>
        </motion.div>

        {!revealed ? (
          <>
            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mb-10">
              {steps.map((s, i) => (
                <div key={s.key} className={`h-1 rounded-full transition-all duration-300 ${i === stepIndex ? "w-8 bg-gold" : i < stepIndex ? "w-4 bg-gold/50" : "w-4 bg-gold/15"}`} />
              ))}
            </div>

            <motion.div
              key={currentStep.key}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-[15px] text-warm-gray mb-10 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                {currentStep.question}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {currentStep.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleAnswer(currentStep.key, opt.value)}
                    className="relative px-6 py-3 text-[11px] tracking-[0.2em] uppercase transition-all duration-300 rounded-sm group bg-transparent text-warm-gray border border-gold/25 hover:border-gold/50 hover:bg-gold/10 hover:text-cream"
                    style={{ fontFamily: "var(--font-body-family)" }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {opt.label}
                    {"arabic" in opt && (
                      <span
                        className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-gold opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                        style={{ fontFamily: "Scheherazade New, serif" }}
                      >
                        {opt.arabic}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {stepIndex > 0 && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-[10px] text-muted hover:text-warm-gray tracking-[0.15em] uppercase transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <ArrowLeft size={11} /> Back
              </button>
            )}
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className="h-px w-12 bg-gold/30" />
                <Sparkles size={14} className="text-gold" />
                <p className="text-[11px] text-gold tracking-[0.25em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                  Your Matches
                </p>
                <Sparkles size={14} className="text-gold" />
                <div className="h-px w-12 bg-gold/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {recommendations.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}
                    className={`group flex gap-5 p-5 ${product.gradient} border border-gold/20 rounded-lg hover:border-gold/40 transition-all duration-300 cursor-pointer text-left`}
                  >
                    <div className="flex-shrink-0 w-16 h-20 relative overflow-hidden border border-gold/15">
                      <Image src={product.image} alt={product.name} fill className="object-cover object-center" sizes="64px" />
                    </div>
                    <div>
                      <p className="text-[9px] text-gold tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>
                        {product.collection}
                      </p>
                      <h3 className="font-elegant text-lg text-cream mb-1" style={{ fontFamily: "var(--font-elegant-family)" }}>
                        {product.name}
                      </h3>
                      <p className="text-[12px] text-warm-gray mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
                        {product.description}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                          {formatPrice(product.price, currency)}
                        </span>
                        <a
                          href={`/products/${product.id}`}
                          className="inline-flex items-center gap-1 text-[10px] text-gold tracking-[0.15em] uppercase hover:text-gold-light"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          Shop <ArrowRight size={10} />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleRestart}
                className="inline-flex items-center gap-2 text-[10px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5 hover:text-gold-light transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <RotateCcw size={11} /> Retake the Quiz
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
