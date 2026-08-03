import { AlertCircle } from "lucide-react";

export default function NotConfiguredNotice() {
  return (
    <div className="flex items-start gap-3 p-4 border border-gold/25 bg-gold/5 text-warm-gray text-[12px] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
      <AlertCircle size={15} className="text-gold flex-shrink-0 mt-0.5" />
      <span>
        Accounts aren&apos;t connected yet. Add <code className="text-gold">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="text-gold">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment (see{" "}
        <code className="text-gold">supabase/schema.sql</code>) to enable sign-in.
      </span>
    </div>
  );
}
