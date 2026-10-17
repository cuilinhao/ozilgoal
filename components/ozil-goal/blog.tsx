import Link from "next/link";
import { BlogBlocks, plainText, renderInline } from "@/components/blog/blog-shared";
import { SITE_URL } from "@/content/public-pages";
import { OZIL_BLOG_PATH, OZIL_BLOG_UPDATED, ozilBlogLanguages, ozilBlogPosts, nativeOzilBlogPosts, ozilBlogIndexPosts } from "@/content/ozil-blog";
import type { OzilBlogPost } from "@/content/ozil-blog/types";
import { languageNames, localeTags, localizeHref, type Locale } from "@/lib/i18n/routing";
import { blogPreviewCopy, type BlogPreviewTopic } from "./blog-preview-copy";
import { ozilBlogIndexUi, ozilBlogText, ozilBlogUi } from "./blog-ui";
import "./blog.css";

function StructuredData({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

function ArticleCard({ post }: { post: OzilBlogPost }) {
  const ui = ozilBlogUi[post.language];
  // Native articles can change the document language even without a URL prefix.
  const CardLink = post.translationKey ? Link : "a";
  return <article className="blog-card" lang={post.language}>
    <p className="blog-card-meta">{post.eyebrow}</p>
    <h3><CardLink href={post.path}>{post.title}</CardLink></h3>
    <p>{ozilBlogText(post.excerpt)}</p>
    <p className="blog-card-footer"><time dateTime={post.datePublished}>{new Intl.DateTimeFormat(post.language, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${post.datePublished}T00:00:00Z`))}</time><CardLink href={post.path} aria-label={`${ui.read}: ${post.title}`}>{ui.read} →</CardLink></p>
  </article>;
}

const previewTopics: BlogPreviewTopic[] = ["trend", "photo", "free"];

export function OzilBlogPreview({ locale = "en" }: { locale?: Locale }) {
  const copy = blogPreviewCopy[locale];
  const articleLanguage = locale === "es" ? "es" : "en";
  return <section className="ozil-blog-preview" id="blog" aria-labelledby="ozil-blog-title" lang={locale}>
    <div className="section-container">
      <div className="ozil-blog-preview-heading"><div><p className="eyebrow">{copy.kicker}</p><h2 id="ozil-blog-title">{copy.title}</h2></div><Link href={localizeHref(OZIL_BLOG_PATH, locale)}>{copy.viewAll.replace("{count}", String(ozilBlogIndexPosts(locale).length))} <span aria-hidden="true">↗</span></Link></div>
      <p className="ozil-blog-preview-intro">{copy.intro}{copy.articleLanguageNote && <> {copy.articleLanguageNote}</>}</p>
      <div className="ozil-blog-preview-grid">{previewTopics.map(topic => {
        const post = ozilBlogPosts.find(item => item.language === articleLanguage && item.topic === topic)!;
        const card = copy.cards[topic];
        const published = new Intl.DateTimeFormat(localeTags[locale], { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${post.datePublished}T00:00:00Z`));
        return <div key={topic}><p className="ozil-blog-language-label">{card.label}</p><article className="blog-card">
          <p className="blog-card-meta">{card.eyebrow}</p>
          <h3><a href={post.path} hrefLang={post.language}>{card.title}</a></h3>
          <p>{card.excerpt}</p>
          <p className="blog-card-footer"><time dateTime={post.datePublished}>{published}</time><a href={post.path} hrefLang={post.language} aria-label={`${copy.read}: ${card.title}${copy.articleLanguageNote ? ` (${copy.articleLanguageNote})` : ""}`}>{copy.read} →</a></p>
        </article></div>;
      })}</div>
    </div>
  </section>;
}

