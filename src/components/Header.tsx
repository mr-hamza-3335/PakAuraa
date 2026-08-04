"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Heart, User, ShoppingBag, Menu, X, ChevronDown, Globe, Coins } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { useSettings, type Currency, type Language } from "@/lib/settings";
import { useTranslate } from "@/lib/i18n";
import { useCatalog } from "@/lib/catalog.client";
import AnnouncementBar from "@/components/AnnouncementBar";

const currencies: Currency[] = ["PKR", "USD", "AED", "GBP"];
const languages: { id: Language; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ur", label: "اردو" },
  { id: "ar", label: "العربية" },
];

function useNavLinks() {
  const t = useTranslate();
  return [
    { label: "Home", href: "/", items: null },
    {
      label: t("collections"),
      items: [
        { label: t("forHim"), href: "/collections?cat=men" },
        { label: t("forHer"), href: "/collections?cat=women" },
        { label: t("unisex"), href: "/collections?cat=unisex" },
        { label: t("arabicCollection"), href: "/collections?cat=arabic" },
        { label: t("signatureCollection"), href: "/collections?cat=signature" },
        { label: t("limitedEdition"), href: "/collections?cat=limited" },
        { label: t("giftSets"), href: "/collections?cat=gifts" },
      ],
    },
    {
      label: t("fragrances"),
      items: [
        { label: "Sultan-e-Zafroon", href: "/products/sultan-e-zafroon", note: "Flagship" },
        { label: "Naazif", href: "/products/naazif", note: "Fresh" },
        { label: "Zurtaan", href: "/products/zurtaan", note: "Woody" },
        { label: "Zarfah", href: "/products/zarfah", note: "Floral" },
        { label: "Nuxtar", href: "/products/nuxtar", note: "Night" },
      ],
    },
    { label: "Gift Cards", href: "/gift-cards", items: null },
    { label: "Affiliate", href: "/affiliate", items: null },
    { label: t("ourStory"), href: "/about", items: null },
    { label: t("contact"), href: "/contact", items: null },
  ];
}

