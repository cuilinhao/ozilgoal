import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LocaleProvider } from '../components/i18n/locale-provider';
import { AuthProvider } from '../components/auth-provider';
import { OzilGoalGenerator } from '../components/ozil-goal/generator';
import { generateMetadata as localizedMetadata } from '../app/[locale]/[[...path]]/page';
import { ozilMessages } from '../lib/i18n/messages/ozil';
import interactions from '../content/ozil-goal-interactions.json';
import { getRouteRecommendation } from '../components/ozil-goal/route-choice';
import { createTranslator } from '../lib/i18n/translator';
import { OzilGoalPage, ozilMetadata } from '../components/ozil-goal/page-content';
import { getMessages } from '../lib/i18n';
import { locales } from '../lib/i18n/routing';
import { localizeMetadata } from '../lib/i18n/server';
import pages from '../content/ozil-goal-pages.json';
const request = vi.hoisted(() => ({ locale: 'en', path: '/' }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-migos-locale': request.locale, 'x-migos-pathname': request.path }) }));

describe('Ozil localized pages', () => {
  it('translates the photo upload and generation controls before hydration', () => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, { locale: 'ja', messages: { 'Your photo': 'あなたの写真', 'Checking account…': 'アカウントを確認中', 'Player photo': '選手の写真' }, children: createElement(AuthProvider, null, createElement(OzilGoalGenerator)) }));
    expect(html).toContain('あなたの写真');
    expect(html).toContain('aria-label="選手の写真"');
    expect(html).toContain('アカウントを確認中');
  });
  it('uses natural French word order for the complete emphasized home heading', async () => {
    request.locale = 'fr';
    try {
      const html = renderToStaticMarkup(createElement(AuthProvider, null, await OzilGoalPage({})));
      const heading = html.match(/<h1[^>]*>(.*?)<\/h1>/)![1];
      expect(heading.replace(/<[^>]+>/g, '')).toMatch(/^Générateur/);
      expect(heading).toContain('<em>');
    } finally { request.locale = 'en'; }
  });
  it.each(locales.filter(locale => locale !== 'en'))('renders translated home copy, metadata, and matching FAQ schema in %s', async locale => {
    request.locale = locale;
    try {
      const messages = getMessages(locale);
      const html = renderToStaticMarkup(createElement(LocaleProvider, { locale, messages, children: createElement(AuthProvider, null, await OzilGoalPage({})) }));
      const title = messages[pages.home.title];
      expect(title).toBeTruthy();
      const metadata = await localizeMetadata(ozilMetadata('home'));
      expect(metadata.title).toEqual({ absolute: title });
      expect(metadata.alternates?.canonical).toBe(`https://ozilgoal-aivideo.com/${locale}`);
      expect(Object.keys(metadata.alternates?.languages ?? {})).toHaveLength(7);
      expect(html).not.toContain('>Make my video<');
      expect(html).toContain(`href="/${locale}/pricing"`);
      const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])['@graph'];
      const faq = graph.find((item: { '@type': string }) => item['@type'] === 'FAQPage');
      expect(faq.inLanguage).toBe(locale);
      expect(faq.mainEntity).toHaveLength(12);
      expect(faq.mainEntity[0].name).not.toBe('What is the Ozil Goal AI trend?');
      expect(html).toContain(faq.mainEntity[0].name.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;'));
      expect(html).not.toContain('{{OZIL_GOAL_COST}}');
    } finally { request.locale = 'en'; }
  });
});


type CopyNode = string | { tag?: string; attrs?: Record<string, string | null>; children?: CopyNode[] };
function pageCopy(node: CopyNode): string[] {
  if (typeof node === 'string') return node.trim() ? [node.trim()] : [];
  return [...Object.entries(node.attrs ?? {}).filter(([key]) => ['alt', 'title', 'aria-label', 'placeholder'].includes(key)).map(([, value]) => value?.trim() ?? '').filter(Boolean), ...(node.children ?? []).flatMap(pageCopy)];
}
const requiredCopy = new Set([
  ...Object.entries(pages).flatMap(([slug, page]) => slug === 'footer' ? pageCopy(page as CopyNode) : [...pageCopy((page as { content: CopyNode }).content), (page as { title: string }).title, (page as { description: string }).description]),
  ...interactions.templateChecks.flatMap(item => [item.label, item.fix]),
  ...interactions.photoChecks.flatMap(item => [item.ask, item.fix]),
  ...interactions.captions.map(item => item.text),
  ...interactions.captionMoods.map(item => item.label),
  ...interactions.beatExplanations.flatMap(item => [item.look, item.lands]),
]);

describe('Ozil translation coverage', () => {
  it.each(locales.filter(locale => locale !== 'en'))('covers every public page and interactive dataset with intact placeholders in %s', locale => {
    const messages = ozilMessages[locale];
    expect([...requiredCopy].filter(source => !messages[source]?.trim())).toEqual([]);
    expect(Object.keys(messages).sort()).toEqual(Object.keys(ozilMessages.ko).sort());
    for (const [source, translated] of Object.entries(messages)) {
      expect(translated.trim(), source).not.toBe('');
      expect((translated.match(/\{\w+\}/g) ?? []).sort(), source).toEqual((source.match(/\{\w+\}/g) ?? []).sort());
    }
    const recommend = getRouteRecommendation({ app: 'b', opens: 'b', budget: 'b', effort: 'b' }, 300, createTranslator(messages));
    expect(recommend?.text).toContain('300');
    expect(recommend?.text).not.toContain('{credits}');
    expect(recommend?.text).not.toContain('The template link is the usual sticking point');
  });
  it.each(locales.filter(locale => locale !== 'en'))('serves the home alias and all six guides in %s', async locale => {
    request.locale = locale;
    try {
      for (const slug of Object.keys(pages).filter(slug => slug !== 'footer')) {
        const path = slug === 'home' ? ['ozil-goal-generator'] : ['ozil-goal-generator', slug];
        request.path = '/' + path.join('/');
        const metadata = await localizedMetadata({ params: Promise.resolve({ locale, path }) });
        expect(metadata.alternates?.canonical).toBe(`https://ozilgoal-aivideo.com/${locale}${slug === 'home' ? '' : '/' + path.join('/')}`);
        expect(metadata.description).not.toBe((pages as Record<string, { description?: string }>)[slug].description);
      }
    } finally { request.locale = 'en'; request.path = '/'; }
  });
});
