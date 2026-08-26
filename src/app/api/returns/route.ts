import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ReturnRequest {
  orderId: string;
  productId: string;
  productName: string;
  customerEmail: string;
  customerNote?: string;
  reason: string;
}

/** A customer requests a return for a specific product from a delivered order.
 * The order must be within 7 days of delivery.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Backend not configured." },
        { status: 503 }
      );
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json(
        { error: "Sign in required." },
        { status: 401 }
      );
    }

    const { orderId, productId, productName, customerEmail, customerNote, reason } =
      body as ReturnRequest;

    if (!orderId || !productId || !productName || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    if (reason === "") {
      return NextResponse.json(
        { error: "Please select a reason." },
        { status: 400 }
      );
    }

    // Verify the order belongs to this user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    if (order.customer.email?.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Email doesn't match this order." },
        { status: 403 }
      );
    }

    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Returns are only available for delivered orders." },
        { status: 403 }
      );
    }

    // Check 7-day return window from delivery date
    const deliveredAt = order.delivered_at ? new Date(order.delivered_at) : new Date();
    const now = new Date();
    const diffMs = now.getTime() - deliveredAt.getTime();
    const daysSinceDelivery = diffMs / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      const remaining = 7 - Math.round(daysSinceDelivery);
      return NextResponse.json(
        { error: `Return window exceeded. You have ${remaining > 0 ? remaining + " days remaining" : "window closed"} ` },
        { status: 403 }
      );
    }

    // Check if a return request already exists for this product in this order
    const { data: existingReturn } = await supabase
      .from("return_requests")
      .select("*")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingReturn) {
      return NextResponse.json(
        { error: "A return request already exists for this product." },
        { status: 409 }
      );
    }

    // Create the return request
    const { error: returnError } = await supabase.from("return_requests").insert({
      order_id: orderId,
      customer_id: userData.user.id,
      customer_email: customerEmail,
      product_id: productId,
      product_name: productName,
      reason,
      customer_note: customerNote ?? null,
      status: "pending",
      refund_amount: 0, // Admin will set this when resolving
      created_at: new Date().toISOString(),
    });

    if (returnError) {
      return NextResponse.json(
        { error: returnError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Return request submitted successfully. An admin will review it within 24 hours.",
    });
  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}