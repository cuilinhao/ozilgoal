import { createElement, Fragment, type ReactNode, type CSSProperties } from 'react';
import pages from '@/content/ozil-goal-pages.json';
import { SITE_URL } from '@/content/public-pages';
import { creditPacks } from '@/content/pricing';
import { getLocale, getTranslations } from '@/lib/i18n/server';
import { localizeHref, type Locale } from '@/lib/i18n/routing';
import type { Translator } from '@/lib/i18n/translator';
import { expandOzilProductText, ozilProductFacts, productCopy } from '@/lib/ozil-product';
import { ProductSummary } from './product-summary';
import { OzilGoalGenerator } from './generator';
import { PromptBuilder } from './prompt-builder';
import { TemplateCheck, PhotoCheck, CaptionBoard, BeatTimeline } from './guide-tools';
import { SampleVideo, GuideSampleVideo } from './media';
import { OzilShell } from './shell';
import { OzilCredits } from './credits';
import { RouteChooser } from './route-chooser';
import { OzilBlogPreview } from './blog';
import { OzilGoalExamples } from './examples';
import './reference.css';
import './ozil.css';
export type OzilPageSlug = Exclude<keyof typeof pages, 'footer'>;
type SourceNode = string | { slot: string } | { tag: string; attrs: Record<string, string | null>; children: SourceNode[] };
type SourceElement = Extract<SourceNode, { tag: string }>;
const attributeNames: Record<string, string> = { class: 'className', tabindex: 'tabIndex', viewbox: 'viewBox', 'stroke-width': 'strokeWidth', 'stroke-linecap': 'strokeLinecap', 'stroke-linejoin': 'strokeLinejoin', autoplay: 'autoPlay', playsinline: 'playsInline', colspan: 'colSpan', rowspan: 'rowSpan', for: 'htmlFor' };
const booleanAttributes = new Set(['autoplay', 'playsinline', 'muted', 'loop', 'controls', 'inert']);
const text = expandOzilProductText;
function elements(node: SourceNode, tag: string): SourceElement[] {
  if (typeof node === 'string' || !('tag' in node)) return [];
  return [...(node.tag === tag ? [node] : []), ...node.children.flatMap(child => elements(child, tag))];
}
function readableText(node: SourceNode, formatText = text): string {
  if (typeof node === 'string') return formatText(node);
  if (!('tag' in node) || node.attrs['aria-hidden'] === 'true') return '';
  return node.children.map(child => readableText(child, formatText)).join('').replace(/\s+/g, ' ').trim();
}
function homeSchema(content: SourceNode, locale: Locale, formatText: (value: string) => string, t: Translator) {
  const localizedText = (node: SourceNode) => readableText(node, formatText);
  const url = new URL(localizeHref('/', locale), SITE_URL).href;
  const publisher = { '@type': 'Organization', name: 'Ozil Goal Generator', url: SITE_URL };
  const instructions = elements(content, 'section').find(section =>
    elements(section, 'h2').some(heading => readableText(heading) === 'How to make the Ozil AI goal video'));
  const steps = instructions ? elements(instructions, 'ol')[0] : undefined;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication', '@id': `${url}#software`, url, inLanguage: locale, publisher,
        name: 'Ozil Goal AI Video Generator', applicationCategory: 'MultimediaApplication', operatingSystem: 'Web',
        description: t(productCopy.schemaDescription, ozilProductFacts),
        isAccessibleForFree: false, image: `${SITE_URL}/ozil-goal/logo.png`,
        // The offer is a real credit pack, not free access. No ratings are claimed.
        offers: {
          '@type': 'Offer', name: t('{name} — {credits} credits', { name: t(creditPacks[0].name), credits: creditPacks[0].credits }),
          price: (creditPacks[0].amountCents / 100).toFixed(2), priceCurrency: 'USD', url: new URL(localizeHref('/pricing', locale), SITE_URL).href,
        },
      },
      {
        '@type': 'FAQPage', '@id': `${url}#faq`, url, inLanguage: locale, publisher,
        mainEntity: elements(content, 'details').map(detail => ({
          '@type': 'Question',
          name: elements(detail, 'summary').map(localizedText).join(' '),
          acceptedAnswer: { '@type': 'Answer', text: elements(detail, 'p').map(localizedText).join(' ') },
        })),
      },
      {
        '@type': 'HowTo', '@id': `${url}#how-to`, url, inLanguage: locale, publisher,
        name: formatText('How to make the Ozil AI goal video'),
        step: steps ? elements(steps, 'li').map((step, index) => ({
          '@type': 'HowToStep', position: index + 1,
          name: elements(step, 'h3').map(localizedText).join(' '),
          text: elements(step, 'p').map(localizedText).join(' '),
        })) : [],
      },
    ],
  };
}
// Translate emphasized headings as complete phrases so languages can reorder words.
// Only our known <em> marker becomes markup; all translation text stays escaped by React.
function headingSource(node: SourceElement): string | undefined {
  if (!['h1', 'h2'].includes(node.tag) || !node.children.some(child => typeof child !== 'string' && 'tag' in child && child.tag === 'em')) return;
  if (!node.children.every(child => typeof child === 'string' || ('tag' in child && child.tag === 'em' && child.children.every(part => typeof part === 'string')))) return;
  return node.children.map(child => typeof child === 'string' ? child : `<em>${(child as SourceElement).children.join('')}</em>`).join('');
}
function renderNode(node: SourceNode, locale: Locale, key: string, formatText = text): ReactNode {
  if (typeof node === 'string') return formatText(node);
  if ('slot' in node) {
    if (node.slot === 'product-summary') return <ProductSummary key={key} locale={locale} />;
    const slots: Record<string, ReactNode> = { generator: <OzilGoalGenerator />, prompt: <PromptBuilder />, 'template-check': <TemplateCheck />, 'photo-check': <PhotoCheck />, captions: <CaptionBoard />, timeline: <BeatTimeline />, sample: <SampleVideo />, 'guide-sample-video': <GuideSampleVideo />, credits: <OzilCredits />, 'route-chooser': <RouteChooser />, 'video-examples': <OzilGoalExamples /> };
    return <Fragment key={key}>{slots[node.slot]}</Fragment>;
  }
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(node.attrs)) {
    if (name === 'style') { props.style = Object.fromEntries((value ?? '').split(';').filter(Boolean).map(part => { const colon = part.indexOf(':'); return [part.slice(0, colon).trim().replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()), part.slice(colon + 1).trim()]; })) as CSSProperties; }
    else if (name === 'href') props.href = localizeHref(value ?? '', locale);
    else if (booleanAttributes.has(name)) props[attributeNames[name] ?? name] = true;
    else props[attributeNames[name] ?? name] = value === null ? '' : ['alt', 'title', 'placeholder', 'aria-label'].includes(name) ? formatText(value) : value;
  }
  const heading = headingSource(node);
  if (heading && locale !== 'en') {
    const translated = formatText(heading);
    if (translated !== heading) return createElement(node.tag, props, ...translated.split(/(<em>[\s\S]*?<\/em>)/g).map((part, index) =>
      part.startsWith('<em>') && part.endsWith('</em>') ? createElement('em', { key: `${key}.em.${index}` }, part.slice(4, -5)) : part));
  }
  const children = node.children.map((child, index) => renderNode(child, locale, `${key}.${index}`, formatText));
  return children.length ? createElement(node.tag, props, children) : createElement(node.tag, props);
}
export async function OzilGoalPage({ slug = 'home', previewLocale }: { slug?: OzilPageSlug; previewLocale?: Locale }) {
  const locale = await getLocale();
  const t = await getTranslations();
  const formatText = (value: string) => text(t(value));
  const content = pages[slug].content as SourceNode;
  return <>
    {slug === 'home' && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema(content, locale, formatText, t)).replace(/</g, '\\u003c') }} />}
    <OzilShell>{renderNode(content, locale, slug, formatText)}{slug === 'home' && <OzilBlogPreview locale={previewLocale ?? locale} />}{renderNode(pages.footer as SourceNode, locale, 'footer', formatText)}</OzilShell>
  </>;
}
export function ozilMetadata(slug: OzilPageSlug) {
  const page = pages[slug];
  return {
    // The home title must match the social titles without the layout's brand suffix.
    title: slug === 'home' ? { absolute: page.title } : page.title,
    // Translate source keys before expanding product values (including social metadata).
    description: page.description,
    openGraph: { title: page.title, description: page.description, images: ['/ozil-goal/samples/ai-shot1.jpg'] },
    ...(slug === 'home' ? { twitter: { card: 'summary_large_image' as const, title: page.title, description: page.description, images: ['/ozil-goal/samples/ai-shot1.jpg'] } } : {}),
  };
}
