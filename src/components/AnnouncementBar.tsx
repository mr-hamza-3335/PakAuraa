"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useActiveAnnouncements } from "@/lib/announcements.client";

/** Site-wide promo strip above the header, cycling through admin-managed messages. */
export default function AnnouncementBar() {
  const items = useActiveAnnouncements();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;
  const current = items[index % items.length];

  const text = (
    <span
      className="text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-gold-light"
      style={{ fontFamily: "var(--font-body-family)" }}
    >
      {current.message}
    </span>
  );

  return (
    <div className="relative h-8 sm:h-9 flex items-center justify-center overflow-hidden bg-[#0c0c0c] border-b border-gold/12 px-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center truncate max-w-full"
        >
          {current.link ? (
            <Link href={current.link} className="hover:opacity-80 transition-opacity">
              {text}
            </Link>
          ) : (
            text
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
