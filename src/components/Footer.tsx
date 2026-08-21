"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, MapPin, Phone, Mail } from "lucide-react";
import Image from "next/image";
import { whatsAppLink } from "@/components/WhatsAppWidget";
import { useTranslate } from "@/lib/i18n";
import { trackNewsletterSubscribe } from "@/lib/analytics";

const IgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FbIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const WaIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);
const TtIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12.5a4 4 0 1 0 4 4V3.5a5.5 5.5 0 0 0 5.5 5.5" />
  </svg>
);
const LiIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <line x1="7" y1="10.5" x2="7" y2="17" />
    <circle cx="7" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    <line x1="11" y1="10.5" x2="11" y2="17" />
    <path d="M11 13.2a2.3 2.3 0 0 1 4.5 0V17" />
  </svg>
);

const socials = [
  { Icon: IgIcon, label: "Instagram", href: "https://www.instagram.com/pakauraaa/" },
  { Icon: TtIcon, label: "TikTok", href: "https://www.tiktok.com/@pakauraaa" },
  { Icon: FbIcon, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61592916234492" },
  { Icon: LiIcon, label: "LinkedIn", href: "https://www.linkedin.com/in/ameer-hamza-8615a02a5/" },
  { Icon: WaIcon, label: "WhatsApp", href: whatsAppLink("Hi PakAuraa! I'd like to ask about a fragrance.") },
];

const footerLinks = {
  Shop: [
    { label: "New Arrivals", href: "/collections?sort=new" },
    { label: "Best Sellers", href: "/collections" },
    { label: "Signature Collection", href: "/collections?cat=signature" },
    { label: "Gift Sets", href: "/collections?cat=gifts" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Limited Edition", href: "/collections?cat=limited" },
  ],
  Information: [
    { label: "About Us", href: "/about" },
    { label: "Our Story", href: "/about#story" },
    { label: "Craftsmanship", href: "/about#craft" },
    { label: "Journal", href: "/journal" },
    { label: "Press", href: "/press" },
    { label: "Careers", href: "/careers" },
  ],
  Help: [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Track Order", href: "/track" },
    { label: "Size Guide", href: "/size-guide" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subbed, setSubbed] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [subLoading, setSubLoading] = useState(false);
  const year = new Date().getFullYear();
  const t = useTranslate();

  const handleSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubError(null);
    setSubLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubError(data.error ?? "Couldn't subscribe. Please try again.");
        return;
      }
      trackNewsletterSubscribe();
      setSubbed(true);
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <footer className="bg-[#060606]">
      {/* Gold hairline */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Newsletter strip */}
      <div className="bg-[#0A0A0A] border-b border-gold/[0.06] py-12 px-6 lg:px-16">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <p className="eyebrow mb-3 opacity-80">Join the Inner Circle</p>
            <p
              className="text-cream"
              style={{ fontFamily: "var(--font-display-family)", fontSize: "clamp(18px,2vw,24px)" }}
            >
              Exclusive offers. Early access. Fragrance stories.
            </p>
          </div>

          {!subbed ? (
            <div className="w-full lg:w-auto">
              <form onSubmit={handleSub} className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("yourEmailAddress")}
                  required
                  className="flex-1 lg:w-72 bg-[#080808] border border-gold/14 text-cream text-[13px] px-5 py-3.5 placeholder:text-muted/50 outline-none focus:border-gold/35 transition-colors duration-300"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
                <motion.button
                  type="submit"
                  disabled={subLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[9px] tracking-[0.25em] uppercase px-7 py-3.5 flex items-center justify-center gap-2 whitespace-nowrap font-medium disabled:opacity-60"
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 30px rgba(201,168,76,0.35)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {subLoading ? "…" : t("subscribe")} <ArrowRight size={11} strokeWidth={2.5} className="rtl:rotate-180" />
                </motion.button>
              </form>
              {subError && (
                <p className="text-[11px] text-red-300 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>{subError}</p>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-gold/80"
            >
              <Check size={16} strokeWidth={2} />
              <span className="text-[13px] tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
                You&apos;re on the list. Welcome.
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 lg:gap-12">

        {/* Brand column */}
        <div className="col-span-2 md:col-span-1 lg:col-span-2">
          <div className="mb-7">
            <Image
              src="/logo.png"
              alt="PakAuraa Luxury Perfumes"
              width={294}
              height={209}
              className="object-contain w-[85px] lg:w-[100px] h-auto"
              placeholder="empty"
              style={{ filter: "drop-shadow(0 2px 10px rgba(201,168,76,0.18))" }}
            />
          </div>

          <p
            className="text-[13px] text-warm-gray/85 leading-relaxed mb-5 max-w-[260px]"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            World-class luxury fragrances, crafted in Pakistan for the global connoisseur.
          </p>

          <div className="space-y-2.5 mb-7">
            {[
              { Icon: MapPin, text: "Karachi, Pakistan" },
              { Icon: Phone, text: "0325 2106239" },
              { Icon: Mail, text: "ameerhamza94572@gmail.com" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon size={11} strokeWidth={1.5} className="text-gold/40 flex-shrink-0" />
                <span className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {socials.map(({ Icon, label, href }) => (
              <motion.a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-gold/14 flex items-center justify-center text-warm-gray/85 hover:text-gold hover:border-gold/38 transition-all duration-300"
                whileHover={{ scale: 1.08, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([section, items]) => (
          <div key={section}>
            <h3
              className="text-[8px] text-gold/78 tracking-[0.3em] uppercase mb-6"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {section === "Shop" ? t("shop") : section === "Information" ? t("information") : section === "Help" ? t("help") : section}
            </h3>
            <ul className="space-y-3.5">
              {items.map((item) => (
                <li key={item.label}>
                  <motion.a
                    href={item.href}
                    className="group text-[11px] text-warm-gray/85 hover:text-warm-gray/80 transition-colors duration-250 flex items-center gap-0 hover:gap-1.5"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    <span className="w-0 h-px bg-gold/45 transition-all duration-300 group-hover:w-2.5 flex-shrink-0" />
                    {item.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Gold divider */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
          © {year} PakAuraa Luxury Perfumes. All rights reserved.
        </p>
        <div className="flex gap-5">
          {[
            { label: "Privacy Policy", href: "/privacy-policy" },
            { label: "Terms", href: "/terms" },
            { label: "Sitemap", href: "/sitemap.xml" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[10px] text-warm-gray/85 hover:text-warm-gray/85 transition-colors duration-250"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
