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
      <main className="bg-obsidian min-h-screen">
        {/* Header band */}
        <section className="relative pt-40 pb-20 px-6 overflow-hidden border-b border-gold/8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a0f] to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_rgba(201,168,76,0.07)_0%,_transparent_60%)]" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>Get in Touch</p>
            <h1 className="font-display text-[clamp(32px,5vw,52px)] text-cream text-center" style={{ fontFamily: "var(--font-display-family)" }}>
              Contact Us
            </h1>
            <div className="divider-gold mt-6" />
          </motion.div>
        </section>

        <div className="max-w-[1100px] mx-auto px-6 lg:px-12 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16">
            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              {details.map(({ Icon, label, value, href }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-start gap-4 border border-gold/12 bg-charcoal/30 p-5 hover:border-gold/25 transition-colors duration-300"
                >
                  <Icon size={16} className="text-gold flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[9px] text-warm-gray tracking-[0.2em] uppercase mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{label}</p>
                    {href ? (
                      <a href={href} className="text-[14px] text-cream hover:text-gold transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>{value}</a>
                    ) : (
                      <p className="text-[14px] text-cream" style={{ fontFamily: "var(--font-body-family)" }}>{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
              <p className="text-[12px] text-warm-gray/85 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                We typically respond within 24–48 hours. For order questions, include your order ID.
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
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
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
