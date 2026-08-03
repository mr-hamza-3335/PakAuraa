import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CareersPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[640px] mx-auto px-6 lg:px-12 text-center">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Careers</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-6" style={{ fontFamily: "var(--font-display-family)" }}>
            Join PakAuraa
          </h1>
          <p className="text-[14px] text-warm-gray leading-[1.9] mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
            No open roles right now — check back soon. If you&apos;re passionate about luxury fragrance and think
            you&apos;d be a great fit for the team, we&apos;d still love to hear from you.
          </p>
          <a
            href="mailto:ameerhamza94572@gmail.com"
            className="inline-flex items-center gap-2 text-[11px] text-gold tracking-[0.2em] uppercase border-b border-gold/30 pb-0.5"
            style={{ fontFamily: "var(--font-body-family)" }}
          >
            ameerhamza94572@gmail.com
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}
