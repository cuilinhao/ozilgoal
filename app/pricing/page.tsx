import { getTranslations, localizeMetadata } from "@/lib/i18n/server";
import { localizePageContent } from "@/components/sections/localized-page-content";
import { PricingCards } from "@/components/pricing-cards";
import { CheckoutReturnStatus } from "@/components/ui/checkout-return-status";

export async function generateMetadata() { return localizeMetadata({ title: "Pricing", description: "Compare one-time credit packs for Ozil Goal Generator. Each 15-second AI football video costs 300 credits." }); }

export default async function PricingPage() {
  const t = await getTranslations();
  return localizePageContent(<section className="pricing-page"><div className="section-container">
    <h1>Ozil Goal Generator <span className="gradient-text">Pricing and Credit Packs</span></h1>
    <p className="pricing-page-intro">Choose a one-time credit pack for your AI football videos. Each video uses 300 credits. No subscription or automatic renewal.</p>
    <CheckoutReturnStatus/>
    <PricingCards/>
  </div></section>, t);
}
