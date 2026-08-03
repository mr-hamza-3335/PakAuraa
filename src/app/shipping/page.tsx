import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Policy</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-12" style={{ fontFamily: "var(--font-display-family)" }}>
            Shipping &amp; Returns
          </h1>

          <div className="space-y-10 text-[14px] text-warm-gray leading-[1.9]" style={{ fontFamily: "var(--font-body-family)" }}>
            <section>
              <h2 className="text-[15px] text-cream mb-3">Shipping</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Free shipping on every order, Pakistan-wide.</li>
                <li>Orders are delivered within 3–5 business days of purchase.</li>
                <li>Every order arrives in signature PakAuraa matte-black luxury packaging.</li>
                <li>We currently ship within Pakistan only.</li>
                <li>You&apos;ll receive your order ID at checkout — use it on the <a href="/track" className="text-gold hover:text-gold-light">Track Order</a> page any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Returns &amp; Refunds</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>Returns are accepted within 5 days of delivery — if you don&apos;t like the fragrance or there&apos;s any issue with your order, we&apos;ll make it right.</li>
                <li>To request a return, contact us within 5 days of delivery with your order ID and let us know the problem.</li>
                <li>We&apos;ll fix our mistake, take the order back, and refund your payment in full.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Questions</h2>
              <p>
                Reach us any time via the <a href="/contact" className="text-gold hover:text-gold-light">Contact page</a> or email{" "}
                <a href="mailto:ameerhamza94572@gmail.com" className="text-gold hover:text-gold-light">ameerhamza94572@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
