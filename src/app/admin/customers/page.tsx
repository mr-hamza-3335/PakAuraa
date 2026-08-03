"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

interface Customer {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  role: string;
  joinedAt: string;
  orderCount: number;
  totalSpent: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load customers.");
        setCustomers(body.customers);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customers."));
  }, []);

  return (
    <div>
      <h1 className="font-display text-[28px] text-cream mb-1" style={{ fontFamily: "var(--font-display-family)" }}>Customers</h1>
      <p className="text-[12px] text-warm-gray mb-8" style={{ fontFamily: "var(--font-body-family)" }}>
        {customers ? `${customers.length} account${customers.length === 1 ? "" : "s"} registered.` : "Every account signed up on PakAuraa."}
      </p>

      {error ? (
        <p className="text-[12px] text-red-300" style={{ fontFamily: "var(--font-body-family)" }}>{error}</p>
      ) : !customers ? (
        <p className="text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>Loading…</p>
      ) : customers.length === 0 ? (
        <p className="text-[12px] text-muted" style={{ fontFamily: "var(--font-body-family)" }}>No accounts yet.</p>
      ) : (
        <div className="border border-gold/12 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse">
            <thead>
              <tr className="border-b border-gold/12">
                {["Name", "Email", "Phone", "Joined", "Orders", "Total Spent (PKR)", "Role"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] text-muted tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {customers.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-[12px] text-cream whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.fullName ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-warm-gray whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[12px] text-warm-gray whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-[11px] text-muted whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{new Date(c.joinedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-[12px] text-cream whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.orderCount}</td>
                  <td className="px-4 py-3 text-[12px] text-gold whitespace-nowrap" style={{ fontFamily: "var(--font-body-family)" }}>{c.totalSpent.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 text-[9px] text-gold tracking-wider uppercase border border-gold/30 px-2 py-1" style={{ fontFamily: "var(--font-body-family)" }}>
                        <ShieldCheck size={11} strokeWidth={1.5} /> Admin
                      </span>
                    ) : (
                      <span className="text-[9px] text-warm-gray tracking-wider uppercase" style={{ fontFamily: "var(--font-body-family)" }}>Customer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
