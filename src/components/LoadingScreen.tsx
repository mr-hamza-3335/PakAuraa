"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("pakauraa_loaded");
    if (!shown) {
      // sessionStorage is only available client-side, so this must run in an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("pakauraa_loaded", "1");
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed inset-0 z-[9999] bg-obsidian flex flex-col items-center justify-center"
        >
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,_rgba(201,168,76,0.07)_0%,_transparent_65%)] pointer-events-none" />

          {/* Official Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8"
          >
            <Image
              src="/logo.png"
              alt="PakAuraa Luxury Perfumes"
              width={220}
              height={156}
              className="object-contain"
              priority
              placeholder="empty"
              style={{ filter: "drop-shadow(0 4px 20px rgba(201,168,76,0.25))" }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.5, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-gold text-[11px] tracking-[0.35em] uppercase mb-10"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Luxury Perfumes
          </motion.p>

          {/* Gold progress line */}
          <div className="w-52 h-px bg-gold/15 relative overflow-hidden">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ delay: 0.5, duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent"
            />
          </div>

          {/* Corner ornaments */}
          {[
            "top-6 left-6",
            "top-6 right-6 rotate-90",
            "bottom-6 left-6 -rotate-90",
            "bottom-6 right-6 rotate-180",
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.35, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
              className={`absolute ${pos} w-10 h-10`}
            >
              <div className="w-5 h-px bg-gold absolute top-0 left-0" />
              <div className="w-px h-5 bg-gold absolute top-0 left-0" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
