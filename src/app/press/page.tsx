import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublishedPress } from "@/lib/press.server";

export const metadata: Metadata = {
  title: "Press & Media",
  description: "Where PakAuraa has been featured — press coverage and media mentions.",
};

export default async function PressPage() {
  const mentions = await getPublishedPress();

  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[900px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3 text-center" style={{ fontFamily: "var(--font-body-family)" }}>Press</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-6 text-center" style={{ fontFamily: "var(--font-display-family)" }}>
            Press &amp; Media
          </h1>

          {mentions.length === 0 ? (
            <div className="text-center">
              <p className="text-[14px] text-warm-gray leading-[1.9] mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
                Nothing published yet — check back soon. For media inquiries, interview requests, or press samples, reach
                out directly and we&apos;ll get back to you.
              </p>
              <a
                href="mailto:ameerhamza94572@gmail.com"
                className="inline-flex items-center gap-2 text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5"
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                ameerhamza94572@gmail.com
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-14">
              {mentions.map((m) => {
                const Wrapper = m.link ? "a" : "div";
                return (
                  <Wrapper
                    key={m.id}
                    {...(m.link ? { href: m.link, target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="group block border border-gold/12 bg-charcoal/30 overflow-hidden hover:border-gold/30 transition-colors"
                  >
                    {m.image && (
                      <div className="aspect-[16/10] relative overflow-hidden">
                        <Image src={m.image} alt={m.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 100vw, 50vw" />
                      </div>
                    )}
                    <div className="p-6">
                      <p className="text-[9px] text-gold tracking-[0.2em] uppercase mb-2" style={{ fontFamily: "var(--font-body-family)" }}>
                        {m.outlet}
                        {m.publishedAt && ` · ${new Date(m.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                      </p>
                      <h2 className="font-elegant text-[18px] text-cream mb-2 group-hover:text-gold-light transition-colors flex items-start gap-2" style={{ fontFamily: "var(--font-elegant-family)" }}>
                        {m.title}
                        {m.link && <ExternalLink size={13} strokeWidth={1.5} className="text-gold/60 mt-1 flex-shrink-0" />}
                      </h2>
                      {m.excerpt && (
                        <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{m.excerpt}</p>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
