import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ affiliate: null });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ affiliate: null });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ affiliate: null });

  const { data: affiliate } = await admin.from("affiliates").select("code, commission_rate").eq("user_id", userData.user.id).maybeSingle();
  if (!affiliate) return NextResponse.json({ affiliate: null });

  const { data: commissions } = await admin
    .from("affiliate_commissions")
    .select("amount, status")
    .eq("affiliate_user_id", userData.user.id);

  const pending = (commissions ?? []).filter((c) => c.status === "pending").reduce((sum, c) => sum + c.amount, 0);
  const paid = (commissions ?? []).filter((c) => c.status === "paid").reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({
    affiliate: {
      code: affiliate.code,
      commissionRate: affiliate.commission_rate,
      pending,
      paid,
      referrals: commissions?.length ?? 0,
    },
  });
}
