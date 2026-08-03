import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ valid: false, error: "Gift cards aren't available right now." }, { status: 503 });

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, error: "Enter a gift card code." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("gift_cards")
    .select("code, balance, active")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (error || !data || !data.active) {
    return NextResponse.json({ valid: false, error: "That gift card code isn't valid." }, { status: 404 });
  }
  if (data.balance <= 0) {
    return NextResponse.json({ valid: false, error: "That gift card has no remaining balance." }, { status: 404 });
  }

  return NextResponse.json({ valid: true, code: data.code, balance: data.balance });
}