export function OzilBlogIndex({ locale = "en" }: { locale?: Locale }) {
  const copy = ozilBlogIndexUi[locale];
  const ui = ozilBlogUi[locale];
  const posts = ozilBlogIndexPosts(locale);
  const latest = posts.filter(post => post.translationKey);
  const url = `${SITE_URL}${localizeHref(OZIL_BLOG_PATH, locale)}`;
  return <div className="geo-page blog-index ozil-blog" lang={locale}>
    <StructuredData data={{ "@context": "https://schema.org", "@type": "Blog", "@id": `${url}#blog`, url, name: copy.metaTitle, inLanguage: locale, dateModified: OZIL_BLOG_UPDATED, publisher: { "@type": "Organization", name: "Ozil Goal Generator", url: SITE_URL }, blogPost: posts.map(post => ({ "@type": "BlogPosting", headline: post.title, url: `${SITE_URL}${post.path}`, inLanguage: post.language, datePublished: post.datePublished })) }} />
    <header className="geo-header section-container ozil-blog-hero">
      <div>
        <nav className="geo-breadcrumb" aria-label={ui.breadcrumb}><Link href={localizeHref("/", locale)}>Ozil Goal</Link><span aria-hidden="true">/</span><span aria-current="page">{ui.blog}</span></nav>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="geo-intro">{copy.intro}</p>
        <nav className="ozil-blog-language-nav" aria-label={copy.languages}>
          <a href="#latest">{copy.latest}<span>{latest.length}</span></a>
          {ozilBlogLanguages.map(group => <a href={`#${group.language}`} lang={group.language} key={group.language}>{group.label}<span>{nativeOzilBlogPosts.filter(post => post.language === group.language).length}</span></a>)}
        </nav>
      </div>
      <figure className="ozil-blog-cover"><img src="/ozil-goal/samples/ai-shot1.jpg" width="496" height="864" alt={copy.coverAlt} /><figcaption>{copy.coverCaption}</figcaption></figure>
    </header>
    <section id="latest" className="geo-section section-container">
      <h2>{copy.latest}</h2><p className="ozil-blog-group-intro">{copy.latestIntro}</p>
      <div className="blog-grid">{latest.map(post => <ArticleCard key={post.path} post={post} />)}</div>
    </section>
    {ozilBlogLanguages.map(group => <section key={group.language} id={group.language} lang={group.language} className="geo-section section-container">
      <h2>{group.label}</h2><p className="ozil-blog-group-intro">{group.description}</p>
      <div className="blog-grid">{nativeOzilBlogPosts.filter(post => post.language === group.language).map(post => <ArticleCard key={post.path} post={post} />)}</div>
    </section>)}
  </div>;
}

