import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-32 pb-24 bg-obsidian min-h-screen">
        <div className="max-w-[720px] mx-auto px-6 lg:px-12">
          <p className="text-[9px] text-gold tracking-[0.35em] uppercase mb-3" style={{ fontFamily: "var(--font-body-family)" }}>Policy</p>
          <h1 className="font-display text-[clamp(28px,4vw,44px)] text-cream mb-4" style={{ fontFamily: "var(--font-display-family)" }}>
            Privacy Policy
          </h1>
          <p className="text-[12px] text-muted mb-12" style={{ fontFamily: "var(--font-body-family)" }}>Last updated: 2026</p>

          <div className="space-y-10 text-[14px] text-warm-gray leading-[1.9]" style={{ fontFamily: "var(--font-body-family)" }}>
            <section>
              <h2 className="text-[15px] text-cream mb-3">Information We Collect</h2>
              <p>
                When you create an account, place an order, subscribe to our newsletter, or contact us, we collect the
                information you provide directly — such as your name, email address, phone number, shipping address, and
                order details. We do not collect or store payment card details; card payments are processed securely by
                Stripe, our payment processor.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">How We Use Your Information</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>To process and deliver your orders, and to communicate order status and updates.</li>
                <li>To respond to support and contact requests.</li>
                <li>To send newsletter updates, if you&apos;ve subscribed — you can unsubscribe at any time.</li>
                <li>To improve our products, storefront, and customer experience.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Data Sharing</h2>
              <p>
                We do not sell your personal information. We share the minimum necessary data with trusted third parties
                that help us operate the store — including payment processing (Stripe), backend infrastructure
                (Supabase), and delivery/courier partners — solely to fulfil your orders and provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Your Rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data at any time by contacting us
                at <a href="mailto:ameerhamza94572@gmail.com" className="text-gold hover:text-gold-light">ameerhamza94572@gmail.com</a>.
                Account holders can also review and update their information from the Account page.
              </p>
            </section>

            <section>
              <h2 className="text-[15px] text-cream mb-3">Contact</h2>
              <p>
                Questions about this policy can be sent to{" "}
                <a href="mailto:ameerhamza94572@gmail.com" className="text-gold hover:text-gold-light">ameerhamza94572@gmail.com</a> or
                via the <a href="/contact" className="text-gold hover:text-gold-light">Contact page</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
