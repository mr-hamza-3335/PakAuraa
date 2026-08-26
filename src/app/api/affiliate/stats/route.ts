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
    .select("id, order_id, amount, status, earned_at, available_at, cancelled, cancel_reason, cancelled_at")
    .eq("affiliate_user_id", userData.user.id)
    .order("earned_at", { ascending: false });

  const pending = (commissions ?? [])
    .filter((c) => c.status === "pending" && !c.cancelled)
    .reduce((sum, c) => sum + c.amount, 0);

  const available = (commissions ?? [])
    .filter((c) => c.status === "available" && !c.cancelled)
    .reduce((sum, c) => sum + c.amount, 0);

  const paid = (commissions ?? [])
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  const cancelled = (commissions ?? [])
    .filter((c) => c.status === "cancelled" || c.cancelled)
    .reduce((sum, c) => sum + c.amount, 0);

  return NextResponse.json({
    affiliate: {
      code: affiliate.code,
      commissionRate: affiliate.commission_rate,
      pending,
      available,
      paid,
      cancelled,
      referrals: (commissions ?? []).length,
      commissionHistory: (commissions ?? []).map((c) => ({
        id: c.id,
        orderId: c.order_id,
        amount: c.amount,
        status: c.status,
        earnedAt: c.earned_at,
        availableAt: c.available_at,
        cancelled: c.cancelled,
        cancelReason: c.cancel_reason,
        cancelledAt: c.cancelled_at,
      })),
    },
  });
}
