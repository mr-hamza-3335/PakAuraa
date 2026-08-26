"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { User as UserIcon, Package, LogOut, ShoppingBag, ShieldCheck, FileDown, Heart, Save, Gem, Share2, Copy, Check } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore, type Order } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";
import { useCatalog } from "@/lib/catalog.client";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useTranslate } from "@/lib/i18n";

interface ProfileForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

const blankProfile: ProfileForm = { fullName: "", phone: "", address: "", city: "" };

export default function AccountPage() {
  const { orders: localOrders, wishlist } = useStore();
  const { currency } = useSettings();
  const catalog = useCatalog();
  const t = useTranslate();
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [accountOrders, setAccountOrders] = useState<Order[] | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<ProfileForm>(blankProfile);
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [affiliate, setAffiliate] = useState<{ code: string; commissionRate: number; pending: number; available: number; paid: number; cancelled: number; referrals: number; commissionHistory: any[] } | null>(null);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const wishlistItems = catalog.filter((p) => wishlist.includes(p.id)).slice(0, 4);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      // No backend configured — nothing to await, so this is an
      // immediate synchronous fallback rather than a real fetch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(true);
      return;
    }
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      setChecked(true);
      if (data.user) {
        const { data: profileRow } = await supabase
          .from("profiles")
          .select("role, full_name, phone, address, city")
          .eq("id", data.user.id)
          .single();
        setIsAdmin(profileRow?.role === "admin");
        setProfile({
          fullName: profileRow?.full_name ?? "",
          phone: profileRow?.phone ?? "",
          address: profileRow?.address ?? "",
          city: profileRow?.city ?? "",
        });

        // Only "earned" points count toward spendable balance. "pending" points
        // (earned on unpaid orders) and "redeemed" / "adjustment" rows are excluded
        // from the displayed total.
        const { data: ledger } = await supabase
          .from("loyalty_ledger")
          .select("points, reason")
          .eq("user_id", data.user.id);
        const available = (ledger ?? [])
          .filter((r) => r.reason === "earned")
          .reduce((sum, r) => sum + r.points, 0);
        setLoyaltyBalance(available);

        fetch("/api/affiliate/stats")
          .then((res) => res.json())
          .then((body) => setAffiliate(body.affiliate))
          .catch(() => {});

        const { data: rows } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false });
        setAccountOrders(
          (rows ?? []).map((r) => ({
            id: r.id,
            items: r.items,
            total: r.total,
            paymentMethod: r.payment_method,
            status: r.status,
            customer: r.customer,
            createdAt: r.created_at,
          }))
        );
      }
    });
  }, []);

  // Signed-in accounts see their real order history from Supabase (synced
  // across devices); guests/unconfigured fall back to this browser's local orders.
  const orders = accountOrders ?? localOrders;

  const handleSignOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleProfileSave = async () => {
    const supabase = createClient();
    if (!supabase || !user) return;
    setProfileSaving(true);
    setProfileSaved(false);
    await supabase
      .from("profiles")
      .update({ full_name: profile.fullName, phone: profile.phone, address: profile.address, city: profile.city })
      .eq("id", user.id);
    setProfileSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleJoinAffiliate = async () => {
    setAffiliateLoading(true);
    try {
      const res = await fetch("/api/affiliate/join", { method: "POST" });
      const body = await res.json();
      if (res.ok) setAffiliate({ code: body.code, commissionRate: 0.1, pending: 0, available: 0, paid: 0, cancelled: 0, referrals: 0, commissionHistory: [] });
    } finally {
      setAffiliateLoading(false);
    }
  };

  const referralLink = affiliate && typeof window !== "undefined" ? `${window.location.origin}?ref=${affiliate.code}` : "";

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Account</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-10" style={{ fontFamily: "var(--font-display-family)" }}>
            {t("myAccount")}
          </h1>

          {/* Identity card */}
          <div className="border border-gold/15 bg-charcoal/30 p-6 mb-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-gold/25 flex items-center justify-center flex-shrink-0">
                <UserIcon size={18} className="text-gold" strokeWidth={1.5} />
              </div>
              <div>
                {isSupabaseConfigured && user ? (
                  <>
                    <p className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{user.user_metadata?.full_name ?? "Welcome back"}</p>
                    <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>{user.email}</p>
                  </>
                ) : isSupabaseConfigured && checked ? (
                  <>
                    <p className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>You&apos;re not signed in</p>
                    <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Sign in to sync your orders across devices.</p>
                  </>
                ) : (
                  <>
                    <p className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>Guest</p>
                    <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Accounts aren&apos;t connected yet — orders below are saved on this device.</p>
                  </>
                )}
              </div>
            </div>
            {isSupabaseConfigured && (
              user ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-[0.15em] uppercase hover:bg-gold-light transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      <ShieldCheck size={13} strokeWidth={1.5} /> Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-[10px] text-warm-gray hover:text-gold tracking-[0.15em] uppercase border border-gold/20 px-4 py-2.5 hover:border-gold/40 transition-colors"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    <LogOut size={13} strokeWidth={1.5} /> {t("signOut")}
                  </button>
                </div>
              ) : (
                <Link
                  href="/account/login"
                  className="text-[10px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {t("signIn")}
                </Link>
              )
            )}
          </div>

          {/* Loyalty balance */}
          {user && loyaltyBalance !== null && (
            <div className="border border-gold/15 bg-gold/[0.04] p-5 mb-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center flex-shrink-0">
                <Gem size={16} className="text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[16px] text-gold" style={{ fontFamily: "var(--font-display-family)" }}>{loyaltyBalance} Points</p>
                <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                  Worth PKR {loyaltyBalance.toLocaleString()} — redeemable at checkout. Earn 1 point per PKR 200 spent.
                </p>
              </div>
            </div>
          )}

          {/* Refer & Earn */}
          {user && (
            <div className="border border-gold/12 bg-charcoal/20 p-6 mb-10">
              <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                <Share2 size={13} strokeWidth={1.5} /> {t("referAndEarn")}
              </p>
              {affiliate ? (
                <>
                  <p className="text-[12px] text-warm-gray mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                    Share your link — earn {Math.round(affiliate.commissionRate * 100)}% commission on every order it brings in.
                  </p>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex-1 bg-charcoal border border-gold/18 text-cream text-[12px] px-3.5 py-2.5 truncate" style={{ fontFamily: "var(--font-body-family)" }}>
                      {referralLink}
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1.5 text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-[0.15em] uppercase flex-shrink-0"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.5} />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[18px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>{affiliate.referrals}</p>
                      <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase">Referred Orders</p>
                    </div>
                    <div>
                      <p className="text-[18px] text-gold" style={{ fontFamily: "var(--font-display-family)" }}>PKR {affiliate.available.toLocaleString()}</p>
                      <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase">Available to Withdraw</p>
                    </div>
                    <div>
                      <p className="text-[18px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>PKR {affiliate.paid.toLocaleString()}</p>
                      <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase">Paid Out</p>
                    </div>
                  </div>
                  {affiliate.pending > 0 && (
                    <p className="text-[10px] text-warm-gray/85 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>
                      PKR {affiliate.pending.toLocaleString()} in 10-day hold (commissions clear 10 days after order delivery).
                    </p>
                  )}
                  {affiliate.cancelled > 0 && (
                    <p className="text-[10px] text-red-300 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>
                      PKR {affiliate.cancelled.toLocaleString()} reversed (customer returned the product).
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-[12px] text-warm-gray mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                    Get your own referral link and earn a commission every time someone orders through it.
                  </p>
                  <button
                    onClick={handleJoinAffiliate}
                    disabled={affiliateLoading}
                    className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase disabled:opacity-50"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {affiliateLoading ? t("loading") : t("becomeAffiliate")}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Profile & default shipping address */}
          {user && (
            <div className="border border-gold/12 bg-charcoal/20 p-6 mb-10">
              <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                <UserIcon size={13} strokeWidth={1.5} /> Profile &amp; Default Shipping Address
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Full Name</label>
                  <input
                    className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Phone</label>
                  <input
                    className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Address</label>
                  <input
                    className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>City</label>
                  <input
                    className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
              </div>
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase disabled:opacity-50"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <Save size={13} strokeWidth={2} /> {profileSaving ? t("saving") : profileSaved ? t("saved") : t("saveChanges")}
              </button>
              <p className="text-[11px] text-warm-gray/85 mt-3" style={{ fontFamily: "var(--font-body-family)" }}>
                This address auto-fills at checkout so you don&apos;t have to retype it every time.
              </p>
            </div>
          )}

          {/* Wishlist preview */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] text-gold tracking-[0.25em] uppercase flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                <Heart size={13} strokeWidth={1.5} /> Wishlist
              </p>
              {wishlist.length > 0 && (
                <Link href="/wishlist" className="text-[10px] text-gold hover:text-gold-light tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                  View All ({wishlist.length})
                </Link>
              )}
            </div>
            {wishlistItems.length === 0 ? (
              <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                Nothing saved yet — tap the heart on any fragrance to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {wishlistItems.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} className={`block aspect-square relative border border-gold/12 overflow-hidden ${p.gradient}`}>
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="150px" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Order history */}
          <div>
            <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
              <Package size={13} strokeWidth={1.5} /> {t("orderHistory")}
            </p>

            {orders.length === 0 ? (
              <div className="py-16 text-center border border-gold/10 bg-charcoal/20">
                <ShoppingBag size={22} className="text-warm-gray/40 mx-auto mb-4" strokeWidth={1} />
                <p className="text-[13px] text-warm-gray mb-4" style={{ fontFamily: "var(--font-body-family)" }}>{t("noOrdersYet")}</p>
                <Link href="/collections" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
                  {t("browseFragrances")}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gold/12 bg-charcoal/20 p-5"
                  >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <span className="text-[12px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>{order.id}</span>
                      <span className="text-[9px] text-warm-gray uppercase tracking-wider border border-gold/20 px-2.5 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {order.items.map((item) => (
                        <p key={`${item.product.id}-${item.size}`} className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                          {item.product.name} × {item.quantity} ({item.size}ml)
                        </p>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                      <span className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        <a
                          href={`/api/orders/${order.id}/invoice?email=${encodeURIComponent(order.customer.email)}`}
                          className="flex items-center gap-1.5 text-[10px] text-gold hover:text-gold-light tracking-wider uppercase transition-colors"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          <FileDown size={12} strokeWidth={1.5} /> Invoice
                        </a>
                        {order.status === "delivered" && (() => {
                          const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
                          const now = new Date();
                          const daysSince = deliveredAt ? (now.getTime() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24) : 999;
                          const remaining = 7 - Math.floor(daysSince);
                          return remaining > 0 ? (
                            <a
                              href={`/returns/${order.id}`}
                              className="flex items-center gap-1.5 text-[10px] text-warm-gray hover:text-gold tracking-wider uppercase transition-colors"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            >
                              Return ({remaining}d left)
                            </a>
                          ) : null;
                        })()}
                        <span className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatPrice(order.total, currency)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
