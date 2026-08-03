import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** Redeems loyalty points against an order. Re-sums the ledger server-side —
 * never trusts a client-supplied balance — so a forged request can't spend
 * more points than the account actually has. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not available." }, { status: 503 });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { points, orderId } = await req.json();
  if (!Number.isInteger(points) || points <= 0 || !orderId) {
    return NextResponse.json({ error: "Invalid redemption request." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not available." }, { status: 503 });

  const { data: ledger } = await admin.from("loyalty_ledger").select("points").eq("user_id", userData.user.id);
  const balance = (ledger ?? []).reduce((sum, r) => sum + r.points, 0);

  if (points > balance) {
    return NextResponse.json({ error: "Not enough points." }, { status: 400 });
  }

  const { error } = await admin.from("loyalty_ledger").insert({
    user_id: userData.user.id,
    order_id: orderId,
    points: -points,
    reason: "redeemed",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, newBalance: balance - points });
}
