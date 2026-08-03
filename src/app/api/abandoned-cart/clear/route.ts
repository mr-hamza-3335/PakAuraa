import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Marks a tracked cart recovered once the customer actually completes an
 * order, so the cron never sends them a reminder for a cart they already bought. */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true });

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required." }, { status: 400 });

  await admin.from("abandoned_carts").update({ recovered: true }).eq("email", email.toLowerCase()).eq("recovered", false);
  return NextResponse.json({ ok: true });
}
