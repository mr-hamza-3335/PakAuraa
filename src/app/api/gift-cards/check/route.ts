import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * Looks up a gift card's full details for the "Check a Gift Card" page.
 * Requires the recipient's name as well as the code — a lighter check than
 * order lookups (no email needed), but still means a bare code alone can't
 * be used to browse someone else's card details.
 */
export async function POST(req: NextRequest) {
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ valid: false, error: "Gift cards aren't available right now." }, { status: 503 });

  const { code, name } = await req.json();
  if (!code || typeof code !== "string" || !name || typeof name !== "string") {
    return NextResponse.json({ valid: false, error: "Enter the gift card code and the recipient's name." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("gift_cards")
    .select("code, initial_amount, balance, recipient_name, sender_name, message, active, created_at")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  // Verification always requires a name match — never a free pass on the
  // code alone. The recipient's name is the primary check; if the buyer
  // never set one at purchase, fall back to requiring the sender's name.
  // Kept as one generic error below (regardless of which check failed) so
  // the response never reveals whether a guessed code actually exists.
  const requiredName = data?.recipient_name || data?.sender_name;
  const nameMatches = !!requiredName && requiredName.trim().toLowerCase() === name.trim().toLowerCase();

  if (error || !data || !nameMatches) {
    return NextResponse.json({ valid: false, error: "We couldn't find a gift card matching that code and name." }, { status: 404 });
  }

  return NextResponse.json({
    valid: true,
    card: {
      code: data.code,
      initialAmount: data.initial_amount,
      balance: data.balance,
      recipientName: data.recipient_name,
      senderName: data.sender_name,
      message: data.message,
      active: data.active,
      createdAt: data.created_at,
    },
  });
}
