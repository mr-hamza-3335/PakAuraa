import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * JazzCash merchant integration (Mobile Wallet / Page Redirect API).
 * Requires JAZZCASH_MERCHANT_ID + JAZZCASH_PASSWORD + JAZZCASH_INTEGRITY_SALT
 * from https://sandbox.jazzcash.com.pk merchant onboarding.
 * Until those are set, we tell the client honestly rather than faking success.
 */
export async function POST(req: NextRequest) {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID;
  const password = process.env.JAZZCASH_PASSWORD;
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT;

  if (!merchantId || !password || !integritySalt) {
    return NextResponse.json(
      {
        error:
          "JazzCash is not configured yet. Add JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD and JAZZCASH_INTEGRITY_SALT to your environment to enable it.",
      },
      { status: 503 }
    );
  }

  const { amount, orderId, returnUrl } = await req.json();

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000);

  // JazzCash Mobile Wallet / Page Redirect API — every pp_ field (except
  // pp_SecureHash itself) is included in the hash, sorted alphabetically by
  // key, HMAC-SHA256'd with the integrity salt prefixed as the HMAC key data.
  const fields: Record<string, string> = {
    pp_Amount: String(Math.round(amount * 100)),
    pp_BillReference: orderId,
    pp_Description: "PakAuraa order payment",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_ReturnURL: returnUrl ?? "",
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: fmt(now),
    pp_TxnExpiryDateTime: fmt(expiry),
    pp_TxnRefNo: orderId,
    pp_TxnType: "MWALLET",
    pp_Version: "1.1",
  };
  const sortedValues = Object.keys(fields)
    .sort()
    .map((k) => fields[k])
    .join("&");
  const secureHash = crypto
    .createHmac("sha256", integritySalt)
    .update(`${integritySalt}&${sortedValues}`)
    .digest("hex");

  const jazzcashEndpoint =
    process.env.JAZZCASH_ENV === "production"
      ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform"
      : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform";

  return NextResponse.json({
    redirectUrl: jazzcashEndpoint,
    fields: { ...fields, pp_SecureHash: secureHash },
  });
}
