"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, PackageSearch, MessageCircle, FileDown, Gift, Share2 } from "lucide-react";
import { useStore, type Order } from "@/lib/store";
import { whatsAppLink } from "@/components/WhatsAppWidget";
import GiftCardShareCard, { type ShareableGiftCard } from "@/components/GiftCardShareCard";
import type { IssuedGiftCard } from "@/lib/orders.server";

export default function OrderConfirmationClient({
  orderId,
  initialOrder,
  giftCards = [],
}: {
  orderId: string;
  initialOrder: Order | null;
  giftCards?: IssuedGiftCard[];
}) {
  const localOrders = useStore((s) => s.orders);
  const order = initialOrder ?? localOrders.find((o) => o.id === orderId) ?? null;
  const [shareCard, setShareCard] = useState<ShareableGiftCard | null>(null);
  // Gift cards aren't shipped or delivered — nothing for /track to show —
  // so a cart made up entirely of gift cards skips the Track Order button.
  const isGiftCardOnlyOrder = !!order && order.items.every((item) => item.product.id.startsWith("gift-card-"));

  if (!order) {
    return (
      <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[440px] w-full text-center">
          <PackageSearch size={32} className="text-warm-gray mx-auto mb-5" strokeWidth={1} />
          <h1 className="font-display text-[24px] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>
            Order Not Found
          </h1>
          <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
            We couldn&apos;t find order <span className="text-gold">{orderId}</span> for that email. Use Track Order with your order ID and email to look it up.
          </p>
          <Link href="/track" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
            Track an Order
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[520px] w-full text-center border border-gold/15 bg-charcoal/40 p-10"
      >
        <CheckCircle2 size={40} className="text-gold mx-auto mb-6" strokeWidth={1.2} />
        <p className="text-[10px] text-gold tracking-[0.3em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
          Order Confirmed
        </p>
        <h1 className="font-display text-[28px] text-cream mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
          Thank you, {order.customer.name.split(" ")[0]}
        </h1>
        <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
          Your order <span className="text-gold">{order.id}</span> has been placed
          {order.paymentMethod === "giftcard"
            ? " and is fully paid."
            : (order.giftCardAmount ?? 0) > 0
            ? " — see the payment breakdown below."
            : order.paymentMethod === "cod"
            ? " — pay on delivery."
            : "."}{" "}
          A confirmation has been noted for {order.customer.email}.
        </p>
        <div className="text-left border-t border-gold/10 pt-5 mb-8">
          {order.items.map((item) => (
            <div key={`${item.product.id}-${item.size}-${item.giftWrap}-${item.engrave}`} className="flex justify-between text-[12px] text-warm-gray py-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
              <span>
                {item.product.name} × {item.quantity} ({item.size}ml)
                {(item.giftWrap || item.engrave) && (
                  <span className="block text-[9px] text-gold/70">
                    {[item.giftWrap && "Gift Wrapped", item.engrave && "Engraved"].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span className="text-cream">PKR {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          {(order.giftCardAmount ?? 0) > 0 && (
            <div className="flex justify-between text-[12px] text-gold py-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
              <span>Gift Card{order.giftCardCode ? ` (${order.giftCardCode})` : ""}</span>
              <span>− PKR {(order.giftCardAmount ?? 0).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] text-gold pt-3 mt-2 border-t border-gold/10" style={{ fontFamily: "var(--font-body-family)" }}>
            <span>{order.paymentMethod === "giftcard" ? "Total Paid" : "Total Due"}</span>
            <span>PKR {order.total.toLocaleString()}</span>
          </div>
          {order.paymentMethod === "giftcard" && (
            <p className="text-[11px] text-[#7FA888] mt-2" style={{ fontFamily: "var(--font-body-family)" }}>Fully paid — no further payment needed.</p>
          )}
          {order.paymentMethod === "cod" && (order.giftCardAmount ?? 0) > 0 && (
            <p className="text-[11px] text-warm-gray mt-2" style={{ fontFamily: "var(--font-body-family)" }}>To be paid on delivery.</p>
          )}
          {order.paymentMethod === "jazzcash" && (order.giftCardAmount ?? 0) > 0 && (
            <p className="text-[11px] text-warm-gray mt-2" style={{ fontFamily: "var(--font-body-family)" }}>To be paid via JazzCash.</p>
          )}
        </div>

        {giftCards.length > 0 && (
          <div className="text-left border border-gold/15 bg-gold/5 p-5 mb-8 space-y-3">
            <p className="text-[10px] text-gold tracking-[0.2em] uppercase flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
              <Gift size={13} strokeWidth={1.5} /> {giftCards.length > 1 ? "Your Gift Cards Are Ready" : "Your Gift Card Is Ready"}
            </p>
            <p className="text-[12px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
              We&apos;ve emailed the code{giftCards.length > 1 ? "s" : ""} to the recipient — you can also download or share
              {giftCards.length > 1 ? " them" : " it"} yourself below.
            </p>
            <div className="space-y-2">
              {giftCards.map((gc) => (
                <div key={gc.code} className="flex items-center justify-between gap-3 border border-gold/10 px-3 py-2.5">
                  <div>
                    <span className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{gc.code}</span>
                    <span className="text-[11px] text-warm-gray/85 ml-2" style={{ fontFamily: "var(--font-body-family)" }}>PKR {gc.initialAmount.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() =>
                      setShareCard({
                        code: gc.code,
                        amount: gc.initialAmount,
                        recipientName: gc.recipientName,
                        senderName: gc.senderName,
                        message: gc.message,
                      })
                    }
                    className="flex items-center gap-1.5 text-[10px] text-gold border border-gold/25 px-3 py-1.5 tracking-wider uppercase hover:bg-gold/10 transition-colors flex-shrink-0"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    <Share2 size={11} strokeWidth={1.5} /> Share
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[11px] tracking-[0.2em] uppercase px-8 py-3.5"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            Continue Shopping
          </Link>
          {!isGiftCardOnlyOrder && (
            <Link
              href={`/track?id=${order.id}&email=${encodeURIComponent(order.customer.email)}`}
              className="inline-flex items-center justify-center gap-2 border border-gold/25 text-warm-gray text-[11px] tracking-[0.2em] uppercase px-8 py-3.5 hover:border-gold/45 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Track This Order
            </Link>
          )}
          <a
            href={`/api/orders/${order.id}/invoice?email=${encodeURIComponent(order.customer.email)}`}
            className="inline-flex items-center justify-center gap-2 border border-gold/25 text-warm-gray text-[11px] tracking-[0.2em] uppercase px-8 py-3.5 hover:border-gold/45 hover:text-cream transition-colors"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            <FileDown size={13} strokeWidth={1.5} /> Invoice
          </a>
        </div>
        <a
          href={whatsAppLink(`Hi PakAuraa! I have a question about my order ${order.id}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 mt-4 text-[11px] text-warm-gray hover:text-gold transition-colors"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          <MessageCircle size={14} strokeWidth={1.5} /> Ask about this order on WhatsApp
        </a>
      </motion.div>
      {shareCard && <GiftCardShareCard card={shareCard} onClose={() => setShareCard(null)} />}
    </main>
  );
}
