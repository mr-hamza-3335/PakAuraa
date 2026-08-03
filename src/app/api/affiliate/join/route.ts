import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { generateAffiliateCode, DEFAULT_COMMISSION_RATE } from "@/lib/affiliate";

/** Self-serve affiliate signup — any signed-in customer can generate a
 * referral code. Retries on the rare code collision. */
export async function POST() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Not available." }, { status: 503 });

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Not available." }, { status: 503 });

  const { data: existing } = await admin.from("affiliates").select("code").eq("user_id", userData.user.id).maybeSingle();
  if (existing) return NextResponse.json({ code: existing.code });

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAffiliateCode();
    const { error } = await admin.from("affiliates").insert({
      user_id: userData.user.id,
      code,
      commission_rate: DEFAULT_COMMISSION_RATE,
    });
    if (!error) return NextResponse.json({ code });
    if (!error.message.includes("duplicate")) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ error: "Couldn't generate a unique code — try again." }, { status: 500 });
}
