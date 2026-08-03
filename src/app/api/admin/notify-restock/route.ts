import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendBackInStockEmail } from "@/lib/email";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/** Called by the admin Products page when a product's stock crosses 0 -> positive.
 * Emails everyone waiting on stock_notifications for that product, then marks them notified. */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { productId, productName } = await req.json();
  if (!productId || !productName) {
    return NextResponse.json({ error: "productId and productName are required." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true, notified: 0 });

  const { data: waiting } = await admin
    .from("stock_notifications")
    .select("id, email")
    .eq("product_id", productId)
    .eq("notified", false);

  if (!waiting || waiting.length === 0) return NextResponse.json({ ok: true, notified: 0 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pakauraa.com";
  const productUrl = `${siteUrl}/products/${productId}`;

  await Promise.all(waiting.map((w) => sendBackInStockEmail(w.email, productName, productUrl).catch(() => {})));

  await admin
    .from("stock_notifications")
    .update({ notified: true })
    .in("id", waiting.map((w) => w.id));

  return NextResponse.json({ ok: true, notified: waiting.length });
}
