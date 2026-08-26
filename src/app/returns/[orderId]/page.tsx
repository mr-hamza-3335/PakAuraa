"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, PackageSearch, ArrowLeft, AlertCircle, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Order } from "@/lib/store";
import { RETURN_REASONS } from "@/lib/returnReasons";

export default function ReturnRequestPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [customerNote, setCustomerNote] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [windowExpired, setWindowExpired] = useState<boolean>(false);

  useEffect(() => {
    if (!orderId) return;

    // 1. Find order — try Supabase first, then local store
    const findOrder = async () => {
      // Try local store first
      const localRaw = localStorage.getItem("pakauraa-store");
      if (localRaw) {
        try {
          const local = JSON.parse(localRaw);
          const localOrder = local.state?.orders?.find((o: Order) => o.id === orderId);
          if (localOrder) {
            setOrder(localOrder);
            setCustomerEmail(localOrder.customer.email);
            checkWindow(localOrder);
            setLoading(false);
            return;
          }
        } catch {}
      }

      // Try Supabase
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            setCustomerEmail(data.order.customer.email);
            checkWindow(data.order);
            setLoading(false);
            return;
          }
        }
      } catch {}

      setError("Order not found. Please check the order ID.");
      setLoading(false);
    };

    const checkWindow = (o: Order) => {
      if (o.status !== "delivered") {
        setError("Returns are only available for delivered orders.");
        return;
      }
      if (!o.deliveredAt) {
        setError("Delivery date is missing. Please contact support.");
        return;
      }
      const deliveredAt = new Date(o.deliveredAt);
      const now = new Date();
      const diffMs = now.getTime() - deliveredAt.getTime();
      const daysSince = diffMs / (1000 * 60 * 60 * 24);
      const remaining = 7 - Math.floor(daysSince);
      if (remaining <= 0) {
        setWindowExpired(true);
        setError("The 7-day return window has expired.");
      } else {
        setDaysRemaining(remaining);
      }
    };

    findOrder();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !reason || !customerEmail) return;

    setSubmitting(true);
    setError(null);

    const product = order?.items.find((i) => i.product.id === selectedProductId)?.product;
    if (!product) {
      setError("Please select a valid product.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: selectedProductId,
          productName: product.name,
          customerEmail,
          customerNote: customerNote.trim() || undefined,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit return request.");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
          <p className="text-[13px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
            Loading order…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  if (windowExpired || (error && !order)) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
          <div className="max-w-[440px] w-full text-center">
            <X size={36} className="text-red-400 mx-auto mb-5" strokeWidth={1.5} />
            <h1 className="font-display text-[24px] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>
              Return Window Closed
            </h1>
            <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
              {error}
            </p>
            <Link
              href="/account"
              className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Back to Account
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (success) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[520px] w-full text-center"
          >
            <CheckCircle2 size={42} className="text-gold mx-auto mb-5" strokeWidth={1.5} />
            <h1 className="font-display text-[28px] text-cream mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
              Return Request Submitted
            </h1>
            <p className="text-[14px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
              We've received your return request. An admin will review it within 24 hours and contact you at <span className="text-gold">{customerEmail}</span> with the next steps.
            </p>
            <p className="text-[12px] text-warm-gray/85 mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
              You'll receive a confirmation email shortly. Once approved, your refund will be processed within 5-7 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/account"
                className="text-[11px] text-gold border border-gold/30 px-5 py-2.5 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Back to Account
              </Link>
              <Link
                href="/"
                className="text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-wider uppercase hover:bg-gold-light transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
          <div className="max-w-[440px] w-full text-center">
            <PackageSearch size={32} className="text-warm-gray mx-auto mb-5" strokeWidth={1} />
            <h1 className="font-display text-[24px] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>
              Order Not Found
            </h1>
            <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
              We couldn't find order <span className="text-gold">{orderId}</span>. Please check the order ID or contact support.
            </p>
            <Link href="/account" className="text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5" style={{ fontFamily: "var(--font-body-family)" }}>
              Back to Account
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
        <div className="max-w-[640px] mx-auto px-6 lg:px-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[11px] text-warm-gray hover:text-gold mb-6 transition-colors"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            <ArrowLeft size={14} strokeWidth={1.5} /> Back
          </button>

          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
            Return Request
          </p>
          <h1 className="font-display text-[clamp(28px,4vw,40px)] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>
            Request a Return
          </h1>
          <p className="text-[13px] text-warm-gray leading-relaxed mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
            Order: <span className="text-gold">{order.id}</span>
          </p>
          <p className="text-[12px] text-warm-gray/85 mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
            You have <span className="text-gold">{daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining</span> to request a return.
          </p>

          {error && (
            <div className="mb-6 p-3 border border-red-500/30 bg-red-500/5 text-red-300 text-[12px] flex items-start gap-2" style={{ fontFamily: "var(--font-body-family)" }}>
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 border border-gold/12 bg-charcoal/20 p-6">
            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                Which product are you returning?
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <option value="">Select a product…</option>
                {order.items.map((item, i) => (
                  <option key={`${item.product.id}-${i}`} value={item.product.id}>
                    {item.product.name} × {item.quantity} ({item.size}ml)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                Reason for return
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <option value="">Select a reason…</option>
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                Additional notes (optional)
              </label>
              <textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                rows={4}
                placeholder="Any additional details about the issue…"
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                style={{ fontFamily: "var(--font-body-family)" }}
              />
            </div>

            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                Your email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-3.5 py-2.5 outline-none focus:border-gold/50 transition-colors"
                style={{ fontFamily: "var(--font-body-family)" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedProductId || !reason || !customerEmail}
              className="w-full text-[11px] text-obsidian bg-gold px-5 py-3 tracking-[0.15em] uppercase disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gold-light transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {submitting ? "Submitting…" : "Submit Return Request"}
            </button>

            <p className="text-[11px] text-warm-gray/85 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
              Once approved, you'll receive a return shipping label and refund within 5-7 business days after we receive the product. The refund will be issued to your original payment method.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}