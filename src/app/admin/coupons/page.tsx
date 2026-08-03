"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Share2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CouponShareCard from "@/components/admin/CouponShareCard";

interface Coupon {
  code: string;
  percent_off: number;
  active: boolean;
  expires_at: string | null;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [shareCoupon, setShareCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState(10);
  const [expiresAt, setExpiresAt] = useState("");
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxUses, setMaxUses] = useState("");

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data ?? []);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase || !code.trim()) return;
    await supabase.from("coupons").insert({
      code: code.trim().toUpperCase(),
      percent_off: percentOff,
      active: true,
      expires_at: expiresAt || null,
      min_order_value: minOrderValue,
      max_uses: maxUses ? Number(maxUses) : null,
    });
    setCode("");
    setExpiresAt("");
    setMinOrderValue(0);
    setMaxUses("");
    load();
  };

  const toggleActive = async (coupon: Coupon) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("coupons").update({ active: !coupon.active }).eq("code", coupon.code);
    load();
  };

  const remove = async (code: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("coupons").delete().eq("code", code);
    load();
  };

  const inputClass = "bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-2.5 outline-none focus:border-gold/50";
  const labelClass = "block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2";

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Discount Campaigns</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>Create and manage discount codes.</p>

      <form onSubmit={handleCreate} className="flex items-end gap-3 mb-8 flex-wrap">
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Code</label>
          <input required value={code} onChange={(e) => setCode(e.target.value)} placeholder="WELCOME10" className={`${inputClass} w-40`} style={{ fontFamily: "var(--font-body-family)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>% Off</label>
          <input type="number" min={1} max={100} value={percentOff} onChange={(e) => setPercentOff(Number(e.target.value))} className={`${inputClass} w-24`} style={{ fontFamily: "var(--font-body-family)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Expires</label>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={`${inputClass} w-40`} style={{ fontFamily: "var(--font-body-family)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Min Order (PKR)</label>
          <input type="number" min={0} value={minOrderValue} onChange={(e) => setMinOrderValue(Number(e.target.value))} className={`${inputClass} w-32`} style={{ fontFamily: "var(--font-body-family)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>Max Uses (optional)</label>
          <input type="number" min={1} value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" className={`${inputClass} w-32`} style={{ fontFamily: "var(--font-body-family)" }} />
        </div>
        <button type="submit" className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
          <Plus size={13} strokeWidth={2} /> Create
        </button>
      </form>

      <div className="border border-gold/12 divide-y divide-gold/10">
        {coupons.length === 0 && (
          <p className="p-4 text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No coupons yet.</p>
        )}
        {coupons.map((c) => (
          <div key={c.code} className="flex items-center gap-4 p-4 flex-wrap">
            <span className="text-[13px] text-gold flex-1 min-w-[100px]" style={{ fontFamily: "var(--font-body-family)" }}>{c.code}</span>
            <span className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{c.percent_off}% off</span>
            {c.min_order_value > 0 && (
              <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>Min PKR {c.min_order_value.toLocaleString()}</span>
            )}
            <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
              {c.max_uses ? `${c.used_count} / ${c.max_uses} used` : `${c.used_count} used`}
            </span>
            {c.expires_at && (
              <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
                Expires {new Date(c.expires_at).toLocaleDateString()}
              </span>
            )}
            <button
              onClick={() => toggleActive(c)}
              className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border ${c.active ? "border-gold/40 text-gold" : "border-warm-gray/20 text-muted"}`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {c.active ? "Active" : "Inactive"}
            </button>
            <button
              onClick={() => setShareCoupon(c)}
              className="flex items-center gap-1.5 text-[9px] text-gold tracking-wider uppercase px-3 py-1.5 border border-gold/25 hover:bg-gold/10 transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              <Share2 size={12} strokeWidth={1.5} /> Share
            </button>
            <button onClick={() => remove(c.code)} className="text-muted hover:text-red-400 transition-colors">
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      {shareCoupon && <CouponShareCard coupon={shareCoupon} onClose={() => setShareCoupon(null)} />}
    </div>
  );
}
