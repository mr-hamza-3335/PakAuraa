"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { getConsent, setConsent } from "@/lib/consent";

/** Gates all marketing/analytics scripts (GTM, Meta Pixel, Clarity) behind an
 * explicit choice — nothing in AnalyticsScripts loads until this resolves
 * "granted". Hidden entirely once the visitor has already decided (in this
 * tab or a previous visit). */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Hydration guard: consent lives in localStorage, which must render as
    // "not visible" on the server and first client paint before the real
    // state appears — otherwise returning visitors see a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(getConsent() === "pending");
  }, []);

  const decide = (granted: boolean) => {
    setConsent(granted ? "granted" : "denied");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 inset-x-0 z-[100] border-t border-gold/20 bg-charcoal/98 backdrop-blur-sm"
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className="max-w-[1440px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
            <p className="text-[12px] text-warm-gray leading-relaxed flex-1" style={{ fontFamily: "var(--font-body-family)" }}>
              We use cookies to understand how you shop with us and to show relevant ads. See our{" "}
              <Link href="/privacy-policy" className="text-gold border-b border-gold/30 hover:border-gold/60 transition-colors">
                Privacy Policy
              </Link>{" "}
              for details.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => decide(false)}
                className="text-[10px] text-warm-gray tracking-[0.15em] uppercase px-4 py-2.5 border border-gold/20 hover:border-gold/40 hover:text-cream transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Decline
              </button>
              <button
                onClick={() => decide(true)}
                className="text-[10px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase hover:bg-gold-light transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Accept
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
