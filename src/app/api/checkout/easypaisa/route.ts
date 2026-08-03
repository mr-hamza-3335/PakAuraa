import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * EasyPaisa (Telenor Microfinance Bank) merchant integration — "easypay"
 * hosted checkout (Page Redirect) flow.
 *
 * Field names and the AES-256-CBC request-hashing scheme below follow
 * EasyPaisa's publicly documented easypay integration (storeId + IV derived
 * from it, hashKey as the cipher key, sorted key=value pairs). EasyPaisa
 * hands each merchant an integration PDF at onboarding that occasionally
 * differs in details (IV padding, optional fields) — confirm against that
 * doc and test in their sandbox once EASYPAISA_STORE_ID/HASH_KEY are real;
 * this has not been verified against a live sandbox.
 */
export async function POST(req: NextRequest) {
  const storeId = process.env.EASYPAISA_STORE_ID;
  const hashKey = process.env.EASYPAISA_HASH_KEY;

  if (!storeId || !hashKey) {
    return NextResponse.json(
      {
        error:
          "EasyPaisa is not configured yet. Add EASYPAISA_STORE_ID and EASYPAISA_HASH_KEY to your environment to enable it.",
      },
      { status: 503 }
    );
  }

  const { amount, orderId, mobileAccountNo, returnUrl } = await req.json();

  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const expiryDate = `${expiry.getFullYear()}${pad(expiry.getMonth() + 1)}${pad(expiry.getDate())} ${pad(expiry.getHours())}:${pad(expiry.getMinutes())}:${pad(expiry.getSeconds())}`;

  const fields: Record<string, string> = {
    amount: amount.toFixed(2),
    autoRedirect: "1",
    emailAddress: "",
    expiryDate,
    mobileNum: mobileAccountNo ?? "",
    orderRefNum: orderId,
    paymentMethod: "MA_PAYMENT_METHOD",
    postBackURL: returnUrl ?? "",
    storeId,
  };

  const sortedPairs = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("&");

  const key = crypto.createHash("sha256").update(hashKey).digest();
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const merchantHashedReq = Buffer.concat([cipher.update(sortedPairs, "utf8"), cipher.final()]).toString("base64");

  const easypaisaEndpoint =
    process.env.EASYPAISA_ENV === "production"
      ? "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
      : "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";

  return NextResponse.json({
    redirectUrl: easypaisaEndpoint,
    fields: { ...fields, merchantHashedReq },
  });
}
