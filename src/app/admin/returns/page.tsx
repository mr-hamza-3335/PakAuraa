"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, Clock, Package, ChevronRight, Mail, ArrowLeft } from "lucide-react";

interface ReturnRequest {
  id: string;
  order_id: string;
  customer_id: string;
  customer_email: string;
  product_id: string;
  product_name: string;
  reason: string;
  customer_note: string | null;
  status: "pending" | "approved" | "rejected" | "completed";
  refund_amount: number;
  admin_note: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

const statusMeta: Record<ReturnRequest["status"], { label: string; color: string; Icon: typeof Clock }> = {
  pending: { label: "Pending", color: "#9A9090", Icon: Clock },
  approved: { label: "Approved", color: "#C9A84C", Icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "#B95C5C", Icon: X },
  completed: { label: "Completed", color: "#7FA888", Icon: CheckCircle2 },
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[] | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "resolved">("all");
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const load = () => {
    fetch("/api/admin/returns")
      .then((res) => res.json())
      .then((body) => setReturns(body.returns ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: ReturnRequest["status"]) => {
    setUpdating(true);
    try {
      const body: any = { id, status };
      if (status === "completed" && refundAmount) {
        body.refundAmount = parseInt(refundAmount, 10);
      }
      if (adminNote) {
        body.adminNote = adminNote;
      }

      const res = await fetch("/api/admin/returns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setSelected(null);
        setRefundAmount("");
        setAdminNote("");
        load();
      }
    } finally {
      setUpdating(false);
    }
  };

  const filteredReturns = (returns ?? []).filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending" || r.status === "approved";
    if (filter === "resolved") return r.status === "completed" || r.status === "rejected";
    return true;
  });

  const counts = {
    all: (returns ?? []).length,
    pending: (returns ?? []).filter((r) => r.status === "pending" || r.status === "approved").length,
    resolved: (returns ?? []).filter((r) => r.status === "completed" || r.status === "rejected").length,
  };

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>
        Returns &amp; Refunds
      </h1>
      <p className="text-[12px] text-warm-gray mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
        Customer return requests within the 7-day return window. Approving and completing a return reverses the related affiliate commission.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {([
          { key: "all", label: "All", count: counts.all },
          { key: "pending", label: "Open", count: counts.pending },
          { key: "resolved", label: "Closed", count: counts.resolved },
        ] as const).map((g) => {
          const active = filter === g.key;
          return (
            <button
              key={g.key}
              onClick={() => setFilter(g.key)}
              className={`text-[10px] tracking-[0.12em] uppercase px-4 py-2 border transition-colors ${
                active ? "border-gold text-gold bg-gold/[0.06]" : "border-gold/15 text-warm-gray hover:border-gold/30 hover:text-cream"
              }`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {g.label} ({g.count})
            </button>
          );
        })}
      </div>

      {returns === null ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Loading…</p>
      ) : filteredReturns.length === 0 ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>No return requests in this view.</p>
      ) : (
        <div className="space-y-3">
          {filteredReturns.map((r) => {
            const meta = statusMeta[r.status];
            const isSelected = selected?.id === r.id;
            return (
              <div key={r.id} className="border border-gold/12 bg-charcoal/30 p-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <p className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{r.product_name}</p>
                      <span
                        className="inline-flex items-center gap-1 text-[9px] tracking-wider uppercase px-2 py-0.5 border"
                        style={{ fontFamily: "var(--font-body-family)", color: meta.color, borderColor: `${meta.color}55` }}
                      >
                        <meta.Icon size={10} strokeWidth={1.5} /> {meta.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                      Order: <span className="text-cream">{r.order_id}</span> · {r.reason}
                    </p>
                    <p className="text-[10px] text-warm-gray/85 flex items-center gap-1.5 mt-1" style={{ fontFamily: "var(--font-body-family)" }}>
                      <Mail size={11} strokeWidth={1.5} className="text-gold/70" />
                      {r.customer_email}
                    </p>
                    <p className="text-[10px] text-warm-gray/85 mt-1" style={{ fontFamily: "var(--font-body-family)" }}>
                      Submitted: {new Date(r.created_at).toLocaleString()}
                      {r.resolved_at && ` · Resolved: ${new Date(r.resolved_at).toLocaleString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(isSelected ? null : r)}
                    className="text-[10px] text-gold border border-gold/30 px-4 py-2 tracking-wider uppercase hover:bg-gold/10 transition-colors"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {isSelected ? "Close" : "Review"}
                  </button>
                </div>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-gold/10 space-y-4">
                    {r.customer_note && (
                      <div>
                        <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          Customer Note
                        </p>
                        <p className="text-[12px] text-cream leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                          {r.customer_note}
                        </p>
                      </div>
                    )}

                    {r.admin_note && (
                      <div>
                        <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          Admin Note
                        </p>
                        <p className="text-[12px] text-cream leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                          {r.admin_note}
                        </p>
                      </div>
                    )}

                    {r.status === "completed" && r.refund_amount > 0 && (
                      <div>
                        <p className="text-[9px] text-warm-gray/85 tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                          Refund Issued
                        </p>
                        <p className="text-[14px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>
                          PKR {r.refund_amount.toLocaleString()}
                        </p>
                      </div>
                    )}

                    {r.status === "pending" && (
                      <>
                        <div>
                          <label className="block text-[9px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                            Admin Note (optional)
                          </label>
                          <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={2}
                            placeholder="Internal note about this return…"
                            className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => updateStatus(r.id, "approved")}
                            disabled={updating}
                            className="text-[10px] text-obsidian bg-gold px-4 py-2 tracking-wider uppercase hover:bg-gold-light transition-colors disabled:opacity-50"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            disabled={updating}
                            className="text-[10px] text-warm-gray border border-gold/20 px-4 py-2 tracking-wider uppercase hover:border-red-500/40 hover:text-red-300 transition-colors disabled:opacity-50"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            Reject
                          </button>
                        </div>
                      </>
                    )}

                    {r.status === "approved" && (
                      <>
                        <div>
                          <label className="block text-[9px] text-warm-gray tracking-wider uppercase mb-1.5" style={{ fontFamily: "var(--font-body-family)" }}>
                            Refund Amount (PKR)
                          </label>
                          <input
                            type="number"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder="e.g. 2199"
                            className="w-full bg-charcoal border border-gold/18 text-cream text-[12px] px-3 py-2 outline-none focus:border-gold/50 transition-colors placeholder:text-warm-gray/40"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => updateStatus(r.id, "completed")}
                            disabled={updating || !refundAmount}
                            className="text-[10px] text-obsidian bg-[#7FA888] px-4 py-2 tracking-wider uppercase hover:opacity-90 transition-opacity disabled:opacity-40"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            Mark Completed &amp; Issue Refund
                          </button>
                          <button
                            onClick={() => updateStatus(r.id, "rejected")}
                            disabled={updating}
                            className="text-[10px] text-warm-gray border border-gold/20 px-4 py-2 tracking-wider uppercase hover:border-red-500/40 hover:text-red-300 transition-colors disabled:opacity-50"
                            style={{ fontFamily: "var(--font-body-family)" }}
                          >
                            Reject
                          </button>
                        </div>
                        <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                          Completing this return will reverse any affiliate commission tied to the order.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}