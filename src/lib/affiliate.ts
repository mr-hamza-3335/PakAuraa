import { randomBytes } from "crypto";

export const DEFAULT_COMMISSION_RATE = 0.01;
export const REFERRAL_STORAGE_KEY = "pk_ref";

export function generateAffiliateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}
