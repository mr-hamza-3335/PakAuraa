"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Copy, Check, Percent, Users, Wallet } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

interface AffiliateData {
  code: string;
  commissionRate: number;
  pending: number;
  paid: number;
  referrals: number;
}

export default function AffiliatePage() {
  const [checked, setChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time auth check on mount, no Supabase configured
      setChecked(true);
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      setSignedIn(Boolean(data.user));
      setChecked(true);
      if (data.user) {
        const res = await fetch("/api/affiliate/stats");
        const body = await res.json();
        setAffiliate(body.affiliate);
      }
    });
  }, []);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/affiliate/join", { method: "POST" });
      const body = await res.json();
      if (res.ok) setAffiliate({ code: body.code, commissionRate: 0.1, pending: 0, paid: 0, referrals: 0 });
    } finally {
      setLoading(false);
    }
  };

  const referralLink = affiliate && typeof window !== "undefined" ? `${window.location.origin}?ref=${affiliate.code}` : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen px-6 lg:px-12">
        <div className="max-w-[720px] mx-auto text-center mb-16">
          <p className="eyebrow mb-4 opacity-80">Refer &amp; Earn</p>
          <h1
            className="text-[clamp(32px,5vw,52px)] text-cream leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-display-family)" }}
          >
            Become a PakAuraa Affiliate
          </h1>
          <p className="text-[14px] text-warm-gray leading-[1.85]" style={{ fontFamily: "var(--font-body-family)" }}>
            Share your personal referral link with friends, family, or your audience. Every time someone places an
            order through it, you earn a real commission — paid straight to you.
          </p>
        </div>

        <div className="max-w-[720px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16">
          <div className="border border-gold/12 bg-charcoal/20 p-6 text-center">
            <Percent size={20} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-cream mb-1" style={{ fontFamily: "var(--font-body-family)" }}>10% Commission</p>
            <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>On every order your link brings in</p>
          </div>
          <div className="border border-gold/12 bg-charcoal/20 p-6 text-center">
            <Share2 size={20} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-cream mb-1" style={{ fontFamily: "var(--font-body-family)" }}>Your Own Link</p>
            <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>Share anywhere — social, WhatsApp, blog</p>
          </div>
          <div className="border border-gold/12 bg-charcoal/20 p-6 text-center">
            <Wallet size={20} className="text-gold mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[13px] text-cream mb-1" style={{ fontFamily: "var(--font-body-family)" }}>Real Payouts</p>
            <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>Tracked transparently in your account</p>
          </div>
        </div>

        <div className="max-w-[560px] mx-auto border border-gold/12 bg-charcoal/20 p-8">
          {!checked ? (
            <p className="text-[12px] text-muted text-center" style={{ fontFamily: "var(--font-body-family)" }}>Checking your account…</p>
          ) : !isSupabaseConfigured ? (
            <p className="text-[12px] text-muted text-center" style={{ fontFamily: "var(--font-body-family)" }}>
              Accounts aren&apos;t connected yet — the affiliate program needs Supabase configured.
            </p>
          ) : !signedIn ? (
            <div className="text-center">
              <p className="text-[13px] text-warm-gray mb-5" style={{ fontFamily: "var(--font-body-family)" }}>
                Sign in to generate your referral link and start earning.
              </p>
              <Link
                href="/account/login"
                className="inline-block text-[11px] text-obsidian bg-gold px-6 py-3 tracking-[0.15em] uppercase"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Sign In
              </Link>
            </div>
          ) : affiliate ? (
            <>
              <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5 flex items-center justify-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                <Share2 size={13} strokeWidth={1.5} /> Your Referral Link
              </p>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex-1 bg-charcoal border border-gold/18 text-cream text-[12px] px-3.5 py-2.5 truncate" style={{ fontFamily: "var(--font-body-family)" }}>
                  {referralLink}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-[0.15em] uppercase flex-shrink-0"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <Users size={14} className="text-gold/60 mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-[18px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>{affiliate.referrals}</p>
                  <p className="text-[9px] text-muted tracking-wider uppercase">Referred Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] text-gold" style={{ fontFamily: "var(--font-display-family)" }}>PKR {affiliate.pending.toLocaleString()}</p>
                  <p className="text-[9px] text-muted tracking-wider uppercase">Pending Payout</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>PKR {affiliate.paid.toLocaleString()}</p>
                  <p className="text-[9px] text-muted tracking-wider uppercase">Paid Out</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-[13px] text-warm-gray mb-5" style={{ fontFamily: "var(--font-body-family)" }}>
                Get your own referral link and earn a commission every time someone orders through it.
              </p>
              <button
                onClick={handleJoin}
                disabled={loading}
                className="inline-flex items-center gap-2 text-[11px] text-obsidian bg-gold px-6 py-3 tracking-[0.15em] uppercase disabled:opacity-50"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {loading ? "Loading…" : "Become an Affiliate"}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
