"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, PackageSearch, Truck, User, Phone, Headset, MessageCircle, PackageCheck, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Order } from "@/lib/store";
import { whatsAppLink } from "@/components/WhatsAppWidget";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  cod: "Confirmed — Pay on Delivery",
  shipped: "On The Way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusExplanations: Record<string, string> = {
  pending: "We've received your order and are getting it ready.",
  paid: "Your payment is confirmed — your order is being prepared for dispatch.",
  cod: "Your order is confirmed and being prepared for dispatch. You'll pay in cash when it arrives.",
  shipped: "Your order has left our store and is on its way to you.",
  delivered: "Your order has been delivered. We hope you love it!",
  cancelled: "This order was cancelled. Contact us if you have any questions.",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function estimatedDelivery(createdAt: string) {
  const placed = new Date(createdAt);
  const from = new Date(placed);
  from.setDate(from.getDate() + 3);
  const to = new Date(placed);
  to.setDate(to.getDate() + 5);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(from)} – ${fmt(to)}`;
}

function TrackForm() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") ?? "");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (id: string, mail: string) => {
    if (!id.trim() || !mail.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id.trim())}?email=${encodeURIComponent(mail.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setOrder(null);
        setError(data.error ?? "Order not found.");
        return;
      }
      setOrder(data.order);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(orderId, email);
  };

  return (
    <div className="max-w-[560px] mx-auto">
      <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>
        Order Status
      </p>
      <h1 className="font-display text-[clamp(28px,4vw,40px)] text-cream text-center mb-10" style={{ fontFamily: "var(--font-display-family)" }}>
        Track Your Order
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-10">
        <div>
          <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Order ID</label>
          <input
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="PA-XXXXXXX"
            className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
            style={{ fontFamily: "var(--font-body-family)" }}
          />
        </div>
        <div>
          <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          <Search size={13} strokeWidth={2} /> {loading ? "Searching…" : "Track Order"}
        </button>
      </form>

      {searched && !loading && (
        error ? (
          <div className="text-center py-10 border border-gold/10 bg-charcoal/20">
            <PackageSearch size={24} className="text-warm-gray/40 mx-auto mb-4" strokeWidth={1} />
            <p className="text-[13px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>
          </div>
        ) : order ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-gold/15 bg-charcoal/30 p-6"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-[13px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>{order.id}</span>
              <span className="text-[9px] text-obsidian bg-gold uppercase tracking-wider px-2.5 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
                {statusLabels[order.status] ?? order.status}
              </span>
            </div>

            <p className="text-[13px] text-cream leading-relaxed mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
              {statusExplanations[order.status]}
            </p>
            {(order.status === "pending" || order.status === "paid" || order.status === "cod" || order.status === "shipped") && (
              <p className="text-[11px] text-warm-gray/85 mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
                Expected delivery: <span className="text-warm-gray">{estimatedDelivery(order.createdAt)}</span>
              </p>
            )}

            {order.status === "delivered" && order.deliveredAt && (
              <div className="mb-4 p-4 border border-[#7FA888]/30 bg-[#7FA888]/5 space-y-1.5">
                <p className="text-[10px] text-[#7FA888] tracking-[0.15em] uppercase mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                  <PackageCheck size={13} strokeWidth={1.5} /> Delivered
                </p>
                <p className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatDateTime(order.deliveredAt)}</p>
                {order.deliveredBy && (
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>Delivered by: {order.deliveredBy}</p>
                )}
                {order.deliveredTo && (
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>Received by: {order.deliveredTo}</p>
                )}
              </div>
            )}

            {order.status === "cancelled" && (
              <div className="mb-4 p-4 border border-[#B95C5C]/30 bg-[#B95C5C]/5 space-y-1.5">
                <p className="text-[10px] text-[#B95C5C] tracking-[0.15em] uppercase mb-1 flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                  <XCircle size={13} strokeWidth={1.5} /> Cancelled
                </p>
                {order.cancelledAt && (
                  <p className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{formatDateTime(order.cancelledAt)}</p>
                )}
                {order.cancelReason && (
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>Reason: {order.cancelReason}</p>
                )}
                {order.cancelNote && (
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>{order.cancelNote}</p>
                )}
                <div className="pt-2 mt-2 border-t border-[#B95C5C]/15">
                  <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                    Questions about this? Contact us —{" "}
                    <a href={whatsAppLink(`Hi PakAuraa, my order ${order.id} was cancelled — I'd like to know more.`)} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light inline-flex items-center gap-1">
                      <MessageCircle size={11} strokeWidth={1.5} /> WhatsApp us
                    </a>
                  </p>
                </div>
              </div>
            )}

            {(order.courierCompany || order.riderName || order.riderPhone) && (
              <div className="mb-4 p-4 border border-gold/20 bg-gold/5 space-y-2">
                <p className="text-[10px] text-gold tracking-[0.15em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>
                  Delivery Details
                </p>
                {order.courierCompany && (
                  <p className="text-[12px] text-cream flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                    <Truck size={13} strokeWidth={1.5} className="text-gold/70 flex-shrink-0" /> Sent via {order.courierCompany}
                  </p>
                )}
                {order.courierHelpline && (
                  <p className="text-[12px] text-warm-gray flex items-center gap-2 pl-[21px]" style={{ fontFamily: "var(--font-body-family)" }}>
                    <Headset size={13} strokeWidth={1.5} className="text-gold/70 flex-shrink-0" />
                    Company helpline: <a href={`tel:${order.courierHelpline}`} className="text-cream hover:text-gold transition-colors">{order.courierHelpline}</a>
                  </p>
                )}
                {order.riderName && (
                  <p className="text-[12px] text-cream flex items-center gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
                    <User size={13} strokeWidth={1.5} className="text-gold/70 flex-shrink-0" /> Rider: {order.riderName}
                  </p>
                )}
                {order.riderPhone && (
                  <p className="text-[12px] text-warm-gray flex items-center gap-2 pl-[21px]" style={{ fontFamily: "var(--font-body-family)" }}>
                    <Phone size={13} strokeWidth={1.5} className="text-gold/70 flex-shrink-0" />
                    Contact rider: <a href={`tel:${order.riderPhone}`} className="text-cream hover:text-gold transition-colors">{order.riderPhone}</a>
                  </p>
                )}
                <div className="pt-2 mt-2 border-t border-gold/10">
                  <p className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                    Any issue with your delivery? Contact us directly —{" "}
                    <a href={whatsAppLink(`Hi PakAuraa, I need help with my order ${order.id}.`)} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light inline-flex items-center gap-1">
                      <MessageCircle size={11} strokeWidth={1.5} /> WhatsApp us
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5 mb-4 pt-3 border-t border-gold/10">
              {order.items.map((item) => (
                <p key={`${item.product.id}-${item.size}`} className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                  {item.product.name} × {item.quantity} ({item.size}ml)
                </p>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gold/10">
              <span className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                Placed {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>PKR {order.total.toLocaleString()}</span>
            </div>
          </motion.div>
        ) : null
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen px-6">
        <Suspense fallback={null}>
          <TrackForm />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
