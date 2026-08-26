import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  return profile?.role === "admin";
}

/** Admin lists all return requests, newest first. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { data, error } = await admin
    .from("return_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ returns: data ?? [] });
}

/** Admin resolves a return request — approve, reject, or complete.
 * On "completed", any affiliate commission tied to the order/product is
 * reversed (status → cancelled) so the affiliate can see it was clawed back
 * due to a return, and the refund amount is recorded.
 */
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Admin access required." }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Backend not configured." }, { status: 503 });

  const { id, status, refundAmount, adminNote } = await req.json();
  if (!id || !status) return NextResponse.json({ error: "id and status are required." }, { status: 400 });

  const validStatuses = ["pending", "approved", "rejected", "completed"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { status, admin_note: adminNote ?? null, resolved_at: now };

  if (status === "approved" || status === "rejected" || status === "completed") {
    update.resolved_by = "admin";
  }

  if (status === "completed" && refundAmount !== undefined && refundAmount > 0) {
    update.refund_amount = refundAmount;
  }

  const { data: returnRow, error: fetchError } = await admin
    .from("return_requests")
    .select("order_id, product_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !returnRow) {
    return NextResponse.json({ error: "Return request not found." }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("return_requests")
    .update(update)
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // On completion, reverse any affiliate commission and loyalty points for this order.
  if (status === "completed") {
    // Reverse affiliate commissions
    const { data: commissions } = await admin
      .from("affiliate_commissions")
      .select("id, order_id, status")
      .eq("order_id", returnRow.order_id)
      .in("status", ["pending", "available"]);

    for (const c of commissions ?? []) {
      if (c.status === "pending" || c.status === "available") {
        await admin
          .from("affiliate_commissions")
          .update({
            status: "cancelled",
            cancelled: true,
            cancel_reason: "Customer returned the product — commission reversed.",
            cancelled_at: now,
          })
          .eq("id", c.id);
      }
    }

    // Reverse loyalty points for this order (if they were already earned).
    // Points for a returned order should never be redeemable — insert an
    // adjustment to zero them out.
    const { data: ledgerRows } = await admin
      .from("loyalty_ledger")
      .select("id, points, reason")
      .eq("order_id", returnRow.order_id)
      .in("reason", ["pending", "earned"]);

    for (const row of ledgerRows ?? []) {
      if (row.reason === "pending") {
        // Order was never paid — just delete the pending row so it never becomes earned
        await admin.from("loyalty_ledger").delete().eq("id", row.id);
      } else if (row.reason === "earned") {
        // Order was paid — reverse with an adjustment row
        await admin.from("loyalty_ledger").insert({
          user_id: (await admin.from("loyalty_ledger").select("user_id").eq("id", row.id).single()).data?.user_id ?? null,
          order_id: returnRow.order_id,
          points: -row.points,
          reason: "adjustment",
        });
      }
    }
  }

  return NextResponse.json({ ok: true });
}