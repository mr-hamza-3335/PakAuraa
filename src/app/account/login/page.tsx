"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NotConfiguredNotice from "@/components/auth/NotConfiguredNotice";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setError(error.message);
    else router.push("/account");
  };

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-[420px] w-full">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>
            Welcome Back
          </p>
          <h1 className="font-display text-[32px] text-cream text-center mb-8" style={{ fontFamily: "var(--font-display-family)" }}>
            Sign In
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
            <div>
              <label className="block text-[9px] text-warm-gray tracking-[0.15em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-6 text-[11px]" style={{ fontFamily: "var(--font-body-family)" }}>
            <Link href="/account/forgot-password" className="text-warm-gray hover:text-gold transition-colors">Forgot password?</Link>
            <Link href="/account/signup" className="text-gold hover:text-gold-light transition-colors">Create an account</Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}
