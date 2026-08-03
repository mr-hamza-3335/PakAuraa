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

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
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
                We&apos;ve sent a verification link to <span className="text-gold">{email}</span>. Confirm your email to activate your account.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>
                Join PakAuraa
              </p>
              <h1 className="font-display text-[32px] text-cream text-center mb-8" style={{ fontFamily: "var(--font-display-family)" }}>
                Create Account
              </h1>

              {!isSupabaseConfigured && <NotConfiguredNotice />}

              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { label: "Full Name", value: fullName, setter: setFullName, type: "text" },
                  { label: "Email", value: email, setter: setEmail, type: "email" },
                  { label: "Password", value: password, setter: setPassword, type: "password" },
                ].map(({ label, value, setter, type }) => (
                  <div key={label}>
                    <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>{label}</label>
                    <input
                      required
                      type={type}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      minLength={type === "password" ? 6 : undefined}
                      disabled={!isSupabaseConfigured}
                      className="w-full bg-charcoal border border-gold/18 text-cream text-[13px] px-4 py-3 outline-none focus:border-gold/50 transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-body-family)" }}
                    />
                  </div>
                ))}

                {error && <p className="text-[12px] text-red-300" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>}

                <button
                  type="submit"
                  disabled={!isSupabaseConfigured || loading}
                  className="w-full py-3.5 text-[11px] tracking-[0.22em] uppercase bg-gradient-to-r from-gold-deep to-gold text-obsidian font-medium disabled:opacity-40 transition-opacity"
                  style={{ fontFamily: "var(--font-body-family)" }}
                >
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>

              <p className="text-center mt-6 text-[11px] text-warm-gray" style={{ fontFamily: "var(--font-body-family)" }}>
                Already have an account?{" "}
                <Link href="/account/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
              </p>
            </>
          )}
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
