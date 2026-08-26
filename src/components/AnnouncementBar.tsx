"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useActiveAnnouncements } from "@/lib/announcements.client";

/** Site-wide promo strip above the header — items scroll continuously right-to-left,
 * cycling every ~5s per item. Shows nothing when there are no active announcements. */
export default function AnnouncementBar() {
  const items = useActiveAnnouncements();

  if (items.length === 0) return null;

  // Duplicate items so the marquee fills the screen continuously
  const marqueeItems = [...items, ...items, ...items];

  return (
    <div className="relative h-8 sm:h-9 flex items-center overflow-hidden bg-[#0c0c0c] border-b border-gold/12">
      <div className="flex items-center whitespace-nowrap animate-marquee">
        {marqueeItems.map((item, idx) => (
          <span key={`${item.id}-${idx}`} className="inline-flex items-center gap-6 px-8">
            <span
              className="text-[10px] sm:text-[11px] tracking-[0.16em] uppercase text-gold-light"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {item.link ? (
                <Link href={item.link} className="hover:opacity-80 transition-opacity">
                  {item.message}
                </Link>
              ) : (
                item.message
              )}
            </span>
            <span className="text-gold/30 text-[10px] select-none">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
