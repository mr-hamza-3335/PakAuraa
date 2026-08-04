"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const IgIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const posts = [
  { src: "/sultan-e-zafroon-v2.jpeg", caption: "The Flagship. Sultan-e-Zafroon.", tag: "#SultanEZafroon" },
  { src: "/packaging-lifestyle.jpeg", caption: "Luxury begins before the first spray.", tag: "#PakAuraaPackaging" },
  { src: "/naazif.jpeg", caption: "Pure. Clean. Naazif.", tag: "#Naazif" },
  { src: "/zurtaan-v2.jpeg", caption: "Strength. Power. Zurtaan.", tag: "#Zurtaan" },
  { src: "/zarfah-v2.jpeg", caption: "For the graceful one. Zarfah.", tag: "#Zarfah" },
  { src: "/nuxtar-v2.jpeg", caption: "Own the night. Nuxtar.", tag: "#Nuxtar" },
];

export default function InstagramGallery() {
  return (
    <section className="py-24 lg:py-32 bg-[#060606] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,_rgba(201,168,76,0.018)_0%,_transparent_65%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 relative">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="eyebrow mb-5 opacity-65">Follow Our World</p>
          <h2
            className="text-cream leading-tight"
            style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(32px,4vw,50px)" }}
          >
            @PakAuraa
          </h2>
          <p
            className="text-[13px] text-warm-gray/55 mt-4"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Join our community of luxury fragrance lovers
          </p>
        </motion.div>

        {/* 6-column image grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
          {posts.map((post, i) => (
            <motion.a
              key={i}
              href="https://www.instagram.com/pakauraaa/"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-square overflow-hidden border border-gold/[0.08] hover:border-gold/28 transition-all duration-400"
              whileHover={{ scale: 1.02 }}
            >
              <Image
                src={post.src}
                alt={post.caption}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-350 flex flex-col items-center justify-center gap-2 px-3">
                <IgIcon size={18} />
                <p
                  className="text-[9px] text-cream tracking-wider text-center leading-tight mt-1"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {post.caption}
                </p>
                <p
                  className="text-[8px] text-gold/70 tracking-wider"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {post.tag}
                </p>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="text-center mt-12"
        >
          <motion.a
            href="https://instagram.com/pakauraa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-gold/22 text-warm-gray/65 text-[9px] tracking-[0.28em] uppercase px-9 py-4 hover:border-gold/42 hover:text-cream transition-all duration-500"
            style={{ fontFamily: "var(--font-body-family)" }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(201,168,76,0.03)" }}
            whileTap={{ scale: 0.98 }}
          >
            <IgIcon size={13} />
            Follow @PakAuraa
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
