import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import LocalizedPage, { generateMetadata as localizedMetadata } from "../app/[locale]/[[...path]]/page";
import { generateMetadata, generateStaticParams } from "../app/ozil-goal-generator/blog/[slug]/page";
import { OzilBlogArticle, OzilBlogIndex, OzilBlogPreview } from "../components/ozil-goal/blog";
import { SiteHeader } from "../components/site-header";
import { AuthProvider } from "../components/auth-provider";
import { LocaleProvider } from "../components/i18n/locale-provider";
import { getOzilBlogPost, ozilBlogAlternates, ozilBlogPosts } from "../content/ozil-blog";
import { getDocumentLanguage } from "../lib/i18n/server";
import { locales, localizeHref, type Locale } from "../lib/i18n/routing";
import sitemap from "../app/sitemap";

const request = vi.hoisted(() => ({ locale: "en", path: "/" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-migos-locale": request.locale, "x-migos-pathname": request.path }) }));
vi.mock("next/navigation", async importOriginal => ({ ...await importOriginal<typeof import("next/navigation")>(), usePathname: () => request.path }));
const slugs = ["lamine-yamal", "sepak-bola", "gol-pakai", "gol-de-ozil"];
const base = "/ozil-goal-generator/blog";
const site = "https://ozilgoal-aivideo.com";
const expectedPath = (slug: string, locale: Locale) => `${locale === "en" ? "" : `/${locale}`}${base}${slug ? `/${slug}` : ""}`;
const render = (element: React.ReactNode, locale: Locale) => renderToStaticMarkup(createElement(LocaleProvider, { locale, messages: {}, children: element }));
afterEach(() => { request.locale = "en"; request.path = "/"; });

describe("translated keyword blog routes", () => {
  it.each(locales)("localizes the index and exact keyword routes in %s while preserving suffixes", locale => {
    for (const slug of ["", ...slugs]) {
      expect(localizeHref(`/ja${base}${slug ? `/${slug}` : ""}?from=nav#faq`, locale)).toBe(`${expectedPath(slug, locale)}?from=nav#faq`);
    }
    expect(localizeHref(`${base}/gol-de-ozil-con-mi-foto`, locale)).toBe(`${base}/gol-de-ozil-con-mi-foto`);
    expect(localizeHref(`${base}/lamine-yamal-extra`, locale)).toBe(`${base}/lamine-yamal-extra`);
  });

  it.each(slugs)("selects all six actual translations of %s without changing its English default", slug => {
    expect(getOzilBlogPost(slug)?.language).toBe("en");
    for (const locale of locales) {
      const post = getOzilBlogPost(slug, locale);
      expect(post?.language).toBe(locale);
      expect(post?.translationKey).toBe(slug);
      expect(post?.path).toBe(expectedPath(slug, locale));
    }
  });

  it("generates only the 14 native and four English article paths in the unprefixed route", () => {
    const paths = generateStaticParams().map(({ slug }) => slug);
    expect(paths).toHaveLength(18);
    expect(new Set(paths).size).toBe(18);
    expect(paths).toEqual(expect.arrayContaining(slugs));
    expect(getOzilBlogPost("gol-de-ozil-con-mi-foto")?.language).toBe("es");
  });

  it.each(locales.filter(locale => locale !== "en"))("serves translated article and index routes in %s", async locale => {
    const article = await LocalizedPage({ params: Promise.resolve({ locale, path: ["ozil-goal-generator", "blog", "lamine-yamal"] }) });
    expect(article.type).toBe(OzilBlogArticle);
    expect(article.props.post.language).toBe(locale);
    const index = await LocalizedPage({ params: Promise.resolve({ locale, path: ["ozil-goal-generator", "blog"] }) });
    expect(index.type).toBe(OzilBlogIndex);
    expect(index.props.locale).toBe(locale);
  });

  it("retains native-article redirects and rejects an unsupported keyword locale", async () => {
    await expect(LocalizedPage({ params: Promise.resolve({ locale: "fr", path: ["ozil-goal-generator", "blog", "gol-de-ozil-con-mi-foto"] }) })).rejects.toMatchObject({ digest: `NEXT_REDIRECT;replace;${base}/gol-de-ozil-con-mi-foto;308;` });
    await expect(LocalizedPage({ params: Promise.resolve({ locale: "id", path: ["ozil-goal-generator", "blog", "sepak-bola"] }) })).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it.each(locales)("sets the document language to the selected keyword translation in %s", async locale => {
    request.locale = locale;
    request.path = `${base}/gol-de-ozil`;
    expect(await getDocumentLanguage()).toBe(locale);
  });
});

describe("truthful translated blog discovery", () => {
  it.each(slugs)("advertises reciprocal translations and a unique sitemap URL for %s", async slug => {
    const expected = Object.fromEntries([...locales.map(locale => [locale, site + expectedPath(slug, locale)]), ["x-default", site + expectedPath(slug, "en")]]);
    for (const locale of locales) {
      const metadata = locale === "en" ? await generateMetadata({ params: Promise.resolve({ slug }) }) : await localizedMetadata({ params: Promise.resolve({ locale, path: ["ozil-goal-generator", "blog", slug] }) });
      expect(metadata.alternates).toEqual({ canonical: site + expectedPath(slug, locale), languages: expected });
      expect(metadata.openGraph?.locale).toBe({ en: "en_US", ko: "ko_KR", ja: "ja_JP", fr: "fr_FR", es: "es_ES", "zh-TW": "zh_TW" }[locale]);
      const entries = sitemap().filter(entry => entry.url === site + expectedPath(slug, locale));
      expect(entries).toHaveLength(1);
      expect(entries[0].alternates?.languages).toEqual(expected);
    }
  });

  it("gives every localized index its own canonical and all six alternates", async () => {
    const expected = Object.fromEntries([...locales.map(locale => [locale, site + expectedPath("", locale)]), ["x-default", site + base]]);
    for (const locale of locales) {
      const entry = sitemap().find(entry => entry.url === site + expectedPath("", locale));
      expect(entry?.alternates?.languages).toEqual(expected);
      if (locale !== "en") {
        const metadata = await localizedMetadata({ params: Promise.resolve({ locale, path: ["ozil-goal-generator", "blog"] }) });
        expect(metadata.alternates).toEqual({ canonical: site + expectedPath("", locale), languages: expected });
        expect(metadata.description).not.toContain("Guides in three languages");
      }
    }
    expect(new Set(sitemap().map(entry => entry.url)).size).toBe(sitemap().length);
  });

  it("keeps unrelated native articles out of translation alternates", () => {
    const post = getOzilBlogPost("gol-de-ozil-con-mi-foto")!;
    expect(ozilBlogAlternates(post)).toEqual({ es: `${base}/gol-de-ozil-con-mi-foto`, "x-default": `${base}/gol-de-ozil-con-mi-foto` });
  });
});

describe("localized blog presentation", () => {
  const faqLabels = { en: "Frequently asked questions", ko: "자주 묻는 질문", ja: "よくある質問", fr: "Questions fréquentes", es: "Preguntas frecuentes", "zh-TW": "常見問題" };
  it.each(locales)("renders translated article UI, schema and product links in %s", locale => {
    const original = getOzilBlogPost("sepak-bola", locale)!;
    expect(original).toBeDefined();
    const post = { ...original, intro: `${original?.intro} [Generator](/#generator) [Pricing](/pricing)` };
    const html = render(createElement(OzilBlogArticle, { post }), locale);
    expect(html).toContain(`<article class="geo-page blog-article ozil-blog" lang="${locale}">`);
    expect(html).toContain(`<h2>${faqLabels[locale]}</h2>`);
    expect(html).toContain(`href="${locale === "en" ? "/" : `/${locale}`}#generator"`);
    expect(html).toContain(`href="${locale === "en" ? "" : `/${locale}`}/pricing"`);
    const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])["@graph"];
    expect(graph.find((item: { "@type": string }) => item["@type"] === "BlogPosting").inLanguage).toBe(locale);
    expect(graph.find((item: { "@type": string }) => item["@type"] === "FAQPage").mainEntity).toHaveLength(post.faqs.length);
    const translations = html.match(/<nav class="ozil-blog-translations".*?<\/nav>/)![0];
    expect(translations.match(/<a /g)).toHaveLength(5);
    expect(translations).not.toContain("gol-de-ozil-con-mi-foto");
    for (const other of locales.filter(item => item !== locale)) expect(translations).toContain(`href="${expectedPath("sepak-bola", other)}"`);
  });

  it.each(locales)("shows the four current-language articles and preserves legacy access in the %s index", locale => {
    const html = render(createElement(OzilBlogIndex, { locale }), locale);
    expect(html.match(/class="blog-card"/g)).toHaveLength(18);
    for (const slug of slugs) expect(html).toContain(`href="${expectedPath(slug, locale)}"`);
    expect(html).toContain(`href="${base}/como-fazer-gol-do-ozil-com-ia"`);
    if (locale !== "en") expect(html).not.toContain("From “what is this?”");
    const preview = render(createElement(OzilBlogPreview, { locale }), locale);
    expect(preview).toContain(`href="${expectedPath("", locale)}"`);
    expect(ozilBlogPosts).toHaveLength(38);
  });

  it("shows the header switcher on translated blog routes and hides it on native articles", () => {
    for (const path of [base, `${base}/lamine-yamal`, `/ja${base}/gol-de-ozil`]) {
      request.path = path;
      const html = render(createElement(AuthProvider, { children: createElement(SiteHeader) }), "ja");
      expect(html).toContain('aria-label="言語を選択"');
    }
    request.path = `${base}/what-is-ozil-goal-trend`;
    expect(render(createElement(AuthProvider, { children: createElement(SiteHeader) }), "en")).not.toContain('aria-label="Select language"');
  });
});
