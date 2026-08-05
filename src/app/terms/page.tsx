import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Policy</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
            Terms &amp; Conditions
          </h1>
          <p className="text-[12px] text-warm-gray/85 mb-12" style={{ fontFamily: "var(--font-body-family)" }}>Last updated: 2026</p>

          <div className="space-y-10 text-[14px] text-warm-gray leading-[1.9]" style={{ fontFamily: "var(--font-body-family)" }}>
            <section>
              <h2 className="text-[15px] text-cream mb-3">Orders &amp; Pricing</h2>
              <p>
                All prices are listed in Pakistani Rupees (PKR) and are inclusive of applicable taxes unless otherwise
                stated. Prices shown in other currencies on this site are approximate conversions for reference only —
                card payments are always charged in PKR. We reserve the right to correct pricing errors and to refuse
                or cancel orders placed at an incorrect price.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Payment</h2>
              <p>
                We accept Cash on Delivery and card payments via Stripe. Additional payment methods may be added over
                time. Orders are confirmed once payment is received (or immediately, for Cash on Delivery).
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Shipping &amp; Returns</h2>
              <p>
                See our full <a href="/shipping" className="text-gold hover:text-gold-light">Shipping &amp; Returns</a> policy
                for delivery timelines and return eligibility.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Product Authenticity</h2>
              <p>
                Every PakAuraa fragrance is formulated, blended, and quality-checked in-house in Pakistan. Product
                descriptions, notes, and performance ratings (longevity/projection) are provided as a guide and may
                vary based on individual skin chemistry and environment.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Account Use</h2>
              <p>
                You&apos;re responsible for keeping your account credentials secure and for all activity under your
                account. Please notify us immediately of any unauthorized use.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Changes to These Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of the site after changes are posted
                constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Contact</h2>
              <p>
                Questions about these terms can be sent to{" "}
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
