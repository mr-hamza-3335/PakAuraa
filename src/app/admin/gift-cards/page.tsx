"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GiftCardShareCard, { type ShareableGiftCard } from "@/components/GiftCardShareCard";

interface GiftCard {
  code: string;
  initial_amount: number;
  balance: number;
  recipient_email: string;
  recipient_name: string | null;
  sender_name: string | null;
  message: string | null;
  order_id: string | null;
  active: boolean;
  created_at: string;
}

export default function AdminGiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[] | null>(null);
  const [shareCard, setShareCard] = useState<ShareableGiftCard | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    supabase
      .from("gift_cards")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setCards(data ?? []));
  }, []);

  const totalOutstanding = (cards ?? []).reduce((sum, c) => sum + c.balance, 0);

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Gift Cards</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        {cards ? `${cards.length} card${cards.length === 1 ? "" : "s"} issued · PKR ${totalOutstanding.toLocaleString()} outstanding balance.` : "Loading…"}
      </p>

      {!cards ? (
        <p className="text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>Loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No gift cards issued yet.</p>
      ) : (
        <div className="border border-gold/12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-gold/12">
                {["Code", "Recipient", "From", "Balance", "Initial", "Issued", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-muted tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {cards.map((c) => (
                <tr key={c.code}>
                  <td className="px-4 py-3 text-[12px] text-gold whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.code}</td>
                  <td className="px-4 py-3 text-[12px] text-cream whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>
                    {c.recipient_name ?? c.recipient_email}
                    <span className="block text-[10px] text-muted">{c.recipient_email}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-warm-gray whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.sender_name ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>
                    <span className={c.balance > 0 ? "text-gold" : "text-muted"}>PKR {c.balance.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>PKR {c.initial_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[11px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() =>
                        setShareCard({
                          code: c.code,
                          amount: c.initial_amount,
                          recipientName: c.recipient_name,
                          senderName: c.sender_name,
                          message: c.message,
                        })
                      }
                      className="flex items-center gap-1.5 text-[9px] text-gold tracking-wider uppercase px-3 py-1.5 border border-gold/25 hover:bg-gold/10 transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    >
                      <Share2 size={12} strokeWidth={1.5} /> Share
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shareCard && <GiftCardShareCard card={shareCard} onClose={() => setShareCard(null)} />}
    </div>
  );
}
