"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminAnnouncement {
  id: string;
  message: string;
  link: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<AdminAnnouncement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems(data ?? []);
    setLoaded(true);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Connect Supabase to save announcements.");
      return;
    }
    if (!message.trim()) return;
    setSaving(true);
    const { error: dbError } = await supabase.from("announcements").insert({
      message: message.trim(),
      link: link.trim() || null,
      sort_order: sortOrder,
      active: true,
    });
    setSaving(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    setMessage("");
    setLink("");
    setSortOrder(0);
    load();
  };

  const toggleActive = async (item: AdminAnnouncement) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("announcements").update({ active: !item.active }).eq("id", item.id);
    load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  };

  const inputClass =
    "bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-2.5 outline-none focus:border-gold/50";
  const labelClass = "block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2";

  return (
    <div>
      <h1
        className="font-display text-[28px] text-cream mb-1"
        style={{ fontFamily: "var(--font-display-family)" }}
      >
        Announcement Bar
      </h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        Manage the promo strip shown above the header on every page. Multiple active announcements
        rotate automatically; inactive ones stay saved for later.
      </p>

      <form onSubmit={handleCreate} className="flex items-end gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[260px]">
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>
            Message
          </label>
          <input
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Flat 20% off on all fragrances — use code AURAA20"
            className={`${inputClass} w-full`}
            style={{ fontFamily: "var(--font-body-family)" }}
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>
            Link (optional)
          </label>
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/collections"
            className={`${inputClass} w-40`}
            style={{ fontFamily: "var(--font-body-family)" }}
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-body-family)" }}>
            Order
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className={`${inputClass} w-20`}
            style={{ fontFamily: "var(--font-body-family)" }}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 text-[11px] text-obsidian bg-gold px-5 py-2.5 tracking-[0.15em] uppercase disabled:opacity-50"
          style={{ fontFamily: "var(--font-body-family)" }}
        >
          <Plus size={13} strokeWidth={2} /> Add
        </button>
      </form>

      {error && (
        <p className="text-[11px] text-red-400 mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
          {error}
        </p>
      )}

      <div className="border border-gold/12 divide-y divide-gold/10">
        {loaded && items.length === 0 && (
          <p className="p-4 text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
            No announcements yet.
          </p>
        )}
        {!loaded && (
          <p className="p-4 text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
            Loading…
          </p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 flex-wrap">
            <Megaphone size={14} className="text-gold/50 flex-shrink-0" strokeWidth={1.5} />
            <span
              className="text-[13px] text-cream flex-1 min-w-[160px]"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {item.message}
            </span>
            {item.link && (
              <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
                {item.link}
              </span>
            )}
            <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
              Order {item.sort_order}
            </span>
            <button
              onClick={() => toggleActive(item)}
              className={`text-[9px] tracking-wider uppercase px-3 py-1.5 border ${
                item.active ? "border-gold/40 text-gold" : "border-warm-gray/20 text-muted"
              }`}
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              {item.active ? "Active" : "Inactive"}
            </button>
            <button onClick={() => remove(item.id)} className="text-muted hover:text-red-400 transition-colors">
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
