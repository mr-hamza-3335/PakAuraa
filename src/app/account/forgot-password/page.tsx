"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotConfiguredNotice from "@/components/auth/NotConfiguredNotice";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/reset-password`,
    });
    setLoading(false);

    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[420px] w-full">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 size={36} className="text-gold mx-auto mb-5" strokeWidth={1.2} />
              <h1 className="font-display text-[26px] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>Check Your Email</h1>
              <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
                If an account exists for <span className="text-gold">{email}</span>, a password reset link is on its way.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>
                Reset Password
              </p>
              <h1 className="font-display text-[28px] text-cream text-center mb-8" style={{ fontFamily: "var(--font-display-family)" }}>
                Forgot Your Password?
              </h1>

              {!isSupabaseConfigured && <NotConfiguredNotice />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Email</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isSupabaseConfigured}
                    className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors disabled:opacity-40"
                    style={{ fontFamily: "var(--font-body-family)" }}
                  />
                </div>

                {error && <p className="text-[12px] text-red-300" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>}

                <button
                  type="submit"
                  disabled={!isSupabaseConfigured || loading}
                  className="w-full py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-40 transition-opacity"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center mt-6 text-[11px]" style={{ fontFamily: "var(--font-body-family)" }}>
                <Link href="/account/login" className="text-gold hover:text-gold-light transition-colors">Back to sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
