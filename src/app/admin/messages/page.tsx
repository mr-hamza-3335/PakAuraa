"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const supabase = createClient();
    if (!supabase) return;
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    // Initial fetch from Supabase on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const remove = async (id: string) => {
    // Deletes go through the API route (service-role) since contact_messages
    // only grants admins SELECT via RLS, not DELETE.
    await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Messages</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        Submissions from the Contact Us page — each one also triggers an email alert.
      </p>

      <div className="border border-gold/12 divide-y divide-gold/10">
        {!loading && messages.length === 0 && (
          <p className="p-4 text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <p className="text-[12px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{m.name}</p>
                <p className="text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>{m.email}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[10px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>
                  {new Date(m.created_at).toLocaleString()}
                </span>
                <a href={`mailto:${m.email}`} className="text-gold hover:text-gold/70" aria-label="Reply by email">
                  <Mail size={15} strokeWidth={1.5} />
                </a>
                <button onClick={() => remove(m.id)} className="text-muted hover:text-red-400 transition-colors" aria-label="Delete message">
                  <Trash2 size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            <p className="text-[12px] text-warm-gray leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-body-family)" }}>
              {m.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
