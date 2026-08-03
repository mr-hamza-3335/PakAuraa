import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendLowStockAlertEmail } from "@/lib/email";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/** Called by the admin Products page when a save crosses a product's stock
 * from above the low-stock threshold down to at or below it. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { productName, stock } = await req.json();
  if (!productName || typeof stock !== "number") {
    return NextResponse.json({ error: "productName and stock are required." }, { status: 400 });
  }

  sendLowStockAlertEmail(productName, stock).catch(() => {});
  return NextResponse.json({ ok: true });
}
