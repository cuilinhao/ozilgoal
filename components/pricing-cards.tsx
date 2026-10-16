"use client";

import { useState } from "react";
import { creditPacks, type PackId } from "@/content/pricing";
import { useAuth } from "./auth-provider";
import { useLocale, useTranslations } from "@/components/i18n/locale-provider";
import { requestCheckout } from "./ui/checkout-request";
import { OZIL_GOAL_CONFIG, OZIL_GOAL_COST } from "@/lib/ozil-goal";
import { productCopy } from '@/lib/ozil-product';
import Link from './i18n/localized-link';

const starterCredits = creditPacks.find((pack) => pack.id === "starter")!.credits;
const defaultPackId: PackId = creditPacks.find((pack) => pack.recommended)?.id ?? creditPacks[0].id;

export function PricingCards() {
  const t = useTranslations();
  const locale = useLocale();
  const { user, refresh } = useAuth();
  const [selected, setSelected] = useState<PackId>(defaultPackId);
  const [busy, setBusy] = useState<PackId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  async function buy(packId: PackId) {
    setError(null);
    setCheckoutUrl(null);
    setBusy(packId);
    try {
      const url = await requestCheckout(packId, locale);
      setCheckoutUrl(url);
      // Some browsers block async popups; noopener can also return null after
      // opening successfully. Always keep a direct link to the same checkout.
      try { window.open(url, "_blank", "noopener,noreferrer"); } catch { /* The direct link remains available. */ }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Checkout is unavailable right now. Please try again later.");
    } finally {
      setBusy(null);
      // Checkout without a session creates a guest account for this browser.
      if (!user) void refresh();
    }
  }

  return <div>
    <div className="pricing-grid">{creditPacks.map((pack) => <article className={`pricing-card ${selected === pack.id ? "selected" : ""}`} key={pack.id} onClick={() => setSelected(pack.id)} onFocus={() => setSelected(pack.id)}>
      <div className="pricing-card-top"><h3>{t(pack.name)}</h3>{pack.recommended && <span className="recommended-badge">{t("Recommended")}</span>}</div>
      <div className="price">${pack.price.toFixed(2)}</div><p className="unit-price">{t("${price} / credit", { price: pack.unitPrice })}</p>
      <div className="credit-summary"><strong>{t("{credits} credits", { credits: pack.credits.toLocaleString(locale) })}</strong><span>{t("Ozil goal videos: {videos}", { videos: Math.floor(pack.credits / OZIL_GOAL_COST) })}</span></div>
      <ul className="pack-inclusions"><li><b>{t("Included")}</b> {t("{credits} credits", { credits: pack.credits.toLocaleString(locale) })}</li><li><b>{t("Included")}</b> {t("Ozil Goal Generator")}</li><li><b>{t("Included")}</b> {t("No added watermark")}</li><li><b>{t("Included")}</b> {t(pack.description)}</li></ul>
      <button className="buy-button" disabled={busy !== null} onClick={() => void buy(pack.id)}>{busy === pack.id ? t("Opening checkout…") : t("Buy {pack}", { pack: t(pack.name) })}</button>
    </article>)}</div>
    <p className="pricing-payment-note">{t("Each Ozil goal video costs {credits} credits ({duration} seconds, {aspect}, {resolution}, with sound), so the {starterCredits}-credit Starter pack covers one Ozil video.", { credits: OZIL_GOAL_COST, duration: OZIL_GOAL_CONFIG.duration, aspect: OZIL_GOAL_CONFIG.aspect, resolution: OZIL_GOAL_CONFIG.resolution, starterCredits })}<br/>{t("Secure checkout by Stripe. One-time purchase. No subscription.")}</p>
    {(!user || user.guest) && <div className="pricing-access-note"><p><strong>{t(productCopy.guestSummary)}</strong> {t(productCopy.guestAccess)}</p><p>{t(productCopy.accountHelp)}</p></div>}
    <p className="pricing-access-note">{t(productCopy.refund)} <Link href="/refund-policy">{t(productCopy.refundLink)}</Link></p>
    {checkoutUrl && <div className="mi-checkout-return" role="status"><strong>{t("Checkout ready")}</strong><p>{t("If a new tab did not open, use the secure link below to continue your purchase.")}</p><a href={checkoutUrl} target="_blank" rel="noopener noreferrer">{t("Continue to Stripe checkout (opens in a new tab)")}</a></div>}
    {error && <p className="pricing-error" role="alert">{t(error)}</p>}
  </div>;
}
