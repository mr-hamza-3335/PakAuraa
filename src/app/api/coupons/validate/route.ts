import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Validates a coupon code without exposing the full coupons table to the
 * browser — coupons are admin-only under RLS, so this uses the service-role
 * client the same way /api/orders does.
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ valid: false, error: "Coupons aren't available right now." }, { status: 503 });
  }

  const { code, orderTotal } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, error: "Enter a coupon code." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("coupons")
    .select("code, percent_off, active, expires_at, min_order_value, max_uses, used_count")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !data || !data.active) {
    return NextResponse.json({ valid: false, error: "That coupon code isn't valid." }, { status: 404 });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "That coupon has expired." }, { status: 404 });
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ valid: false, error: "That coupon has reached its usage limit." }, { status: 404 });
  }

  if (data.min_order_value > 0 && (typeof orderTotal !== "number" || orderTotal < data.min_order_value)) {
    return NextResponse.json(
      { valid: false, error: `This coupon requires a minimum order of PKR ${data.min_order_value.toLocaleString()}.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ valid: true, code: data.code, percentOff: data.percent_off });
}
