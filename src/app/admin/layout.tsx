"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Tag, Star, ShieldAlert, Users, Gift, Share2, BookOpen, Mail, Send, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const navItems = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products & Inventory", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", Icon: Users },
  { href: "/admin/coupons", label: "Coupons", Icon: Tag },
  { href: "/admin/gift-cards", label: "Gift Cards", Icon: Gift },
  { href: "/admin/affiliates", label: "Affiliates", Icon: Share2 },
  { href: "/admin/journal", label: "Journal", Icon: BookOpen },
  { href: "/admin/press", label: "Press & Media", Icon: Newspaper },
  { href: "/admin/reviews", label: "Reviews", Icon: Star },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/subscribers", label: "Subscribers", Icon: Send },
];

type AccessState = "checking" | "no-backend" | "signed-out" | "not-admin" | "granted";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [access, setAccess] = useState<AccessState>("checking");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No backend configured — immediate synchronous fallback, not a fetch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccess("no-backend");
      return;
    }
    const supabase = createClient()!;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setAccess("signed-out");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      setAccess(profile?.role === "admin" ? "granted" : "not-admin");
    });
  }, []);

  if (access !== "granted") {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
        <div className="max-w-[440px] text-center">
          <ShieldAlert size={28} className="text-gold mx-auto mb-5" strokeWidth={1.2} />
          <h1 className="font-display text-[22px] text-cream mb-3" style={{ fontFamily: "var(--font-display-family)" }}>
            Admin Panel
          </h1>
          <p className="text-[13px] text-warm-gray leading-relaxed mb-6" style={{ fontFamily: "var(--font-body-family)" }}>
            {access === "checking" && "Checking access…"}
            {access === "no-backend" &&
              "Connect Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) and run supabase/schema.sql, then promote your account's profiles.role to 'admin'."}
            {access === "signed-out" && "Sign in with an admin account to continue."}
            {access === "not-admin" && "Your account doesn't have admin access. Ask an existing admin to set your profiles.role to 'admin'."}
          </p>
          {access === "signed-out" && (
            <Link href="/account/login" className="inline-block text-[11px] text-obsidian bg-gold px-6 py-3 tracking-[0.15em] uppercase" style={{ fontFamily: "var(--font-body-family)" }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian flex">
      <aside className="w-[240px] flex-shrink-0 border-r border-gold/10 bg-charcoal/30 hidden md:flex flex-col py-8">
        <p className="px-6 text-[10px] text-gold tracking-[0.3em] uppercase mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
          PakAuraa Admin
        </p>
        <nav className="space-y-1">
          {navItems.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-6 py-3 text-[12px] tracking-wide transition-colors ${
                  active ? "text-gold bg-gold/[0.06] border-r-2 border-gold" : "text-warm-gray hover:text-cream"
                }`}
                style={{ fontFamily: "var(--font-body-family)" }}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" className="mt-auto px-6 pt-8 text-[10px] text-muted hover:text-gold transition-colors" style={{ fontFamily: "var(--font-body-family)" }}>
          ← Back to Storefront
        </Link>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">{children}</main>
    </div>
  );
}
