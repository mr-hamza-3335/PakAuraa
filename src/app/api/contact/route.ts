import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendContactMessageAlertEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const trimmedMessage = message.trim();

  const admin = createAdminClient();
  let persisted = false;
  if (admin) {
    const { error } = await admin.from("contact_messages").insert({
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
    });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    persisted = true;
  }

  // Best-effort — the message is already saved (or the user was told it
  // wasn't), so a slow/failed notification email shouldn't fail the request.
  sendContactMessageAlertEmail(trimmedName, trimmedEmail, trimmedMessage).catch(() => {});

  return NextResponse.json({ ok: true, persisted });
}
