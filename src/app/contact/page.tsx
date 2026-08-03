"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const details = [
  { Icon: Mail, label: "Email", value: "ameerhamza94572@gmail.com", href: "mailto:ameerhamza94572@gmail.com" },
  { Icon: Phone, label: "Phone", value: "0325 2106239", href: "tel:+923252106239" },
  { Icon: MapPin, label: "Location", value: "Karachi, Pakistan", href: undefined },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't send your message. Please try again.");
        return;
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>Get in Touch</p>
          <h1 className="font-display text-[clamp(32px,5vw,52px)] text-cream text-center mb-16" style={{ fontFamily: "var(--font-display-family)" }}>
            Contact Us
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16">
            {/* Details */}
            <div className="space-y-6">
              {details.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 border border-gold/12 bg-charcoal/30 p-5">
                  <Icon size={16} className="text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[9px] text-warm-gray tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-[14px] text-cream hover:text-gold transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>{value}</a>
                    ) : (
                      <p className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-[12px] text-muted leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                We typically respond within 24–48 hours. For order questions, include your order ID.
              </p>
            </div>

            {/* Form */}
            <div>
              {sent ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="border border-gold/20 bg-gold/5 p-8 text-center">
                  <CheckCircle2 size={30} className="text-gold mx-auto mb-4" strokeWidth={1.2} />
                  <p className="text-[15px] text-cream mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Message sent</p>
                  <p className="text-[12px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>Thank you — we&apos;ll get back to you shortly.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    />
                  </div>
                  {error && <p className="text-[12px] text-red-300" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-50 transition-opacity"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  >
                    {sending ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
