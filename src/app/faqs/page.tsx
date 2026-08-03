"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Every order ships free, Pakistan-wide, and arrives within 3–5 business days of purchase.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We currently accept Cash on Delivery and JazzCash on every order. Credit/debit card and EasyPaisa are coming soon.",
  },
  {
    q: "What's your return policy?",
    a: "You can return your order within 5 days of delivery — if you don't like the fragrance or there's any issue at all, just contact us with your order ID and tell us what went wrong. We'll make it right: your order will be returned and your payment refunded.",
  },
  {
    q: "How can I track my order?",
    a: "Use the Track Order page with your order ID and the email you used at checkout to see live status.",
  },
  {
    q: "Are PakAuraa fragrances authentic and long-lasting?",
    a: "Every PakAuraa fragrance is sourced, blended and quality-checked in-house in Pakistan. Longevity and projection ratings are shown on every product page so you know what to expect before you buy.",
  },
  {
    q: "Do you ship internationally?",
    a: "Not yet — we currently ship within Pakistan only. Follow our updates for international shipping availability.",
  },
  {
    q: "How do I contact support?",
    a: "Reach us any time via the Contact page, or email ameerhamza94572@gmail.com.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gold/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-5 text-left gap-4"
      >
        <span className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
          <ChevronDown size={16} strokeWidth={1.5} className="text-gold flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqsPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[760px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>Help Center</p>
          <h1 className="font-display text-[clamp(32px,5vw,52px)] text-cream text-center mb-14" style={{ fontFamily: "var(--font-display-family)" }}>
            Frequently Asked Questions
          </h1>
          <div>
            {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
