import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/**
 * Every signed-up account, merged from three sources: auth.users (email —
 * not exposed via the public schema, so this must run server-side with the
 * service role), profiles (name/phone/role), and orders (spend per customer).
 * Used by the admin Customers page and the dashboard's "Total Customers" card.
 */
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const users: { id: string; email: string | null; created_at: string }[] = [];
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    users.push(...data.users.map((u) => ({ id: u.id, email: u.email ?? null, created_at: u.created_at })));
    if (data.users.length < 200) break;
    page++;
  }

  const [{ data: profiles }, { data: orders }] = await Promise.all([
    admin.from("profiles").select("id, full_name, phone, role, created_at"),
    admin.from("orders").select("user_id, total"),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const orderStats = new Map<string, { count: number; total: number }>();
  for (const o of orders ?? []) {
    if (!o.user_id) continue;
    const cur = orderStats.get(o.user_id) ?? { count: 0, total: 0 };
    cur.count += 1;
    cur.total += o.total;
    orderStats.set(o.user_id, cur);
  }

  const customers = users
    .map((u) => {
      const profile = profileById.get(u.id);
      const stats = orderStats.get(u.id) ?? { count: 0, total: 0 };
      return {
        id: u.id,
        email: u.email,
        fullName: profile?.full_name ?? null,
        phone: profile?.phone ?? null,
        role: profile?.role ?? "customer",
        joinedAt: profile?.created_at ?? u.created_at,
        orderCount: stats.count,
        totalSpent: stats.total,
      };
    })
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime());

  return NextResponse.json({ customers });
}
