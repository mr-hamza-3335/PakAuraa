"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Gift, Share2, CheckCircle2, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GiftCardShareCard, { type ShareableGiftCard } from "@/components/GiftCardShareCard";
import { PENDING_GIFT_CARD_KEY } from "@/lib/giftCardProduct";

interface GiftCardDetails {
  code: string;
  initialAmount: number;
  balance: number;
  recipientName: string | null;
  senderName: string | null;
  message: string | null;
  active: boolean;
  createdAt: string;
}

export default function CheckGiftCardPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<GiftCardDetails | null>(null);
  const [showShare, setShowShare] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;
    setLoading(true);
    setError(null);
    setCard(null);
    try {
      const res = await fetch("/api/gift-cards/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setError(data.error ?? "That gift card couldn't be found.");
        return;
      }
      setCard(data.card);
    } finally {
      setLoading(false);
    }
  };

  const shareCard: ShareableGiftCard | null = card
    ? { code: card.code, amount: card.balance, recipientName: card.recipientName, senderName: card.senderName, message: card.message }
    : null;

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen px-6">
        <div className="max-w-[520px] mx-auto">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>
            Gift Cards
          </p>
          <h1 className="font-display text-[clamp(28px,4vw,40px)] text-cream text-center mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
            Check Your Gift Card
          </h1>
          <p className="text-[13px] text-warm-gray text-center mb-10 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
            Enter your gift card code and the recipient&apos;s name to see its balance and details — if no recipient name
            was set when it was bought, use the sender&apos;s name instead.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Gift Card Code</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="GC-XXXXXXXX"
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              />
            </div>
            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Name on the Card (recipient — or sender's name if none was set)</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-50 transition-opacity"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <Search size={13} strokeWidth={2} /> {loading ? "Checking…" : "Check Gift Card"}
            </button>
          </form>

          {error && (
            <div className="flex items-start gap-2.5 p-4 border border-red-500/25 bg-red-500/5 text-[13px] text-red-300 mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
              <XCircle size={16} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {card && (
            <div className="border border-gold/15 bg-charcoal/30 p-6 mb-8">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] text-gold tracking-[0.2em] uppercase flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                  <Gift size={14} strokeWidth={1.5} /> {card.code}
                </p>
                <span
                  className={`flex items-center gap-1.5 text-[9px] tracking-wider uppercase px-2.5 py-1 border ${
                    card.active && card.balance > 0 ? "border-gold/40 text-gold" : "border-warm-gray/20 text-muted"
                  }`}
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  <CheckCircle2 size={11} strokeWidth={1.5} /> {card.active && card.balance > 0 ? "Active" : card.balance <= 0 ? "Fully Redeemed" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>
                  <span className="text-warm-gray">Remaining Balance</span>
                  <span className="text-gold">PKR {card.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>
                  <span className="text-warm-gray">Original Value</span>
                  <span className="text-cream">PKR {card.initialAmount.toLocaleString()}</span>
                </div>
                {card.recipientName && (
                  <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className="text-warm-gray">Addressed To</span>
                    <span className="text-cream">{card.recipientName}</span>
                  </div>
                )}
                {card.senderName && (
                  <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className="text-warm-gray">From</span>
                    <span className="text-cream">{card.senderName}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px]" style={{ fontFamily: "var(--font-body-family)" }}>
                  <span className="text-warm-gray">Issued</span>
                  <span className="text-cream">{new Date(card.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {card.message && (
                  <p className="text-[12px] text-warm-gray italic leading-relaxed pt-2 border-t border-gold/10" style={{ fontFamily: "var(--font-body-family)" }}>
                    &ldquo;{card.message}&rdquo;
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowShare(true)}
                  className="flex-1 flex items-center justify-center gap-2 text-[11px] text-gold border border-gold/30 px-5 py-3 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  <Share2 size={13} strokeWidth={1.5} /> View & Share Card
                </button>
                {card.balance > 0 && (
                  <Link
                    href="/collections"
                    onClick={() => localStorage.setItem(PENDING_GIFT_CARD_KEY, card.code)}
                    className="flex-1 flex items-center justify-center gap-2 text-[11px] text-obsidian bg-gold px-5 py-3 tracking-wider uppercase hover:bg-gold/90 transition-colors"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    Shop &amp; Redeem
                  </Link>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted text-center" style={{ fontFamily: "var(--font-body-family)" }}>
            Don&apos;t have a gift card yet?{" "}
            <Link href="/gift-cards" className="text-gold hover:text-gold-light underline">
              Buy one here
            </Link>
          </p>
        </div>
      </main>
      <Footer />
      {showShare && shareCard && <GiftCardShareCard card={shareCard} onClose={() => setShowShare(false)} />}
    </>
  );
}
