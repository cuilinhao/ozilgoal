import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { creditPacks } from '../content/pricing';
import { OZIL_GOAL_CONFIG, OZIL_GOAL_COST } from '../lib/ozil-goal';
import { expandOzilProductText, ozilProductFacts } from '../lib/ozil-product';
import { ProductSummary } from '../components/ozil-goal/product-summary';
import { productMessages } from '../lib/i18n/messages/product';
import { locales, localizeHref } from '../lib/i18n/routing';
import { getMessages } from '../lib/i18n';
import { localizeMetadata } from '../lib/i18n/server';
import { ozilMetadata } from '../components/ozil-goal/page-content';
import pages from '../content/ozil-goal-pages.json';

const request = vi.hoisted(() => ({ locale: 'en' }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-migos-locale': request.locale }) }));

describe('public product facts', () => {
  it('uses the same paid pack and output configuration as checkout and generation', () => {
    const starter = creditPacks.find(pack => pack.id === 'starter')!;
    expect(ozilProductFacts).toMatchObject({
      price: (starter.amountCents / 100).toFixed(2), credits: starter.credits,
      videos: Math.floor(starter.credits / OZIL_GOAL_COST), cost: OZIL_GOAL_COST,
      duration: OZIL_GOAL_CONFIG.duration, aspect: OZIL_GOAL_CONFIG.aspect, resolution: OZIL_GOAL_CONFIG.resolution,
    });
    expect(expandOzilProductText('{{OZIL_STARTER_PRICE}} / {{OZIL_GOAL_COST}} / {{OZIL_GOAL_RESOLUTION}}'))
      .toBe(`${ozilProductFacts.price} / ${OZIL_GOAL_COST} / ${OZIL_GOAL_CONFIG.resolution}`);
    expect(expandOzilProductText('Keep unknown {{OTHER}} and <em>literal</em> text.')).toBe('Keep unknown {{OTHER}} and <em>literal</em> text.');
  });

  it.each(locales)('renders price, access and privacy facts without JavaScript in %s', locale => {
    const html = renderToStaticMarkup(createElement(ProductSummary, { locale }));
    expect(html).toContain('9.90');
    expect(html).toContain('300');
    expect(html).toContain('768p');
    expect(html).toContain(`href="${localizeHref('/privacy-policy#retention-and-international-processing', locale)}"`);
    expect(html).toContain(`href="${localizeHref('/refund-policy', locale)}"`);
    expect(html).not.toMatch(/\{\{?\w+\}\}?/);
    expect(html).not.toContain('<script');
    if (locale !== 'en') expect(html).not.toContain('Guest access depends on this browser');
  });

  it('states session loss, existing-account video limits, and credit restoration without promising cash refunds', () => {
    const html = renderToStaticMarkup(createElement(ProductSummary, { locale: 'en' }));
    expect(html).toContain('cookies');
    expect(html).toContain('guest videos do not move');
    expect(html).toContain('not a cash refund');
    expect(html).toContain('no fixed automatic deletion schedule');
  });

  it.each(locales.filter(locale => locale !== 'en'))('keeps product translations and metadata complete in %s', async locale => {
    const messages = productMessages[locale];
    expect(Object.keys(messages).sort()).toEqual(Object.keys(productMessages.ko).sort());
    for (const [source, target] of Object.entries(messages)) {
      expect(target.trim()).not.toBe('');
      expect((target.match(/\{\w+\}/g) ?? []).sort()).toEqual((source.match(/\{\w+\}/g) ?? []).sort());
    }
    request.locale = locale;
    try {
      const metadata = await localizeMetadata(ozilMetadata('home'));
      expect(metadata.description).toBe(expandOzilProductText(getMessages(locale)[pages.home.description]));
      expect(metadata.openGraph?.description).toBe(metadata.description);
      expect(metadata.twitter?.description).toBe(metadata.description);
      expect(metadata.description).not.toMatch(/\{\{/);
    } finally { request.locale = 'en'; }
  });
});
