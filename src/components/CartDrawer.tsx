"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, PackagePlus } from "lucide-react";
import { useStore, BUNDLE_MIN_ITEMS } from "@/lib/store";
import { useSettings, formatPrice } from "@/lib/settings";
import { useTranslate } from "@/lib/i18n";

function BottleArt({ gradient }: { gradient: string }) {
  return (
    <div className={`w-full h-full flex items-center justify-center ${gradient}`}>
      <div className="relative">
        <div className="w-[24px] h-[50px] rounded-[8px_8px_4px_4px] bg-gradient-to-b from-[#c9a84c22] to-[#c9a84c08] border border-gold/20" />
        <div className="absolute bottom-[50px] left-1/2 -translate-x-1/2 w-[7px] h-[14px] bg-gradient-to-b from-[#c9a84c15] to-transparent border-x border-gold/10" />
        <div className="absolute bottom-[62px] left-1/2 -translate-x-1/2 w-[13px] h-[8px] rounded-sm bg-gradient-to-b from-gold to-gold-deep" />
      </div>
    </div>
  );
}

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal, distinctProductCount, bundleDiscount } =
    useStore();
  const { currency } = useSettings();
  const t = useTranslate();

  const total = cartTotal();
  const distinctCount = distinctProductCount();
  const discount = bundleDiscount();

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-obsidian/70 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-[420px] bg-[#0d0d0d] border-l border-gold/15 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} strokeWidth={1.5} className="text-gold" />
                <span
                  className="text-[11px] text-cream tracking-[0.2em] uppercase"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {t("yourCart")}
                </span>
                {cart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-[9px] text-gold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <motion.button
                onClick={() => setCartOpen(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="text-warm-gray hover:text-gold transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </motion.button>
            </div>

            {/* Free shipping notice */}
            {total > 0 && (
              <div className="px-6 py-3 bg-gold/5 border-b border-gold/10">
                <p className="text-[11px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                  ✓ {t("freeShippingNote")}
                </p>
              </div>
            )}

            {/* Bundle discount progress */}
            {total > 0 && (
              <div className="px-6 py-3 bg-gold/[0.03] border-b border-gold/10 flex items-center gap-2.5">
                <PackagePlus size={14} className="text-gold flex-shrink-0" strokeWidth={1.5} />
                <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                  {discount > 0
                    ? <span className="text-gold">{t("bundleAppliedNote")}</span>
                    : t("bundleUnlockHint").replace("{n}", String(BUNDLE_MIN_ITEMS - distinctCount))}
                </p>
              </div>
            )}

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
                  <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center">
                    <ShoppingBag size={24} strokeWidth={1} className="text-warm-gray" />
                  </div>
                  <p className="text-[14px] text-warm-gray text-center" style={{ fontFamily: "var(--font-body-family)" }}>
                    {t("cartEmpty")}
                  </p>
                  <motion.button
                    onClick={() => setCartOpen(false)}
                    className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5"
                    style={{ fontFamily: "var(--font-body-family)" }}
                    whileHover={{ x: 3 }}
                  >
                    {t("continueShopping")}
                  </motion.button>
                </div>
              ) : (
                <div className="divide-y divide-gold/10">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.06 }}
                      className="flex gap-4 p-6"
                    >
                      {/* Product image */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border border-gold/15">
                        <BottleArt gradient={item.product.gradient} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] text-gold tracking-[0.2em] uppercase mb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          {item.product.collection}
                        </p>
                        <p className="font-elegant text-[15px] text-cream leading-tight mb-1 truncate" style={{ fontFamily: "var(--font-elegant-family)" }}>
                          {item.product.name}
                        </p>
                        <div className="mb-3">
                          {item.giftCardRecipient ? (
                            <p className="text-[10px] text-gold/70 tracking-wide" style={{ fontFamily: "var(--font-body-family)" }}>
                              {t("giftCardFor").replace("{email}", item.giftCardRecipient.email)}
                            </p>
                          ) : (
                            <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                              {item.size}ml
                            </p>
                          )}
                          {(item.giftWrap || item.engrave) && (
                            <p className="text-[9px] text-gold/70 tracking-wide" style={{ fontFamily: "var(--font-body-family)" }}>
                              {[item.giftWrap && t("giftWrapped"), item.engrave && t("engraved")].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Qty controls */}
                          <div className="flex items-center border border-gold/20">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-warm-gray hover:text-gold transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-7 text-center text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-warm-gray hover:text-gold transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                              {formatPrice(item.price * item.quantity, currency)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.product.id, item.size)}
                              className="text-muted hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={13} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gold/10 px-6 py-5 space-y-4">
                {/* Order summary */}
                <div className="flex justify-between items-center">
                  <span className="text-[12px] text-warm-gray tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
                    {t("subtotal")}
                  </span>
                  <span className="text-[15px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>
                    {formatPrice(total, currency)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-gold tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
                      {t("bundleDiscount")} (10%)
                    </span>
                    <span className="text-[13px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                      −{formatPrice(discount, currency)}
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
                  {t("shippingTaxesAtCheckout")}
                </p>

                {/* Checkout CTA */}
                <motion.a
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[11px] tracking-[0.2em] uppercase py-4 font-medium"
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={{ boxShadow: "0 8px 32px rgba(201,168,76,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCartOpen(false)}
                >
                  {t("proceedToCheckout")}
                  <ArrowRight size={13} strokeWidth={2} className="rtl:rotate-180" />
                </motion.a>

                <motion.button
                  onClick={() => setCartOpen(false)}
                  className="w-full border border-gold/25 text-cream text-[11px] tracking-[0.2em] uppercase py-3 hover:border-gold/50 transition-colors"
                  style={{ fontFamily: "var(--font-body-family)" }}
                  whileHover={{ backgroundColor: "rgba(201,168,76,0.05)" }}
                >
                  {t("continueShopping")}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
