"use client";

import { useEffect, useState } from "react";

interface Affiliate {
  userId: string;
  email: string | null;
  code: string;
  commissionRate: number;
  pending: number;
  paid: number;
  referrals: number;
  joinedAt: string;
}

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[] | null>(null);
  const [payingOut, setPayingOut] = useState<string | null>(null);

  const load = () => {
    fetch("/api/admin/affiliates")
      .then((res) => res.json())
      .then((body) => setAffiliates(body.affiliates ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const markPaid = async (userId: string) => {
    setPayingOut(userId);
    await fetch("/api/admin/affiliates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setPayingOut(null);
    load();
  };

  const totalPending = (affiliates ?? []).reduce((s, a) => s + a.pending, 0);

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Affiliates</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        {affiliates ? `${affiliates.length} affiliate${affiliates.length === 1 ? "" : "s"} · PKR ${totalPending.toLocaleString()} pending payout.` : "Loading…"}
      </p>

      {!affiliates ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Loading…</p>
      ) : affiliates.length === 0 ? (
        <p className="text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>No affiliates yet.</p>
      ) : (
        <div className="border border-gold/12 divide-y divide-gold/10">
          {affiliates.map((a) => (
            <div key={a.userId} className="flex items-center gap-4 p-4 flex-wrap">
              <div className="flex-1 min-w-[160px]">
                <p className="text-[13px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{a.email ?? a.userId}</p>
                <p className="text-[10px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>
                  Code {a.code} · {Math.round(a.commissionRate * 100)}% commission · {a.referrals} referred orders
                </p>
              </div>
              <span className="text-[12px] text-gold" style={{ fontFamily: "var(--font-body-family)" }}>PKR {a.pending.toLocaleString()} pending</span>
              <span className="text-[11px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>PKR {a.paid.toLocaleString()} paid</span>
              <button
                onClick={() => markPaid(a.userId)}
                disabled={a.pending === 0 || payingOut === a.userId}
                className="text-[9px] tracking-wider uppercase px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors disabled:opacity-30"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                {payingOut === a.userId ? "…" : "Mark Paid"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
