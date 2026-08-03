export const DEFAULT_COMMISSION_RATE = 0.01;
export const REFERRAL_STORAGE_KEY = "pk_ref";

export function generateAffiliateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