export function OzilBlogArticle({ post }: { post: OzilBlogPost }) {
  const ui = ozilBlogUi[post.language];
  const url = `${SITE_URL}${post.path}`;
  const locale = post.language === "pt-BR" ? "en" : post.language;
  const href = (path: string) => post.translationKey ? localizeHref(path, locale) : path;
  const indexPath = href(OZIL_BLOG_PATH);
  const related = (post.translationKey ? ozilBlogPosts : nativeOzilBlogPosts).filter(candidate => candidate.language === post.language && candidate.slug !== post.slug);
  const otherLanguages = ozilBlogPosts.filter(candidate => candidate.language !== post.language && (post.translationKey
    ? candidate.translationKey === post.translationKey
    : !candidate.translationKey && candidate.topic === post.topic));
  const languageLabel = post.translationKey ? ui.translation : ui.language;
  const published = new Intl.DateTimeFormat(post.language, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${post.datePublished}T00:00:00Z`));
  const schema = {
    "@context": "https://schema.org", "@graph": [
      { "@type": "BlogPosting", "@id": `${url}#article`, headline: post.title, description: ozilBlogText(post.description), url, mainEntityOfPage: url, datePublished: post.datePublished, dateModified: post.dateModified, inLanguage: post.language, image: `${SITE_URL}/ozil-goal/samples/ai-shot1.jpg`, author: { "@type": "Organization", name: "Ozil Goal Generator editorial team", url: SITE_URL }, publisher: { "@type": "Organization", name: "Ozil Goal Generator", url: SITE_URL }, isPartOf: { "@type": "Blog", "@id": `${SITE_URL}${indexPath}#blog` }, citation: post.sources.map(source => new URL(source.url, SITE_URL).href) },
      { "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: post.language, mainEntity: post.faqs.map(faq => ({ "@type": "Question", name: plainText(faq.question), acceptedAnswer: { "@type": "Answer", text: plainText(ozilBlogText(faq.answer)) } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ozil Goal", item: `${SITE_URL}${href("/")}` },
        { "@type": "ListItem", position: 2, name: ui.blog, item: `${SITE_URL}${indexPath}` },
        { "@type": "ListItem", position: 3, name: post.label, item: url },
      ] },
    ],
  };
  return <article className="geo-page blog-article ozil-blog" lang={post.language}>
    <StructuredData data={schema} />
    <header className="geo-header section-container">
      <nav className="geo-breadcrumb" aria-label={ui.breadcrumb}><Link href={href("/")}>Ozil Goal</Link><span aria-hidden="true">/</span><Link href={`${indexPath}#${post.translationKey ? "latest" : post.language}`}>{ui.blog}</Link><span aria-hidden="true">/</span><span aria-current="page">{post.label}</span></nav>
      <p className="eyebrow">{post.eyebrow}</p><h1>{post.title}</h1>
      <p className="geo-intro">{renderInline(ozilBlogText(post.intro))}</p>
      <p className="geo-note blog-byline">{ui.byline} · {ui.published} <time dateTime={post.datePublished}>{published}</time></p>
      {/* Full navigation refreshes RootLayout, document lang and LocaleProvider together. */}
      {otherLanguages.length > 0 && <nav className="ozil-blog-translations" aria-label={languageLabel}>{languageLabel}: {otherLanguages.map(candidate => <a key={candidate.path} href={candidate.path} hrefLang={candidate.language} lang={candidate.language}>{candidate.language === "pt-BR" ? "Português" : languageNames[candidate.language]}</a>)}</nav>}
    </header>
    <nav className="section-container ozil-blog-contents" aria-label={ui.contents}><strong>{ui.contents}</strong><ol>{post.sections.map(section => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}<li><a href="#faq">{ui.faq}</a></li></ol></nav>
    {post.sections.map(section => <section key={section.id} id={section.id} className="geo-section section-container"><h2>{section.title}</h2><div className="geo-prose blog-prose"><BlogBlocks blocks={section.blocks} t={ozilBlogText} /></div></section>)}
    <section id="faq" className="geo-section section-container blog-faq"><h2>{ui.faq}</h2><div className="faq-grid">{post.faqs.map((faq, index) => <div className="faq-item" key={faq.question}><span className="faq-number">{index + 1}</span><div><h3>{faq.question}</h3><p>{renderInline(ozilBlogText(faq.answer))}</p></div></div>)}</div></section>
    <section id="sources" className="geo-section section-container"><h2>{ui.sources}</h2><ul className="blog-sources">{post.sources.map(source => <li key={source.url}><a href={href(source.url)} rel="noopener">{source.label}</a></li>)}</ul></section>
    <aside className="geo-related section-container"><h2>{ui.more}</h2><div className="geo-link-grid">{related.map(candidate => candidate.translationKey ? <Link key={candidate.slug} href={candidate.path}>{candidate.label} ↗</Link> : <a key={candidate.slug} href={candidate.path}>{candidate.label} ↗</a>)}</div><p><Link href={`${indexPath}#${post.translationKey ? "latest" : post.language}`}>{ui.all}</Link></p></aside>
    <div className="geo-cta section-container"><h2>{ui.cta}</h2><p>{ui.ctaText}</p><Link className="pill-gradient-button" href={href("/#generator")}>{ui.button}</Link></div>
  </article>;
}
