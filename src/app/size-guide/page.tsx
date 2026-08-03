import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sizes = [
  { ml: "30ml", desc: "Travel size — perfect for trying a new signature or life on the go.", sprays: "~250 sprays" },
  { ml: "50ml", desc: "Our most popular size — a balanced everyday bottle.", sprays: "~450 sprays" },
  { ml: "100ml", desc: "Best value per ml — for a fragrance you already know you love.", sprays: "~900 sprays" },
];

const meters = [
  { label: "Longevity", desc: "How many hours the fragrance lasts on skin, rated 1 (very light) to 10 (beast mode)." },
  { label: "Projection", desc: "How far the scent trail carries around you, rated 1 (intimate/skin-close) to 10 (fills a room)." },
];

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Guide</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-12" style={{ fontFamily: "var(--font-display-family)" }}>
            Size &amp; Fragrance Guide
          </h1>

          <section className="mb-14">
            <h2 className="text-[15px] text-cream mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Bottle Sizes</h2>
            <div className="border border-gold/12 divide-y divide-gold/10">
              {sizes.map((s) => (
                <div key={s.ml} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[14px] text-gold mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{s.ml}</p>
                    <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{s.desc}</p>
                  </div>
                  <span className="text-[11px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{s.sprays}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[15px] text-cream mb-6" style={{ fontFamily: "var(--font-body-family)" }}>Reading the Fragrance Profile</h2>
            <div className="space-y-5">
              {meters.map((m) => (
                <div key={m.label}>
                  <p className="text-[13px] text-gold mb-1" style={{ fontFamily: "var(--font-body-family)" }}>{m.label}</p>
                  <p className="text-[13px] text-warm-gray leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>{m.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted mt-6 leading-relaxed" style={{ fontFamily: "var(--font-body-family)" }}>
              Every product page shows both meters, plus a full top/heart/base note breakdown — check the &quot;Notes&quot;
              and &quot;Overview&quot; tabs on any fragrance.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
