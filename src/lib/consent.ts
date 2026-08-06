export type ConsentState = "pending" | "granted" | "denied";

const STORAGE_KEY = "pk_consent";
const CHANGE_EVENT = "pk-consent-change";

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return "pending";
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw === "granted" || raw === "denied" ? raw : "pending";
}

export function setConsent(state: "granted" | "denied") {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, state);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Fires whenever consent changes in this tab (setConsent) or another tab (storage event). */
export function onConsentChange(callback: (state: ConsentState) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback(getConsent());
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
