"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, ShoppingBag, AlertCircle, Tag, Check, Wallet, Gift } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStore, type PaymentMethod, type OrderCustomer, type Order } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import { pkrValueOfPoints, pointsEarnedFor } from "@/lib/loyalty";
import { REFERRAL_STORAGE_KEY } from "@/lib/affiliate";
import { PENDING_GIFT_CARD_KEY } from "@/lib/giftCardProduct";
import { useTranslate } from "@/lib/i18n";
import { trackBeginCheckout } from "@/lib/analytics";

function getStoredReferralCode(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (!raw) return undefined;
    const { code, expires } = JSON.parse(raw);
    return Date.now() < expires ? code : undefined;
  } catch {
    return undefined;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const { cart, cartTotal, placeOrder, distinctProductCount, tasterBundleDiscount } = useStore();
  const { currency } = useSettings();
  const t = useTranslate();

  const hasGiftCardItem = cart.some((item) => item.product.id.startsWith("gift-card-"));
  // COD only breaks down when the cart is gift cards and nothing else — a
  // gift card has no physical delivery point to collect cash at. Mixed with
  // a real product, the rider delivering that product can collect for the
  // whole order (gift card included), so COD stays available.
  const giftCardOnlyCart = hasGiftCardItem && cart.every((item) => item.product.id.startsWith("gift-card-"));

  const trackedCheckoutRef = useRef(false);
  useEffect(() => {
    if (trackedCheckoutRef.current || cart.length === 0) return;
    trackedCheckoutRef.current = true;
    trackBeginCheckout(
      cart.map((i) => ({ product: i.product, price: i.price, quantity: i.quantity })),
      cartTotal()
    );
  }, [cart, cartTotal]);

  const allPaymentOptions: { id: PaymentMethod; label: string; description: string; Icon: typeof Truck; disabled?: boolean }[] = [
    { id: "cod", label: t("cashOnDelivery"), description: t("payOnDelivery"), Icon: Truck },
    { id: "jazzcash", label: "JazzCash", description: "Scan the QR code or send to our Till ID", Icon: Wallet },
  ];
  const paymentOptions = allPaymentOptions.filter((opt) => opt.id !== "cod" || !giftCardOnlyCart);
  const [rawMethod, setMethod] = useState<PaymentMethod>("cod");
  const [showJazzCashModal, setShowJazzCashModal] = useState(false);
  const [showCodModal, setShowCodModal] = useState(false);
  const [codSameAddress, setCodSameAddress] = useState<boolean | null>(null);
  const [codAltAddress, setCodAltAddress] = useState("");
  const [form, setForm] = useState<OrderCustomer>({ name: "", email: "", phone: "", address: "", city: "", landmark: "" });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percentOff: number } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loyaltyBalance, setLoyaltyBalance] = useState<number | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [giftCardCodeInput, setGiftCardCodeInput] = useState("");
  const [giftCardApplying, setGiftCardApplying] = useState(false);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; balance: number } | null>(null);

  useEffect(() => {
    // Prefills from the signed-in customer's saved profile so returning
    // shoppers don't retype their shipping details on every order, and loads
    // their loyalty point balance so they can redeem it here.
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const [{ data: profile }, { data: ledger }] = await Promise.all([
        supabase.from("profiles").select("full_name, phone, address, city").eq("id", data.user.id).single(),
        supabase.from("loyalty_ledger").select("points").eq("user_id", data.user.id),
      ]);
      if (profile) {
        setForm((f) => ({
          ...f,
          name: f.name || profile.full_name || "",
          email: f.email || data.user.email || "",
          phone: f.phone || profile.phone || "",
          address: f.address || profile.address || "",
          city: f.city || profile.city || "",
        }));
      }
      setLoyaltyBalance((ledger ?? []).reduce((sum, r) => sum + r.points, 0));
    });
  }, []);

  const total = cartTotal();
  // Tasters always carry a PKR 250 delivery charge, no matter how many you
  // buy. The moment a full-size fragrance is in the cart (even alongside
  // tasters), shipping is free as usual.
  const tasterOnlyOrder = cart.length > 0 && cart.every((i) => i.product.isTaster);
  const shipping = tasterOnlyOrder ? 250 : 0;
  const couponDiscount = appliedCoupon ? Math.round((total * appliedCoupon.percentOff) / 100) : 0;
  // Auto taster bundle discount: 2 tasters = PKR 550 flat (saves 50 vs 600).
  const tasterAmount = tasterBundleDiscount();
  const promoDiscount = Math.max(couponDiscount, tasterAmount);
  const giftCardAmount = appliedGiftCard ? Math.min(appliedGiftCard.balance, Math.max(0, total - promoDiscount)) : 0;
  const maxRedeemable = Math.max(0, Math.min(loyaltyBalance ?? 0, total - promoDiscount - giftCardAmount));
  const loyaltyDiscount = pkrValueOfPoints(Math.min(pointsToRedeem, maxRedeemable));
  const discount = promoDiscount + giftCardAmount + loyaltyDiscount;
  const grandTotal = total + shipping - discount;
  const distinctCount = distinctProductCount();
  // A gift card can cover the whole order — no COD/JazzCash needed then, so
  // the payment method step is skipped entirely and replaced with a plain
  // "payment complete" confirmation.
  const giftCardCoversAll = giftCardAmount > 0 && grandTotal <= 0;
  const giftCardRemainingBalance = appliedGiftCard ? appliedGiftCard.balance - giftCardAmount : 0;

  const formValid = form.name && form.email && form.phone && form.address && form.city;

  // `method` is derived from the raw selection rather than stored directly so
  // constraint-driven overrides (gift card covers the order; cart is
  // gift-cards-only) apply instantly during render instead of flashing the
  // stale selection for a frame before an effect corrects it.
  const method: PaymentMethod = giftCardCoversAll
    ? "giftcard"
    : giftCardOnlyCart && rawMethod === "cod"
      ? "jazzcash"
      : rawMethod === "giftcard"
        ? "cod"
        : rawMethod;

  useEffect(() => {
    // Debounced abandoned-cart snapshot — only once there's a plausible
    // email and at least one item, so the hourly cron can follow up if the
    // customer never finishes checking out.
    if (!/^\S+@\S+\.\S+$/.test(form.email) || cart.length === 0) return;
    const id = setTimeout(() => {
      fetch("/api/abandoned-cart/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, items: cart, total: grandTotal }),
      }).catch(() => {});
    }, 2500);
    return () => clearTimeout(id);
  }, [form.email, cart, grandTotal]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: total }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error ?? "That coupon code isn't valid.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, percentOff: data.percentOff });
    } finally {
      setCouponApplying(false);
    }
  };

  const handleApplyGiftCard = async (codeOverride?: string) => {
    const code = (codeOverride ?? giftCardCodeInput).trim();
    if (!code) return;
    setGiftCardApplying(true);
    setGiftCardError(null);
    try {
      const res = await fetch("/api/gift-cards/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setGiftCardError(data.error ?? "That gift card code isn't valid.");
        setAppliedGiftCard(null);
        return;
      }
      setAppliedGiftCard({ code: data.code, balance: data.balance });
    } finally {
      setGiftCardApplying(false);
    }
  };

  useEffect(() => {
    // Carries the code over from the "Check a Gift Card" page's "Shop &
    // Redeem" button — without this, the customer has to remember and
    // retype a code they already typed once, and most people just don't.
    const pending = typeof window !== "undefined" ? localStorage.getItem(PENDING_GIFT_CARD_KEY) : null;
    if (!pending) return;
    localStorage.removeItem(PENDING_GIFT_CARD_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from localStorage on mount, not derived render state
    setGiftCardCodeInput(pending);
    handleApplyGiftCard(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistOrder = async (order: Order) => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
    } catch {
      // Best-effort sync to the admin panel — checkout already succeeded locally.
    }
    const redeemed = Math.min(pointsToRedeem, maxRedeemable);
    if (userId && redeemed > 0) {
      fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points: redeemed, orderId: order.id }),
      }).catch(() => {});
    }
    fetch("/api/abandoned-cart/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: order.customer.email }),
    }).catch(() => {});
  };

  const finishOrder = async (order: Order) => {
    await persistOrder(order);
    router.push(`/order-confirmation/${order.id}?email=${encodeURIComponent(order.customer.email)}`);
  };

  const submitOrder = async (customer: OrderCustomer = form) => {
    setError(null);
    setProcessing(true);
    try {
      // Both COD and JazzCash (manual QR/Till transfer) place the order
      // directly — there's no automated gateway to redirect to.
      const order = placeOrder(customer, method, discount, appliedCoupon?.code ?? undefined, appliedGiftCard?.code, giftCardAmount, getStoredReferralCode(), shipping);
      await finishOrder(order);
    } catch {
      setError("Something went wrong while processing payment. Please try again or choose Cash on Delivery.");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || cart.length === 0) return;
    // COD orders get a confirmation popup first, so the customer explicitly
    // confirms whether cash will be paid at the address they just typed in.
    if (method === "cod") {
      setCodSameAddress(null);
      setCodAltAddress("");
      setShowCodModal(true);
      return;
    }
    await submitOrder();
  };

  const confirmCodOrder = async () => {
    if (codSameAddress === null) return;
    if (codSameAddress === false && !codAltAddress.trim()) return;
    const finalCustomer = codSameAddress === false ? { ...form, address: codAltAddress.trim() } : form;
    if (codSameAddress === false) setForm((f) => ({ ...f, address: codAltAddress.trim() }));
    setShowCodModal(false);
    await submitOrder(finalCustomer);
  };

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <ShoppingBag size={32} className="text-warm-gray mx-auto mb-5" strokeWidth={1} />
            <p className="text-[15px] text-cream mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Your cart is empty</p>
            <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Add a fragrance before checking out.</p>
            <Link href="/collections" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
              Browse Fragrances
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-28 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>{t("checkout")}</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-12" style={{ fontFamily: "var(--font-display-family)" }}>
            {t("completeYourOrder")}
          </h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            {/* LEFT: form */}
            <div className="space-y-10">
              {/* Shipping details */}
              <div>
                <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5" style={{ fontFamily: "var(--font-body-family)" }}>{t("shippingDetails")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name" as const, label: t("fullName"), span: 2, required: true },
                    { key: "email" as const, label: t("email"), span: 1, required: true },
                    { key: "phone" as const, label: t("phone"), span: 1, required: true },
                    { key: "address" as const, label: t("address"), span: 2, required: true },
                    { key: "city" as const, label: t("city"), span: 1, required: true },
                    { key: "landmark" as const, label: t("landmark"), span: 1, required: false, placeholder: t("landmarkPlaceholder") },
                  ].map(({ key, label, span, required, placeholder }) => (
                    <div key={key} className={span === 2 ? "sm:col-span-2" : ""}>
                      <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                        {label}
                      </label>
                      <input
                        required={required}
                        type={key === "email" ? "email" : "text"}
                        value={form[key] ?? ""}
                        placeholder={placeholder}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div>
                {giftCardCoversAll ? (
                  <div className="border border-gold/25 bg-gold/5 p-5">
                    <p className="text-[13px] text-gold flex items-center gap-2 mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                      <Check size={15} strokeWidth={2} /> Payment Complete
                    </p>
                    <p className="text-[12px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                      PKR {giftCardAmount.toLocaleString()} has been deducted from your gift card ({appliedGiftCard?.code}).
                      {giftCardRemainingBalance > 0 && ` PKR ${giftCardRemainingBalance.toLocaleString()} balance remains on the card.`}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5" style={{ fontFamily: "var(--font-body-family)" }}>{t("paymentMethod")}</p>
                    {giftCardAmount > 0 && (
                      <p className="text-[12px] text-warm-gray leading-relaxed mb-4 p-3 border border-gold/15 bg-gold/5" style={{ fontFamily: "var(--font-body-family)" }}>
                        PKR {giftCardAmount.toLocaleString()} will be deducted from your gift card ({appliedGiftCard?.code}) — pay the remaining PKR {grandTotal.toLocaleString()} below.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {paymentOptions.map(({ id, label, description, Icon, disabled }) => (
                        <button
                          key={id}
                          type="button"
                          disabled={disabled}
                          aria-disabled={disabled}
                          onClick={() => { if (disabled) return; setMethod(id); setError(null); if (id === "jazzcash") setShowJazzCashModal(true); }}
                          className={`flex items-start gap-3 p-4 border text-left transition-all duration-300 ${
                            disabled
                              ? "border-gold/10 opacity-40 cursor-not-allowed"
                              : method === id
                              ? "border-gold/60 bg-gold/6"
                              : "border-gold/15 hover:border-gold/30"
                          }`}
                        >
                          <Icon size={16} strokeWidth={1.5} className={disabled ? "text-warm-gray/85" : method === id ? "text-gold" : "text-warm-gray"} />
                          <div>
                            <p className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{label}</p>
                            <p className="text-[10px] text-warm-gray/85 mt-0.5" style={{ fontFamily: "var(--font-body-family)" }}>{description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <AnimatePresence>
                  {method === "jazzcash" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 flex items-center gap-4 p-4 border border-gold/20 bg-charcoal/40"
                    >
                      <img
                        src="/jazzcash-qr.jpeg"
                        alt="JazzCash QR code"
                        className="w-24 h-24 object-contain border border-gold/15 bg-cream flex-shrink-0"
                      />
                      <div style={{ fontFamily: "var(--font-body-family)" }}>
                        <p className="text-[12px] text-cream">Scan the QR code with JazzCash to pay</p>
                        <p className="text-[11px] text-warm-gray/85 mt-1">Or send to Till ID: <span className="text-gold">984002990</span></p>
                        <p className="text-[10px] text-warm-gray/85 mt-2">
                          After paying, WhatsApp your payment screenshot to{" "}
                          <a href="https://wa.me/923252106239" target="_blank" rel="noopener noreferrer" className="text-gold underline">0325-2106239</a>. Order ships only after we verify it.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowJazzCashModal(true)}
                          className="text-[10px] text-gold border border-gold/30 px-3 py-1.5 mt-3 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                        >
                          View QR Code
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showJazzCashModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                      onClick={() => setShowJazzCashModal(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gold/25 bg-charcoal p-8 flex flex-col sm:flex-row gap-8"
                      >
                        <button
                          type="button"
                          onClick={() => setShowJazzCashModal(false)}
                          aria-label="Close"
                          className="absolute top-4 right-4 text-warm-gray/85 hover:text-cream text-2xl leading-none"
                        >
                          ✕
                        </button>

                        <div className="flex-shrink-0 mx-auto sm:mx-0 text-center">
                          <p className="text-[15px] text-gold tracking-[0.2em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                            Pay via JazzCash
                          </p>
                          <img
                            src="/jazzcash-qr.jpeg"
                            alt="JazzCash QR code"
                            className="w-full max-w-[300px] mx-auto object-contain border border-gold/15 bg-cream"
                          />
                          <p className="text-[16px] text-cream mt-4" style={{ fontFamily: "var(--font-body-family)" }}>
                            Scan with the JazzCash app to pay
                          </p>
                          <p className="text-[15px] text-warm-gray/85 mt-1" style={{ fontFamily: "var(--font-body-family)" }}>
                            Or send to Till ID: <span className="text-gold font-semibold">984002990</span>
                          </p>
                        </div>

                        <div className="flex-1 flex flex-col justify-center text-left border-t sm:border-t-0 sm:border-l border-gold/15 pt-6 sm:pt-0 sm:pl-8">
                          <p className="text-[13px] text-warm-gray/85 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                            Send payment screenshot on WhatsApp
                          </p>
                          <a
                            href="https://wa.me/923252106239"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[26px] text-gold font-semibold underline mt-1 inline-block"
                          >
                            0325-2106239
                          </a>

                          <div className="mt-5 p-4 border border-gold/20 bg-gold/5">
                            <p className="text-[15px] leading-relaxed text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                              After paying, WhatsApp your payment screenshot to the number above. Your order will be dispatched only after the payment is verified. Your payment will be confirmed right away, and we&apos;ll call you back within 5 minutes to confirm your payment and get your order dispatched.
                            </p>
                            <div className="my-3 border-t border-gold/15" />
                            <p className="text-[15px] leading-loose text-cream" dir="rtl" style={{ fontFamily: "var(--font-body-family)" }}>
                              پیمنٹ کرنے کے بعد اپنی پیمنٹ کی اسکرین شاٹ اوپر دیے گئے واٹس ایپ نمبر پر بھیج دیں۔ پیمنٹ ویریفائی ہونے کے بعد ہی پروڈکٹ ڈسپیچ کیا جائے گا۔ آپ کی پیمنٹ فوراً کنفرم کر کے 5 منٹ میں آپ کو کال بیک کی جائے گی، پیمنٹ کی تصدیق اور آرڈر ڈسپیچ کے لیے۔
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setShowJazzCashModal(false)}
                            className="self-start text-[13px] text-gold border border-gold/30 px-6 py-2.5 mt-6 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showCodModal && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                      onClick={() => setShowCodModal(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-md border border-gold/25 bg-charcoal p-8"
                      >
                        <button
                          type="button"
                          onClick={() => setShowCodModal(false)}
                          aria-label="Close"
                          className="absolute top-4 right-4 text-warm-gray/85 hover:text-cream text-2xl leading-none"
                        >
                          ✕
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                          <Truck size={20} strokeWidth={1.5} className="text-gold flex-shrink-0" />
                          <p className="text-[15px] text-gold tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                            {t("confirmCodTitle")}
                          </p>
                        </div>

                        <p className="text-[14px] text-cream leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                          {t("confirmCodQuestion")}
                        </p>
                        <p className="text-[13px] leading-loose text-warm-gray mt-1" dir="rtl" style={{ fontFamily: "var(--font-body-family)" }}>
                          جو پتہ آپ نے پہلے دیا ہے وہ بالکل ٹھیک ہے؟ کیا اسی پتے پر کیش ادائیگی وصول کی جائے گی؟
                        </p>

                        <div className="mt-4 p-4 border border-gold/20 bg-gold/5 text-[13px] text-cream leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                          <p>{form.address}{form.landmark ? `, ${form.landmark}` : ""}</p>
                          <p className="text-warm-gray mt-0.5">{form.city}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-5">
                          <button
                            type="button"
                            onClick={() => setCodSameAddress(true)}
                            className={`p-3.5 border text-center transition-all duration-200 ${
                              codSameAddress === true ? "border-gold/60 bg-gold/6" : "border-gold/15 hover:border-gold/30"
                            }`}
                          >
                            <p className={`text-[12px] ${codSameAddress === true ? "text-gold" : "text-cream"}`} style={{ fontFamily: "var(--font-body-family)" }}>
                              {t("confirmCodYes")}
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCodSameAddress(false)}
                            className={`p-3.5 border text-center transition-all duration-200 ${
                              codSameAddress === false ? "border-gold/60 bg-gold/6" : "border-gold/15 hover:border-gold/30"
                            }`}
                          >
                            <p className={`text-[12px] ${codSameAddress === false ? "text-gold" : "text-cream"}`} style={{ fontFamily: "var(--font-body-family)" }}>
                              {t("confirmCodDifferent")}
                            </p>
                          </button>
                        </div>

                        <AnimatePresence>
                          {codSameAddress === false && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mt-4 mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                                {t("confirmCodAltAddressLabel")}
                              </label>
                              <input
                                autoFocus
                                type="text"
                                value={codAltAddress}
                                onChange={(e) => setCodAltAddress(e.target.value)}
                                placeholder={t("confirmCodAltAddressPlaceholder")}
                                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                                style={{ fontFamily: "var(--font-body-family)" }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <button
                          type="button"
                          disabled={processing || codSameAddress === null || (codSameAddress === false && !codAltAddress.trim())}
                          onClick={confirmCodOrder}
                          className="w-full text-[12px] text-obsidian bg-gold px-5 py-3 mt-6 tracking-wider uppercase hover:bg-gold/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {t("confirmCodContinue")}
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 flex items-start gap-2.5 p-3.5 border border-red-500/30 bg-red-500/5 text-red-300 text-[12px]"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT: order summary */}
            <div className="h-fit border border-gold/15 bg-charcoal/30 p-6">
              <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-5" style={{ fontFamily: "var(--font-body-family)" }}>{t("orderSummary")}</p>
              <div className="space-y-3 mb-5 max-h-[280px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.giftWrap}-${item.engrave}`} className="flex justify-between text-[12px]" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className="text-warm-gray">
                      {item.giftCardRecipient ? (
                        <>
                          {item.product.name}
                          <span className="block text-[9px] text-gold/70 mt-0.5">{t("forRecipient").replace("{email}", item.giftCardRecipient.email)}</span>
                        </>
                      ) : (
                        <>
                          {item.product.name} × {item.quantity} <span className="text-warm-gray/85">({item.size}ml)</span>
                          {(item.giftWrap || item.engrave) && (
                            <span className="block text-[9px] text-gold/70 mt-0.5">
                              {[item.giftWrap && t("giftWrapped"), item.engrave && t("engraved")].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </>
                      )}
                    </span>
                    <span className="text-cream flex-shrink-0 ml-2">PKR {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {/* Coupon */}
              <div className="pt-4 border-t border-gold/10">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between text-[11px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className="flex items-center gap-1.5"><Check size={12} strokeWidth={2} /> {appliedCoupon.code} applied — {appliedCoupon.percentOff}% off</span>
                    <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-warm-gray/85 hover:text-warm-gray underline">{t("remove")}</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-gold/18 px-3 bg-charcoal">
                      <Tag size={12} strokeWidth={1.5} className="text-gold/50 flex-shrink-0" />
                      <input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder={t("couponCode")}
                        className="w-full bg-transparent text-cream text-[12px] py-2.5 outline-none placeholder:text-muted/50"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponApplying || !couponCode.trim()}
                      className="text-[10px] text-gold border border-gold/30 px-4 tracking-wider uppercase hover:bg-gold/10 transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {couponApplying ? t("loading") : t("apply")}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-300 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>{couponError}</p>
                )}
                {!appliedCoupon && tasterOnlyOrder && tasterAmount === 0 && (
                  <p className="text-[11px] text-gold mt-2" style={{ fontFamily: "var(--font-body-family)" }}>
                    Add another taster to get 2 for PKR 550 (save PKR 50)
                  </p>
                )}
              </div>

              {/* Gift card */}
              <div className="pt-4 border-t border-gold/10">
                {appliedGiftCard ? (
                  <div className="flex items-center justify-between text-[11px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className="flex items-center gap-1.5">
                      <Check size={12} strokeWidth={2} /> {appliedGiftCard.code} applied — PKR {appliedGiftCard.balance.toLocaleString()} balance
                    </span>
                    <button type="button" onClick={() => { setAppliedGiftCard(null); setGiftCardCodeInput(""); }} className="text-warm-gray/85 hover:text-warm-gray underline">{t("remove")}</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 border border-gold/18 px-3 bg-charcoal">
                      <Gift size={12} strokeWidth={1.5} className="text-gold/50 flex-shrink-0" />
                      <input
                        value={giftCardCodeInput}
                        onChange={(e) => setGiftCardCodeInput(e.target.value)}
                        placeholder={t("giftCardCode")}
                        className="w-full bg-transparent text-cream text-[12px] py-2.5 outline-none placeholder:text-muted/50"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyGiftCard()}
                      disabled={giftCardApplying || !giftCardCodeInput.trim()}
                      className="text-[10px] text-gold border border-gold/30 px-4 tracking-wider uppercase hover:bg-gold/10 transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {giftCardApplying ? t("loading") : t("apply")}
                    </button>
                  </div>
                )}
                {giftCardError && (
                  <p className="text-[11px] text-red-300 mt-2" style={{ fontFamily: "var(--font-body-family)" }}>{giftCardError}</p>
                )}
              </div>

              {/* Loyalty points */}
              {userId && loyaltyBalance !== null && loyaltyBalance > 0 && (
                <div className="pt-4 border-t border-gold/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                      {t("loyaltyPointsAvailable").replace("{n}", String(loyaltyBalance))}
                    </span>
                    {pointsToRedeem > 0 && (
                      <button type="button" onClick={() => setPointsToRedeem(0)} className="text-[10px] text-warm-gray/85 hover:text-warm-gray underline" style={{ fontFamily: "var(--font-body-family)" }}>
                        {t("remove")}
                      </button>
                    )}
                  </div>
                  {pointsToRedeem > 0 ? (
                    <div className="flex items-center justify-between text-[11px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                      <span className="flex items-center gap-1.5"><Check size={12} strokeWidth={2} /> {t("redeemingPoints").replace("{n}", String(Math.min(pointsToRedeem, maxRedeemable)))}</span>
                      <span>− PKR {loyaltyDiscount.toLocaleString()}</span>
                    </div>
                  ) : maxRedeemable > 0 ? (
                    <button
                      type="button"
                      onClick={() => setPointsToRedeem(maxRedeemable)}
                      className="text-[10px] text-gold border border-gold/30 px-4 py-2 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {t("usePointsOff").replace(/\{n\}/g, String(maxRedeemable))}
                    </button>
                  ) : (
                    <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>{t("orderFullyDiscounted")}</p>
                  )}
                </div>
              )}

              <div className="space-y-2.5 pt-4 border-t border-gold/10 text-[12px]" style={{ fontFamily: "var(--font-body-family)" }}>
                <div className="flex justify-between text-warm-gray">
                  <span>{t("subtotal")}</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>{appliedCoupon ? `${t("couponCode")} (${appliedCoupon?.percentOff}%)` : "Taster Bundle Discount"}</span>
                    <span>− PKR {promoDiscount.toLocaleString()}</span>
                  </div>
                )}
                {giftCardAmount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>{t("giftCard")}</span>
                    <span>− PKR {giftCardAmount.toLocaleString()}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>{t("loyaltyPoints")}</span>
                    <span>− PKR {loyaltyDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-warm-gray">
                  <span>{t("shipping")}</span>
                  <span>{shipping > 0 ? `PKR ${shipping.toLocaleString()} · 3–5 business days` : t("freeDays")}</span>
                </div>
                <div className="flex justify-between text-[15px] text-gold pt-3 mt-2 border-t border-gold/10">
                  <span>{t("total")}</span>
                  <span>PKR {grandTotal.toLocaleString()}</span>
                </div>
                {currency !== "PKR" && (
                  <p className="text-[10px] text-warm-gray/85 pt-1" style={{ fontFamily: "var(--font-body-family)" }}>
                    Charged as PKR {grandTotal.toLocaleString()} (~{formatPrice(grandTotal, currency)}). Card payments are billed in PKR regardless of display currency.
                  </p>
                )}
                {userId && pointsEarnedFor(grandTotal) > 0 && (
                  <p className="text-[10px] text-gold/70 pt-1" style={{ fontFamily: "var(--font-body-family)" }}>
                    You&apos;ll earn {pointsEarnedFor(grandTotal)} loyalty points from this order.
                  </p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={!formValid || processing}
                className="w-full mt-6 py-4 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{ fontFamily: "var(--font-body-family)" }}
                whileHover={formValid && !processing ? { scale: 1.01 } : {}}
                whileTap={formValid && !processing ? { scale: 0.98 } : {}}
              >
                {processing ? t("processing") : giftCardCoversAll ? t("placeOrder") : `${t("placeOrder")} — PKR ${grandTotal.toLocaleString()}`}
              </motion.button>
              <p className="text-[10px] text-warm-gray/85 text-center mt-3" style={{ fontFamily: "var(--font-body-family)" }}>
                Every order arrives in signature PakAuraa luxury packaging.
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
