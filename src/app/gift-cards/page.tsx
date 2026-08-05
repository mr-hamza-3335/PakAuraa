"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gift, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore } from "@/lib/store";
import { createGiftCardProduct } from "@/lib/giftCardProduct";
import { createClient } from "@/lib/supabase/client";

const FIXED_AMOUNTS = [2000, 5000, 10000, 20000];
const MIN_CUSTOM = 1000;
const MAX_CUSTOM = 50000;

export default function GiftCardsPage() {
  const router = useRouter();
  const { addToCart, setCartOpen } = useStore();
  const [amount, setAmount] = useState<number>(FIXED_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.full_name) setSenderName(data.user.user_metadata.full_name);
    });
  }, []);

  const finalAmount = useCustom ? Number(customAmount) || 0 : amount;
  const customValid = !useCustom || (finalAmount >= MIN_CUSTOM && finalAmount <= MAX_CUSTOM);
  const formValid = recipientEmail.trim() && finalAmount > 0 && customValid;

  const handleAdd = () => {
    if (!formValid) return;
    const uniqueProduct = { ...createGiftCardProduct(finalAmount), id: `gift-card-${finalAmount}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    addToCart(uniqueProduct, 0, finalAmount, {
      giftCardRecipient: {
        email: recipientEmail.trim(),
        name: recipientName.trim() || undefined,
        senderName: senderName.trim() || undefined,
        message: message.trim() || undefined,
      },
    });
    setAdded(true);
    setTimeout(() => {
      setCartOpen(true);
    }, 400);
  };

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[560px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>Give a Fragrance</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-4 text-center" style={{ fontFamily: "var(--font-display-family)" }}>
            PakAuraa Gift Cards
          </h1>
          <p className="text-[13px] text-warm-gray text-center mb-12 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
            Delivered instantly by email — redeemable against any fragrance at checkout.
          </p>

          <div className="border border-gold/15 bg-charcoal/30 p-6 sm:p-8 space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Amount</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {FIXED_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setAmount(a); setUseCustom(false); }}
                    className={`py-3 text-center border transition-all ${
                      !useCustom && amount === a ? "border-gold bg-gold/10 text-gold" : "border-gold/18 text-warm-gray hover:border-gold/35"
                    }`}
                  >
                    <p className="text-[12px]" style={{ fontFamily: "var(--font-body-family)" }}>{a.toLocaleString()}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setUseCustom(true)}
                className={`w-full flex items-center gap-3 p-3 border transition-all ${useCustom ? "border-gold/40 bg-gold/6" : "border-gold/12 hover:border-gold/25"}`}
              >
                <span className="text-[11px] text-cream tracking-wider flex-shrink-0" style={{ fontFamily: "var(--font-body-family)" }}>Custom:</span>
                <input
                  type="number"
                  min={MIN_CUSTOM}
                  max={MAX_CUSTOM}
                  value={customAmount}
                  onFocus={() => setUseCustom(true)}
                  onChange={(e) => { setCustomAmount(e.target.value); setUseCustom(true); }}
                  placeholder={`PKR ${MIN_CUSTOM.toLocaleString()} – ${MAX_CUSTOM.toLocaleString()}`}
                  className="flex-1 bg-transparent text-cream text-[13px] outline-none placeholder:text-warm-gray/85"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
              </button>
              {useCustom && customAmount && !customValid && (
                <p className="text-[11px] text-red-300 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>
                  Custom amount must be between PKR {MIN_CUSTOM.toLocaleString()} and {MAX_CUSTOM.toLocaleString()}.
                </p>
              )}
            </div>

            {/* Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Recipient Email</label>
                <input
                  required
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
              </div>
              <div>
                <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Recipient Name (optional)</label>
                <input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
              </div>
              <div>
                <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Your Name (optional)</label>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Personal Message (optional)</label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50"
                  style={{ fontFamily: "var(--font-body-family)" }}
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!formValid}
              className="w-full flex items-center justify-center gap-3 py-4 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-40"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {added ? <><Check size={15} strokeWidth={2} /> Added to Cart</> : <><Gift size={15} strokeWidth={2} /> Add Gift Card — PKR {finalAmount.toLocaleString()}</>}
            </button>
            {added && (
              <button
                onClick={() => router.push("/checkout")}
                className="w-full text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5 text-center"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Proceed to Checkout
              </button>
            )}
          </div>

          <p className="text-[11px] text-warm-gray/85 text-center mt-8" style={{ fontFamily: "var(--font-body-family)" }}>
            Already have a gift card?{" "}
            <Link href="/gift-cards/check" className="text-gold hover:text-gold-light underline">
              Check its balance &amp; details
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
