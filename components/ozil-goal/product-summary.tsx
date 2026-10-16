import { translate } from '@/lib/i18n';
import { localizeHref, type Locale } from '@/lib/i18n/routing';
import { ozilProductFacts, productCopy } from '@/lib/ozil-product';

export function ProductSummary({ locale }: { locale: Locale }) {
  const t = (source: string) => translate(locale, source, ozilProductFacts);
  return <section className="og-product-summary" aria-labelledby="product-facts-title">
    <div className="og-container">
      <h2 id="product-facts-title">{t(productCopy.title)}</h2>
      <div className="og-product-facts">
        <div><h3>{t(productCopy.output)}</h3><p className="og-product-value">{t(productCopy.outputValue)}</p><p>{t(productCopy.scope)}</p></div>
        <div><h3>{t(productCopy.price)}</h3><p className="og-product-value">{t(productCopy.priceValue)}</p><p>{t(productCopy.videoCount)}</p><p>{t(productCopy.oneTime)}</p><a href={localizeHref('/pricing', locale)}>{t(productCopy.pricingLink)}</a></div>
        <div><h3>{t(productCopy.guest)}</h3><p className="og-product-value">{t(productCopy.guestSummary)}</p><p>{t(productCopy.guestAccess)}</p></div>
        <div><h3>{t(productCopy.refunds)}</h3><p>{t(productCopy.refund)}</p><a href={localizeHref('/refund-policy', locale)}>{t(productCopy.refundLink)}</a></div>
      </div>
      <p className="og-product-access">{t(productCopy.accountHelp)}</p>
      <p className="og-product-privacy">{t(productCopy.privacy)} <a href={localizeHref('/privacy-policy#retention-and-international-processing', locale)}>{t(productCopy.privacyLink)}</a></p>
    </div>
  </section>;
}
