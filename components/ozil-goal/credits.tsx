'use client';
import { useTranslations } from '@/components/i18n/locale-provider';
import Link from '@/components/i18n/localized-link';
import { OZIL_GOAL_COST } from '@/lib/ozil-goal';
import { ozilProductFacts, productCopy } from '@/lib/ozil-product';
import { creditPacks } from '@/content/pricing';
export function OzilCredits() {
  const t = useTranslations();
  const items = [
    { title: 'One video', description: t(productCopy.outputValue, ozilProductFacts), value: t('{credits} credits', { credits: OZIL_GOAL_COST }), action: 'Make my video', href: '/#generator' },
    { title: 'Your credits', description: t('{name} pack: USD {price} for {credits} credits. One-time purchase.', { name: t(creditPacks[0].name), price: (creditPacks[0].amountCents / 100).toFixed(2), credits: creditPacks[0].credits }), value: 'One balance', action: 'View credit packs', href: '/pricing' },
    { title: 'Your videos', description: productCopy.downloadNotice, value: 'My videos', action: 'Open my videos', href: '/app/my-videos' },
  ];
  return <section id="pricing" className="border-t border-[var(--og-line)] bg-[var(--og-bg-deep)] py-16 sm:py-20"><div className="og-container"><div className="mb-8 max-w-2xl"><p className="og-kicker mb-2">{t("The menu")}</p><h2 className="og-display text-[clamp(30px,4.4vw,48px)] leading-[0.98]">{t("Your credits.")}{" "}<em>{t("Your videos")}</em></h2><p className="mt-3 text-[16.5px] leading-relaxed text-[var(--og-muted)]">{t(productCopy.schemaDescription, ozilProductFacts)}</p></div><ul className="og-credit-cards">{items.map((item, index) => <li key={item.title} className={`og-credit-card ${index === 1 ? 'og-credit-featured' : ''}`}><h3 className="og-display text-[30px] leading-none">{t(item.title)}</h3><p className="og-credit-description">{t(item.description)}</p><p className="og-display og-credit-value">{t(item.value)}</p><Link href={item.href} className={index === 1 ? 'og-cta og-credit-button' : 'og-credit-button'}>{t(item.action)}</Link></li>)}</ul><p className="mt-5 text-center text-[13px] text-[var(--og-faint)]">{t("View credit packs on the pricing page · Download finished results you want to keep")}</p></div></section>;
}
