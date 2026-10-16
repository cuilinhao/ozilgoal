import { getTranslations, localizeMetadata } from "@/lib/i18n/server";
import { localizePageContent } from "@/components/sections/localized-page-content";
import { PricingCards } from "@/components/pricing-cards";
import { CheckoutReturnStatus } from "@/components/ui/checkout-return-status";
import { ozilProductFacts, productCopy } from '@/lib/ozil-product';

export async function generateMetadata() { return localizeMetadata({ title: "Pricing", description: productCopy.pricingMetadata }); }

export default async function PricingPage() {
  const t = await getTranslations();
  return localizePageContent(<section className="pricing-page"><div className="section-container">
    <h1>Ozil Goal Generator <span className="gradient-text">Pricing and Credit Packs</span></h1>
    <p className="pricing-page-intro">{t(productCopy.pricingIntro, ozilProductFacts)}</p>
    <CheckoutReturnStatus/>
    <PricingCards/>
  </div></section>, t);
}