export default function Header() {
  const navLinks = useNavLinks();
  const t = useTranslate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [prefsOpen, setPrefsOpen] = useState<"currency" | "language" | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerWrapRef = useRef<HTMLDivElement>(null);

  const { setCartOpen, cartCount, wishlist } = useStore();
  const { currency, language, setCurrency, setLanguage } = useSettings();
  const products = useCatalog();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? cartCount() : 0;
  const wishCount = mounted ? wishlist.length : 0;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.collection.toLowerCase().includes(q) ||
          p.fragranceFamily.some((f) => f.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [searchQuery, products]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keeps a CSS var in sync with the fixed header's real rendered height
  // (nav row + optional announcement bar), so any page can offset content
  // below it without hard-coding a height that drifts when the bar toggles.
  useEffect(() => {
    const el = headerWrapRef.current;
    if (!el) return;
    const setVar = () => {
      document.documentElement.style.setProperty("--site-header-height", `${el.offsetHeight}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleMegaEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(label);
  };

  const handleMegaLeave = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(null), 120);
  };

  return (
    <>
      <div ref={headerWrapRef} className="fixed top-0 left-0 right-0 z-[100]">
        <AnnouncementBar />
        <motion.header
        animate={{
          backgroundColor: scrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.0)",
          borderBottomColor: scrolled ? "rgba(201,168,76,0.10)" : "rgba(201,168,76,0)",
          backdropFilter: scrolled ? "blur(28px) saturate(180%)" : "blur(0px)",
        }}
        style={{ borderBottomWidth: 1, borderBottomStyle: "solid" }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-[1560px] mx-auto px-6 lg:px-16 flex items-center justify-between h-[72px] lg:h-[80px]">

          {/* ── Logo ── */}
          <motion.a
            href="/"
            className="flex items-center select-none flex-shrink-0"
            whileHover={{ opacity: 0.8 }}
            transition={{ duration: 0.25 }}
          >
            <Image
              src="/logo.png"
              alt="PakAuraa Luxury Perfumes"
              width={294}
              height={209}
              className="object-contain w-[68px] lg:w-[80px] h-auto"
              priority
              placeholder="empty"
              style={{ filter: "drop-shadow(0 2px 12px rgba(201,168,76,0.20))" }}
            />
          </motion.a>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-12" role="navigation">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.items && handleMegaEnter(link.label)}
                onMouseLeave={() => link.items && handleMegaLeave()}
              >
                <motion.a
                  href={link.href ?? "#"}
                  className="relative flex items-center gap-1.5 text-[10px] text-warm-gray hover:text-cream tracking-[0.16em] uppercase transition-colors duration-400 py-2 group"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {link.label}
                  {link.items && (
                    <ChevronDown
                      size={10}
                      className="transition-transform duration-400 group-hover:rotate-180 text-gold/60"
                    />
                  )}
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-gold to-gold-light"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    style={{ originX: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </motion.a>

                {/* Dropdown */}
                {link.items && (
                  <AnimatePresence>
                    {megaOpen === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        onMouseEnter={() => handleMegaEnter(link.label)}
                        onMouseLeave={handleMegaLeave}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 min-w-[220px] bg-[#0C0C0C]/98 backdrop-blur-2xl border border-gold/[0.10] shadow-[0_32px_80px_rgba(0,0,0,0.95)]"
                      >
                        {/* Gold top accent */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

                        <div className="py-4">
                          {link.items.map((item, idx) => (
                            <motion.a
                              key={item.label}
                              href={item.href}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.04, duration: 0.2 }}
                              className="group flex items-center justify-between px-6 py-3 transition-all duration-250 hover:bg-gold/[0.04]"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-0 h-px bg-gold/60 transition-all duration-300 group-hover:w-3 flex-shrink-0" />
                                <span
                                  className="text-[11px] text-warm-gray group-hover:text-cream tracking-[0.12em] uppercase transition-colors duration-250"
                                  style={{ fontFamily: "var(--font-body-family)" }}
                                >
                                  {item.label}
                                </span>
                              </div>
                              {"note" in item && (
                                <span
                                  className="text-[8px] text-gold/50 tracking-[0.15em] uppercase"
                                  style={{ fontFamily: "var(--font-body-family)" }}
                                >
                                  {(item as { label: string; href: string; note: string }).note}
                                </span>
                              )}
                            </motion.a>
                          ))}
                          <div className="mx-6 mt-3 pt-3 border-t border-gold/[0.08]">
                            <a
                              href="/collections"
                              className="text-[8px] text-gold/60 hover:text-gold tracking-[0.2em] uppercase transition-colors duration-200"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            >
                              View All →
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* ── Right Icons ── */}
          <div className="flex items-center gap-5 lg:gap-6">
            {/* Search */}
            <>
              {searchOpen ? (
                <motion.div
                  key="bar"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 210, opacity: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="hidden sm:block relative"
                >
                  <div className="flex items-center border-b border-gold/35 overflow-hidden">
                    <input
                      ref={searchRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t("searchPlaceholder")}
                      className="bg-transparent text-[12px] text-cream placeholder:text-muted/60 outline-none w-full py-1"
                      style={{ fontFamily: "var(--font-body-family)" }}
                      onKeyDown={(e) => e.key === "Escape" && (setSearchOpen(false), setSearchQuery(""))}
                    />
                    <button
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="text-muted hover:text-gold transition-colors ml-2 flex-shrink-0"
                    >
                      <X size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="absolute top-full right-0 mt-3 w-[260px] bg-[#0C0C0C]/98 backdrop-blur-2xl border border-gold/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.9)] py-2"
                      >
                        {searchResults.map((p) => (
                          <Link
                            key={p.id}
                            href={`/products/${p.id}`}
                            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-gold/[0.05] transition-colors"
                          >
                            <span className="text-[11px] text-cream tracking-wide" style={{ fontFamily: "var(--font-body-family)" }}>{p.name}</span>
                            <span className="text-[9px] text-gold/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{p.collection}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  aria-label="Search"
                  className="hidden sm:flex text-warm-gray/70 hover:text-gold transition-colors duration-300"
                  onClick={() => setSearchOpen(true)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                >
                  <Search size={16} strokeWidth={1.5} />
                </motion.button>
              )}
            </>

            {/* Currency + Language */}
            <div className="hidden lg:flex items-center gap-4">
              <div
                className="relative"
                onMouseEnter={() => setPrefsOpen("currency")}
                onMouseLeave={() => setPrefsOpen(null)}
              >
                <button
                  aria-label={t("currency")}
                  className="flex items-center gap-1 text-warm-gray/70 hover:text-gold transition-colors text-[10px] tracking-wider"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  <Coins size={13} strokeWidth={1.5} /> {currency}
                </button>
                <AnimatePresence>
                  {prefsOpen === "currency" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full right-0 mt-3 min-w-[100px] bg-[#0C0C0C]/98 backdrop-blur-2xl border border-gold/[0.12] py-1.5 z-10"
                    >
                      {currencies.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`w-full text-left px-4 py-1.5 text-[10px] tracking-wider transition-colors ${c === currency ? "text-gold" : "text-warm-gray hover:text-cream"}`}
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          {c}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="relative"
                onMouseEnter={() => setPrefsOpen("language")}
                onMouseLeave={() => setPrefsOpen(null)}
              >
                <button
                  aria-label={t("language")}
                  className="flex items-center gap-1 text-warm-gray/70 hover:text-gold transition-colors text-[10px] tracking-wider"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  <Globe size={13} strokeWidth={1.5} /> {language.toUpperCase()}
                </button>
                <AnimatePresence>
                  {prefsOpen === "language" && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full right-0 mt-3 min-w-[110px] bg-[#0C0C0C]/98 backdrop-blur-2xl border border-gold/[0.12] py-1.5 z-10"
                    >
                      {languages.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLanguage(l.id)}
                          className={`w-full text-left px-4 py-1.5 text-[10px] tracking-wider transition-colors ${l.id === language ? "text-gold" : "text-warm-gray hover:text-cream"}`}
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Wishlist */}
            <motion.a
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden sm:flex relative text-warm-gray/70 hover:text-gold transition-colors duration-300"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <Heart size={16} strokeWidth={1.5} />
              <AnimatePresence>
                {wishCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-wine text-cream text-[7px] rounded-full flex items-center justify-center"
                  >
                    {wishCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.a>

            {/* Account */}
            <motion.a
              href="/account"
              aria-label="Account"
              className="hidden sm:flex text-warm-gray/70 hover:text-gold transition-colors duration-300"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <User size={16} strokeWidth={1.5} />
            </motion.a>

            {/* Cart */}
            <motion.button
              aria-label="Cart"
              onClick={() => setCartOpen(true)}
              className="relative flex text-warm-gray/70 hover:text-gold transition-colors duration-300"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-obsidian text-[8px] font-medium rounded-full flex items-center justify-center"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile hamburger */}
            <motion.button
              aria-label="Menu"
              className="lg:hidden text-warm-gray/70 hover:text-gold transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                  <X size={18} strokeWidth={1.5} />
                </motion.div>
              ) : (
                <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                  <Menu size={18} strokeWidth={1.5} />
                </motion.div>
              )}
            </motion.button>
          </div>
        </div>
        </motion.header>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-[99] bg-[#060606]/99 backdrop-blur-2xl flex flex-col"
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 h-[72px] border-b border-gold/[0.08]">
              <Image
                src="/logo.png"
                alt="PakAuraa"
                width={68}
                height={48}
                className="object-contain"
                placeholder="empty"
                style={{ filter: "drop-shadow(0 2px 8px rgba(201,168,76,0.2))" }}
              />
              <button onClick={() => setMobileOpen(false)} className="text-warm-gray hover:text-gold transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Account / Wishlist / Cart */}
              <div className="flex items-center justify-center gap-12 mb-8 pb-6 border-b border-gold/[0.08]">
                <a
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-col items-center gap-2 text-warm-gray/70 hover:text-gold transition-colors"
                >
                  <User size={20} strokeWidth={1.5} />
                  <span className="text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                    {t("account")}
                  </span>
                </a>
                <a
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="relative flex flex-col items-center gap-2 text-warm-gray/70 hover:text-gold transition-colors"
                >
                  <Heart size={20} strokeWidth={1.5} />
                  {wishCount > 0 && (
                    <span className="absolute -top-1 right-1 w-4 h-4 bg-wine text-cream text-[8px] rounded-full flex items-center justify-center">
                      {wishCount}
                    </span>
                  )}
                  <span className="text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                    {t("wishlist")}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setCartOpen(true); }}
                  className="relative flex flex-col items-center gap-2 text-warm-gray/70 hover:text-gold transition-colors"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                  {count > 0 && (
                    <span className="absolute -top-1 right-1 w-4 h-4 bg-gold text-obsidian text-[8px] font-medium rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                  <span className="text-[9px] tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                    {t("cart")}
                  </span>
                </button>
              </div>

              {/* Search */}
              <div className="mb-8">
                <div className="flex items-center gap-3 border-b border-gold/20 pb-5">
                  <Search size={15} strokeWidth={1.5} className="text-gold/50" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="bg-transparent text-[14px] text-cream placeholder:text-muted/60 outline-none flex-1"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/products/${p.id}`}
                        onClick={() => { setMobileOpen(false); setSearchQuery(""); }}
                        className="flex items-center justify-between py-3 border-b border-gold/[0.06]"
                      >
                        <span className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{p.name}</span>
                        <span className="text-[9px] text-gold/60 uppercase tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>{p.collection}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Currency + Language */}
              <div className="flex items-center gap-3 mb-8">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                  className="bg-charcoal border border-gold/18 text-warm-gray text-[10px] tracking-wider uppercase px-3 py-2 outline-none"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-charcoal border border-gold/18 text-warm-gray text-[10px] tracking-wider uppercase px-3 py-2 outline-none"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {languages.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>

              {/* Links */}
              <nav className="space-y-1">
                {navLinks.map((link, i) => {
                  const isExpanded = mobileExpanded === link.label;
                  return (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="border-b border-gold/[0.08]"
                    >
                      {link.items ? (
                        <button
                          type="button"
                          onClick={() => setMobileExpanded(isExpanded ? null : link.label)}
                          className="w-full flex items-center justify-between py-5 group"
                        >
                          <span
                            className="text-[28px] font-display text-cream/80 group-hover:text-cream transition-colors duration-300 leading-none"
                            style={{ fontFamily: "var(--font-display-family)" }}
                          >
                            {link.label}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`text-gold/40 group-hover:text-gold transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      ) : (
                        <a
                          href={link.href ?? "#"}
                          className="flex items-center justify-between py-5 group"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span
                            className="text-[28px] font-display text-cream/80 group-hover:text-cream transition-colors duration-300 leading-none"
                            style={{ fontFamily: "var(--font-display-family)" }}
                          >
                            {link.label}
                          </span>
                        </a>
                      )}

                      <AnimatePresence>
                        {link.items && isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-5 pl-1 space-y-4">
                              {link.items.map((item) => (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                                  className="flex items-center gap-3"
                                >
                                  <span className="w-3 h-px bg-gold/50 flex-shrink-0" />
                                  <span
                                    className="text-[13px] text-warm-gray tracking-[0.08em] uppercase"
                                    style={{ fontFamily: "var(--font-body-family)" }}
                                  >
                                    {item.label}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Featured product */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10 p-5 border border-gold/10 bg-gold/[0.02]"
              >
                <p className="text-[8px] text-gold tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
                  Flagship Fragrance
                </p>
                <Link
                  href="/products/sultan-e-zafroon"
                  className="text-[20px] text-cream font-display hover:text-gold transition-colors"
                  style={{ fontFamily: "var(--font-display-family)" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sultan-e-Zafroon →
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
