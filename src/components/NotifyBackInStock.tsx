"use client";

import { useState } from "react";
import { BellRing, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function NotifyBackInStock({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      setError("Not available right now — please check back later.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error: dbError } = await supabase.from("stock_notifications").insert({ email, product_id: productId });
    setLoading(false);
    if (dbError) {
      setError("Something went wrong — please try again.");
      return;
    }
    setSent(true);
  };

  if (!isSupabaseConfigured) return null;

  if (sent) {
    return (
      <div className="flex-1 py-4 text-[11px] tracking-[0.22em] uppercase flex items-center justify-center gap-3 border border-green-600/30 text-green-400" style={{ fontFamily: "var(--font-body-family)" }}>
        <Check size={15} strokeWidth={2} /> We&apos;ll Email You
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row gap-3">
      <div className="flex-1 border border-gold/30 flex items-center px-4 py-1">
        <BellRing size={14} className="text-gold flex-shrink-0 mr-3" strokeWidth={1.5} />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="w-full bg-transparent text-cream text-[12px] py-2.5 outline-none placeholder:text-warm-gray/85"
          style={{ fontFamily: "var(--font-body-family)" }}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="py-3.5 px-6 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-50"
        style={{ fontFamily: "var(--font-body-family)" }}
      >
        {loading ? "…" : "Notify Me"}
      </button>
      {error && <p className="text-[11px] text-red-300 basis-full" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>}
    </form>
  );
}
