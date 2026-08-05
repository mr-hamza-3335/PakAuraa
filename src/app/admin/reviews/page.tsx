"use client";

import { useEffect, useState } from "react";
import { Check, X, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewRow {
  id: string;
  product_id: string;
  rating: number;
  quote: string;
  author: string;
  location: string | null;
  approved: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    setReviews(data ?? []);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const setApproved = async (id: string, approved: boolean) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("reviews").update({ approved }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("reviews").delete().eq("id", id);
    load();
  };

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Reviews</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        Customer-submitted reviews wait here for approval before appearing on product pages.
      </p>

      <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
        Pending ({pending.length})
      </p>
      <div className="border border-gold/12 divide-y divide-gold/10 mb-10">
        {pending.length === 0 && <p className="p-4 text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>Nothing pending.</p>}
        {pending.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{r.author} · {r.product_id}</span>
              <div className="flex gap-2">
                <button onClick={() => setApproved(r.id, true)} className="text-green-400 hover:text-green-300"><Check size={16} strokeWidth={1.5} /></button>
                <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-300"><X size={16} strokeWidth={1.5} /></button>
              </div>
            </div>
            <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>{r.quote}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gold tracking-[0.25em] uppercase mb-4" style={{ fontFamily: "var(--font-body-family)" }}>
        Live on site ({approved.length})
      </p>
      <div className="border border-gold/12 divide-y divide-gold/10">
        {approved.length === 0 && <p className="p-4 text-[12px] text-warm-gray/85" style={{ fontFamily: "var(--font-body-family)" }}>None approved yet.</p>}
        {approved.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{r.author} · {r.product_id}</span>
              <div className="flex gap-0.5 mt-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} className={i < r.rating ? "fill-gold text-gold" : "text-gold/20"} />)}
              </div>
            </div>
            <button onClick={() => remove(r.id)} className="text-warm-gray/85 hover:text-red-400 transition-colors text-[10px] uppercase tracking-wider" style={{ fontFamily: "var(--font-body-family)" }}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
