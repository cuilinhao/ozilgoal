import { trustedCheckoutUrl } from "./checkout-url";

// Works with or without a session: the server creates a guest account for a
// visitor, so buying never requires sign-in. Returns a trusted Stripe address.
export async function requestCheckout(packId: string, locale: string): Promise<string> {
  const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packId, locale }) });
  const data: { checkoutUrl?: string; error?: string } = await response.json();
  if (!response.ok || !data.checkoutUrl) throw new Error(data.error || "Checkout is unavailable right now. Please try again later.");
  const url = trustedCheckoutUrl(data.checkoutUrl);
  if (!url) throw new Error("The payment service returned an invalid checkout address. Please try again later.");
  return url;
}
