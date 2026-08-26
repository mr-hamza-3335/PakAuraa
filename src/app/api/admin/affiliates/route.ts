import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { data: affiliates } = await admin.from("affiliates").select("user_id, code, commission_rate, created_at");
  const { data: commissions } = await admin.from("affiliate_commissions").select("affiliate_user_id, amount, status, cancelled");

  const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailById = new Map(users.users.map((u) => [u.id, u.email]));

  const rows = (affiliates ?? []).map((a) => {
    const mine = (commissions ?? []).filter((c) => c.affiliate_user_id === a.user_id);
    return {
      userId: a.user_id,
      email: emailById.get(a.user_id) ?? null,
      code: a.code,
      commissionRate: a.commission_rate,
      pending: mine.filter((c) => c.status === "pending" && !c.cancelled).reduce((s, c) => s + c.amount, 0),
      available: mine.filter((c) => c.status === "available" && !c.cancelled).reduce((s, c) => s + c.amount, 0),
      paid: mine.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0),
      cancelled: mine.filter((c) => c.cancelled || c.status === "cancelled").reduce((s, c) => s + c.amount, 0),
      referrals: mine.length,
      joinedAt: a.created_at,
    };
  });

  return NextResponse.json({ affiliates: rows });
}

/** Marks all available commissions for one affiliate as paid — the affiliate
 * can withdraw once the 10-day hold has elapsed. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId is required." }, { status: 400 });

  const { error } = await admin
    .from("affiliate_commissions")
    .update({ status: "paid" })
    .eq("affiliate_user_id", userId)
    .eq("status", "available");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
