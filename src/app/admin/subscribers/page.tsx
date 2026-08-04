"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SubscriberRow {
  email: string;
  subscribed_at: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    (async () => {
      const supabase = createClient();
      if (!supabase) return;
      const { data } = await supabase.from("newsletter_subscribers").select("*").order("subscribed_at", { ascending: false });
      setSubscribers(data ?? []);
      setLoading(false);
    })();
  }, []);

  const exportCsv = () => {
    const rows = [["email", "subscribed_at"], ...subscribers.map((s) => [s.email, s.subscribed_at])];
    const csv = rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pakauraa-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-[28px] text-cream" style={{ fontFamily: "var(--font-display-family)" }}>Subscribers</h1>
        <button
          onClick={exportCsv}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 text-[11px] text-gold border border-gold/30 px-4 py-2 tracking-wider uppercase hover:bg-gold/10 transition-colors disabled:opacity-40"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          <Download size={13} strokeWidth={1.5} />
          Export CSV
        </button>
      </div>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        Emails collected from the newsletter signup in the footer — {subscribers.length} total.
      </p>

      <div className="border border-gold/12 divide-y divide-gold/10">
        {!loading && subscribers.length === 0 && (
          <p className="p-4 text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No subscribers yet.</p>
        )}
        {subscribers.map((s) => (
          <div key={s.email} className="p-4 flex items-center justify-between">
            <span className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{s.email}</span>
            <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
              {new Date(s.subscribed_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
