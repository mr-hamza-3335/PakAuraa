"use client";

import { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen flex items-center justify-center px-6">
        <div className="max-w-[440px] text-center">
          <h1 className="font-display text-[26px] text-cream mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
            Something Went Wrong
          </h1>
          <p className="text-[13px] text-warm-gray leading-relaxed mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
            We hit an unexpected error loading this page. Please try again, or head back to the homepage.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-deep to-gold text-obsidian text-[11px] tracking-[0.2em] uppercase px-8 py-3.5"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 border border-gold/25 text-warm-gray text-[11px] tracking-[0.2em] uppercase px-8 py-3.5 hover:border-gold/45 hover:text-cream transition-colors"
              style={{ fontFamily: "var(--font-body-family)" }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
