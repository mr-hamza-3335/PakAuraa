"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, CheckCircle2, Wallet, Truck, PackageCheck, XCircle, MapPin, Phone, Mail, FileDown, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/store";
import { PAKISTAN_COURIERS } from "@/lib/couriers";
import { CANCEL_REASONS } from "@/lib/orderEvents";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statuses = ["pending", "paid", "cod", "shipped", "delivered", "cancelled"] as const;

const statusMeta: Record<(typeof statuses)[number], { label: string; color: string; Icon: typeof Clock }> = {
  pending: { label: "Pending", color: "#9A9090", Icon: Clock },
  paid: { label: "Paid", color: "#C9A84C", Icon: CheckCircle2 },
  cod: { label: "Cash on Delivery", color: "#C9A84C", Icon: Wallet },
  shipped: { label: "On The Way", color: "#C9A84C", Icon: Truck },
  delivered: { label: "Delivered", color: "#7FA888", Icon: PackageCheck },
  cancelled: { label: "Cancelled", color: "#B95C5C", Icon: XCircle },
};

const filterGroups: { key: string; label: string; statuses: string[] | null }[] = [
  { key: "all", label: "All", statuses: null },
  { key: "unshipped", label: "Not Shipped Yet", statuses: ["pending", "paid", "cod"] },
  { key: "shipped", label: "On The Way", statuses: ["shipped"] },
  { key: "delivered", label: "Delivered", statuses: ["delivered"] },
  { key: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(
      (data ?? []).map((r) => ({
        id: r.id,
        items: r.items,
        total: r.total,
        paymentMethod: r.payment_method,
        status: r.status,
        customer: r.customer,
        createdAt: r.created_at,
        couponCode: r.coupon_code ?? undefined,
        giftCardCode: r.gift_card_code ?? undefined,
        giftCardAmount: r.gift_card_amount ?? undefined,
        courierCompany: r.courier_company ?? undefined,
        courierHelpline: r.courier_helpline ?? undefined,
        riderName: r.rider_name ?? undefined,
        riderPhone: r.rider_phone ?? undefined,
        deliveredBy: r.delivered_by ?? undefined,
        deliveredTo: r.delivered_to ?? undefined,
        deliveredAt: r.delivered_at ?? undefined,
        cancelReason: r.cancel_reason ?? undefined,
        cancelNote: r.cancel_note ?? undefined,
        cancelledBy: r.cancelled_by ?? undefined,
        cancelledAt: r.cancelled_at ?? undefined,
        giftCardsIssued: r.gift_cards_issued ?? true,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as Order["status"] } : o)));
  };

  // Marking an order "Delivered" or "Cancelled" opens an inline form first —
  // the extra context (who, to whom, why) is what lets the customer's
  // /track page actually explain what happened instead of just a status word.
  const [statusFormOrder, setStatusFormOrder] = useState<{ id: string; mode: "delivered" | "cancelled" } | null>(null);
  const [deliveredDrafts, setDeliveredDrafts] = useState<Record<string, { deliveredBy: string; deliveredTo: string }>>({});
  const [cancelDrafts, setCancelDrafts] = useState<Record<string, { cancelReason: string; cancelNote: string; cancelledBy: string }>>({});

  const deliveredDraftFor = (order: Order) =>
    deliveredDrafts[order.id] ?? { deliveredBy: order.deliveredBy ?? "", deliveredTo: order.deliveredTo ?? "" };
  const setDeliveredField = (id: string, field: "deliveredBy" | "deliveredTo", value: string, order: Order) => {
    setDeliveredDrafts((prev) => ({ ...prev, [id]: { ...deliveredDraftFor(order), ...prev[id], [field]: value } }));
  };

  const cancelDraftFor = (order: Order) =>
    cancelDrafts[order.id] ?? { cancelReason: order.cancelReason ?? "", cancelNote: order.cancelNote ?? "", cancelledBy: order.cancelledBy ?? "" };
  const setCancelField = (id: string, field: "cancelReason" | "cancelNote" | "cancelledBy", value: string, order: Order) => {
    setCancelDrafts((prev) => ({ ...prev, [id]: { ...cancelDraftFor(order), ...prev[id], [field]: value } }));
  };

  const confirmDelivered = async (order: Order) => {
    const draft = deliveredDraftFor(order);
    const res = await fetch(`/api/admin/orders/${order.id}/deliver`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveredBy: draft.deliveredBy, deliveredTo: draft.deliveredTo }),
    });
    if (!res.ok) return;
    const now = new Date().toISOString();
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "delivered", ...draft, deliveredAt: now } : o)));
    setStatusFormOrder(null);
  };

  const confirmCancelled = async (order: Order) => {
    const supabase = createClient();
    if (!supabase) return;
    const draft = cancelDraftFor(order);
    if (!draft.cancelReason) return;
    const now = new Date().toISOString();
    await supabase
      .from("orders")
      .update({ status: "cancelled", cancel_reason: draft.cancelReason, cancel_note: draft.cancelNote || null, cancelled_by: draft.cancelledBy || null, cancelled_at: now })
      .eq("id", order.id);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "cancelled", ...draft, cancelledAt: now } : o)));
    setStatusFormOrder(null);
  };

  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { courierCompany: string; courierHelpline: string; riderName: string; riderPhone: string }>>({});
  const [trackingSavedId, setTrackingSavedId] = useState<string | null>(null);
  const [otherCourierMode, setOtherCourierMode] = useState<Record<string, boolean>>({});
  const OTHER_COURIER = "Other / Local Rider";
  const knownCouriers: readonly string[] = PAKISTAN_COURIERS;

  const trackingDraftFor = (order: Order) =>
    trackingDrafts[order.id] ?? {
      courierCompany: order.courierCompany ?? "",
      courierHelpline: order.courierHelpline ?? "",
      riderName: order.riderName ?? "",
      riderPhone: order.riderPhone ?? "",
    };

  const setTrackingField = (id: string, field: "courierCompany" | "courierHelpline" | "riderName" | "riderPhone", value: string, order: Order) => {
    setTrackingDrafts((prev) => ({ ...prev, [id]: { ...trackingDraftFor(order), ...prev[id], [field]: value } }));
  };

  const saveTracking = async (order: Order) => {
    const supabase = createClient();
    if (!supabase) return;
    const draft = trackingDraftFor(order);
    const hasTracking = !!(draft.courierCompany || draft.riderName || draft.riderPhone);
    // Filling in tracking info means the order has left the store — bump the
    // status to "shipped" too, so the customer's /track page actually shows
    // it instead of staying stuck on "being prepared" until someone remembers
    // to flip the dropdown separately.
    const bumpToShipped = hasTracking && (order.status === "pending" || order.status === "paid" || order.status === "cod");
    const newStatus = bumpToShipped ? "shipped" : order.status;
    await supabase
      .from("orders")
      .update({
        courier_company: draft.courierCompany || null,
        courier_helpline: draft.courierHelpline || null,
        rider_name: draft.riderName || null,
        rider_phone: draft.riderPhone || null,
        ...(bumpToShipped ? { status: newStatus } : {}),
      })
      .eq("id", order.id);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, ...draft, status: newStatus } : o)));
    setTrackingSavedId(order.id);
    setTimeout(() => setTrackingSavedId((cur) => (cur === order.id ? null : cur)), 2000);
  };

  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);

  // JazzCash orders sit at "pending" (not "paid") until an admin has actually
  // looked at the payment screenshot and confirms here. Confirming also
  // releases any gift card the order was holding back.
  const confirmPayment = async (order: Order) => {
    setConfirmingPaymentId(order.id);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/confirm-payment`, { method: "POST" });
      if (!res.ok) return;
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "paid", giftCardsIssued: true } : o)));
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  const activeGroup = filterGroups.find((g) => g.key === filter) ?? filterGroups[0];
  const visibleOrders = useMemo(
    () => (activeGroup.statuses ? orders.filter((o) => activeGroup.statuses!.includes(o.status)) : orders),
    [orders, activeGroup]
  );

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Orders</h1>
      <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
        Every order placed at checkout is synced here automatically — full shipping details, on every card.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterGroups.map((g) => {
          const count = g.statuses ? orders.filter((o) => g.statuses!.includes(o.status)).length : orders.length;
          const active = g.key === filter;
          return (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className={`text-[10px] tracking-[0.12em] uppercase px-4 py-2 border transition-colors ${
                active ? "border-gold text-gold bg-gold/[0.06]" : "border-gold/15 text-warm-gray hover:border-gold/30 hover:text-cream"
              }`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {g.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Loading…</p>
      ) : visibleOrders.length === 0 ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>No orders in this view.</p>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const meta = statusMeta[order.status];
            return (
              <div key={order.id} className="border border-gold/12 bg-charcoal/30 p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4 pb-4 border-b border-gold/10">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[13px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>{order.id}</span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[9px] tracking-wider uppercase px-2.5 py-1 border"
                      style={{ fontFamily: "var(--font-body-family)", color: meta.color, borderColor: `${meta.color}55` }}
                    >
                      <meta.Icon size={11} strokeWidth={1.5} /> {meta.label}
                    </span>
                    <span className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>PKR {order.total?.toLocaleString()}</span>
                    <a
                      href={`/api/orders/${order.id}/invoice`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Download invoice"
                      className="text-warm-gray hover:text-gold transition-colors"
                    >
                      <FileDown size={16} strokeWidth={1.5} />
                    </a>
                    <select
                      value={order.status}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "delivered" || v === "cancelled") {
                          setStatusFormOrder({ id: order.id, mode: v });
                        } else if (v === "paid" && order.paymentMethod === "jazzcash") {
                          // Route through the confirm-payment endpoint so any
                          // held-back gift card is released at the same time.
                          setStatusFormOrder(null);
                          confirmPayment(order);
                        } else {
                          setStatusFormOrder(null);
                          updateStatus(order.id, v);
                        }
                      }}
                      className="bg-charcoal border border-gold/18 text-warm-gray text-[10px] tracking-wider uppercase px-2 py-1.5 outline-none"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{statusMeta[s].label}</option>)}
                    </select>
                  </div>
                </div>

                {statusFormOrder?.id === order.id && statusFormOrder.mode === "delivered" && (
                  <div className="mb-5 p-4 border border-[#7FA888]/30 bg-[#7FA888]/5">
                    <p className="text-[9px] text-[#7FA888] tracking-wider uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Confirm Delivery</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Delivered By</label>
                        <input
                          value={deliveredDraftFor(order).deliveredBy}
                          onChange={(e) => setDeliveredField(order.id, "deliveredBy", e.target.value, order)}
                          placeholder="e.g. Khan (TCS rider)"
                          className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Delivered To</label>
                        <input
                          value={deliveredDraftFor(order).deliveredTo}
                          onChange={(e) => setDeliveredField(order.id, "deliveredTo", e.target.value, order)}
                          placeholder="e.g. customer themselves / family member"
                          className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        />
                      </div>
                    </div>
                    <p className="text-[10px] text-warm-gray/85 mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Date, day and time are recorded automatically.</p>
                    <div className="flex gap-2">
                      <button onClick={() => confirmDelivered(order)} className="text-[10px] text-obsidian bg-[#7FA888] px-4 py-2 tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                        Confirm Delivered
                      </button>
                      <button onClick={() => setStatusFormOrder(null)} className="text-[10px] text-warm-gray border border-gold/20 px-4 py-2 tracking-wider uppercase hover:text-cream transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {statusFormOrder?.id === order.id && statusFormOrder.mode === "cancelled" && (
                  <div className="mb-5 p-4 border border-[#B95C5C]/30 bg-[#B95C5C]/5">
                    <p className="text-[9px] text-[#B95C5C] tracking-wider uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Confirm Cancellation</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Reason</label>
                        <select
                          value={cancelDraftFor(order).cancelReason}
                          onChange={(e) => setCancelField(order.id, "cancelReason", e.target.value, order)}
                          className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        >
                          <option value="">Select reason…</option>
                          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Cancelled By (your name)</label>
                        <input
                          value={cancelDraftFor(order).cancelledBy}
                          onChange={(e) => setCancelField(order.id, "cancelledBy", e.target.value, order)}
                          placeholder="e.g. Ameer"
                          className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                          style={{ fontFamily: "var(--font-body-family)" }}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Additional Notes (optional)</label>
                      <textarea
                        rows={2}
                        value={cancelDraftFor(order).cancelNote}
                        onChange={(e) => setCancelField(order.id, "cancelNote", e.target.value, order)}
                        placeholder="Any extra detail — e.g. address given was incomplete, tried calling 3 times…"
                        className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      />
                    </div>
                    <p className="text-[10px] text-warm-gray/85 mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Date, day and time are recorded automatically.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => confirmCancelled(order)}
                        disabled={!cancelDraftFor(order).cancelReason}
                        className="text-[10px] text-cream bg-[#B95C5C] px-4 py-2 tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ fontFamily: "var(--font-body-family)" }}
                      >
                        Confirm Cancellation
                      </button>
                      <button onClick={() => setStatusFormOrder(null)} className="text-[10px] text-warm-gray border border-gold/20 px-4 py-2 tracking-wider uppercase hover:text-cream transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {order.status === "delivered" && order.deliveredAt && statusFormOrder?.id !== order.id && (
                  <div className="mb-5 p-3 border border-[#7FA888]/20 bg-[#7FA888]/5 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                      Delivered{order.deliveredBy ? ` by ${order.deliveredBy}` : ""}{order.deliveredTo ? ` to ${order.deliveredTo}` : ""} — {formatDateTime(order.deliveredAt)}
                    </p>
                    <button onClick={() => setStatusFormOrder({ id: order.id, mode: "delivered" })} className="text-[9px] text-[#7FA888] tracking-wider uppercase hover:text-cream transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                      Edit
                    </button>
                  </div>
                )}

                {order.status === "cancelled" && order.cancelledAt && statusFormOrder?.id !== order.id && (
                  <div className="mb-5 p-3 border border-[#B95C5C]/20 bg-[#B95C5C]/5 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                      Cancelled{order.cancelReason ? ` — ${order.cancelReason}` : ""}{order.cancelNote ? `: ${order.cancelNote}` : ""}{order.cancelledBy ? ` (by ${order.cancelledBy})` : ""} — {formatDateTime(order.cancelledAt)}
                    </p>
                    <button onClick={() => setStatusFormOrder({ id: order.id, mode: "cancelled" })} className="text-[9px] text-[#B95C5C] tracking-wider uppercase hover:text-cream transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
                      Edit
                    </button>
                  </div>
                )}

                {order.paymentMethod === "jazzcash" && order.status === "pending" && (
                  <div className="mb-5 p-4 border border-gold/30 bg-gold/5">
                    <p className="text-[11px] text-gold tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                      Awaiting Payment Confirmation
                    </p>
                    <p className="text-[12px] text-warm-gray leading-relaxed mb-3" style={{ fontFamily: "var(--font-body-family)" }}>
                      {order.items?.some((i) => i.giftCardRecipient) ? (
                        <>
                          This order includes a gift card. It has <strong className="text-cream">not</strong> been emailed to the recipient yet —
                          verify the JazzCash payment screenshot first, then confirm below to mark this order paid and send the gift card.
                        </>
                      ) : (
                        "Verify the JazzCash payment screenshot on WhatsApp, then confirm below to mark this order as paid."
                      )}
                    </p>
                    <button
                      onClick={() => confirmPayment(order)}
                      disabled={confirmingPaymentId === order.id}
                      className="text-[10px] text-obsidian bg-gold px-4 py-2.5 tracking-wider uppercase hover:bg-gold/90 transition-colors disabled:opacity-50"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      {confirmingPaymentId === order.id ? "Confirming…" : "Payment Confirmed — Mark Paid"}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Ship To</p>
                    <p className="text-[13px] text-cream mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{order.customer?.name}</p>
                    <p className="text-[12px] text-warm-gray flex items-start gap-1.5 mb-1" style={{ fontFamily: "var(--font-body-family)" }}>
                      <MapPin size={13} strokeWidth={1.5} className="mt-0.5 flex-shrink-0 text-gold/70" />
                      {order.customer?.address}{order.customer?.landmark ? `, ${order.customer.landmark}` : ""}, {order.customer?.city}
                    </p>
                    <p className="text-[12px] text-warm-gray flex items-center gap-1.5 mb-1" style={{ fontFamily: "var(--font-body-family)" }}>
                      <Phone size={13} strokeWidth={1.5} className="flex-shrink-0 text-gold/70" />
                      {order.customer?.phone}
                    </p>
                    <p className="text-[12px] text-warm-gray flex items-center gap-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                      <Mail size={13} strokeWidth={1.5} className="flex-shrink-0 text-gold/70" />
                      {order.customer?.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Items — {order.paymentMethod.toUpperCase()}</p>
                    <div className="space-y-1">
                      {order.items?.map((item) => (
                        <p key={`${item.product.id}-${item.size}-${item.giftWrap}-${item.engrave}`} className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                          {item.product.name} × {item.quantity} ({item.size}ml)
                          {(item.giftWrap || item.engrave) && (
                            <span className="text-[9px] text-gold/70 ml-1.5">
                              — {[item.giftWrap && "Gift Wrapped", item.engrave && "Engraved"].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gold/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
                      Tracking Info — shown to the customer on /track
                    </p>
                    {trackingSavedId === order.id && (
                      <span className="flex items-center gap-1 text-[10px] text-green-400" style={{ fontFamily: "var(--font-body-family)" }}>
                        <Check size={11} strokeWidth={2} /> Saved
                      </span>
                    )}
                  </div>
                  {(() => {
                    const draft = trackingDraftFor(order);
                    const isOther = otherCourierMode[order.id] ?? (draft.courierCompany !== "" && !knownCouriers.includes(draft.courierCompany));
                    const selectValue = isOther ? OTHER_COURIER : knownCouriers.includes(draft.courierCompany) ? draft.courierCompany : "";
                    return (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Courier Company</label>
                            <select
                              value={selectValue}
                              onChange={(e) => {
                                const v = e.target.value;
                                if (v === OTHER_COURIER) {
                                  setOtherCourierMode((prev) => ({ ...prev, [order.id]: true }));
                                } else {
                                  setOtherCourierMode((prev) => ({ ...prev, [order.id]: false }));
                                  setTrackingField(order.id, "courierCompany", v, order);
                                }
                              }}
                              className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            >
                              <option value="">Select courier…</option>
                              {PAKISTAN_COURIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {isOther && (
                              <input
                                value={draft.courierCompany}
                                onChange={(e) => setTrackingField(order.id, "courierCompany", e.target.value, order)}
                                placeholder="Company / rider service name"
                                className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40 mt-2"
                                style={{ fontFamily: "var(--font-body-family)" }}
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Company Helpline</label>
                            <input
                              value={draft.courierHelpline}
                              onChange={(e) => setTrackingField(order.id, "courierHelpline", e.target.value, order)}
                              placeholder="e.g. 021-111-123-456"
                              className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
                          <div>
                            <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Rider Name</label>
                            <input
                              value={draft.riderName}
                              onChange={(e) => setTrackingField(order.id, "riderName", e.target.value, order)}
                              placeholder="e.g. Ali Raza"
                              className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            />
                          </div>
                          <div>
                            <label className="block text-[8px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>Rider Phone</label>
                            <input
                              value={draft.riderPhone}
                              onChange={(e) => setTrackingField(order.id, "riderPhone", e.target.value, order)}
                              placeholder="03XX-XXXXXXX"
                              className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                              style={{ fontFamily: "var(--font-body-family)" }}
                            />
                          </div>
                          <button
                            onClick={() => saveTracking(order)}
                            className="text-[10px] text-gold border border-gold/30 px-4 py-2 tracking-wider uppercase hover:bg-gold/10 transition-colors self-end"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            Save
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
