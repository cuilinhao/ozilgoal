// Read-only route and metadata smoke check against local Next.js or a Cloudflare preview.
// Usage: node scripts/check-i18n.mjs http://127.0.0.1:3011
const origin = (process.argv[2] || 'http://127.0.0.1:3011').replace(/\/$/, '');
const site = 'https://ozilgoal-aivideo.com';
const locales = ['en', 'ko', 'ja', 'fr', 'es', 'zh-TW'];
const englishOnly = ['/mesut-ozil-ludogorets-goal'];
const blogIndex = '/ozil-goal-generator/blog';
const keywordSlugs = ['lamine-yamal', 'sepak-bola', 'gol-pakai', 'gol-de-ozil'];
const keywordPaths = keywordSlugs.map(slug => `${blogIndex}/${slug}`);
const stripLocale = path => path.replace(/^\/(?:en|ko|ja|fr|es|zh-TW)(?=\/|$)/, '') || '/';
const isTranslatedBlog = path => path === blogIndex || keywordPaths.includes(path);
const ozilPages = [
  '/',
  '/ozil-goal-generator/ozil-goal-ai-prompt',
  '/ozil-goal-generator/ozil-goal-ai-template',
  '/ozil-goal-generator/ozil-goal-trend',
  '/ozil-goal-generator/ozil-goal-meme',
  '/ozil-goal-generator/ozil-goal-capcut-template',
  '/ozil-goal-generator/ai-football-video-from-photo',
];
const translated = [
  ...ozilPages,
  blogIndex, ...keywordPaths,
  '/pricing', '/privacy-policy', '/terms-of-service',
  '/refund-policy', '/acceptable-use-policy', '/contact',
];
const privatePaths = [
  '/sign-in', '/sign-up', '/app/video-generator',
  '/app/my-videos', '/app/my-orders', '/app/my-credits',
];
const localized = (path, locale) => locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`;
// Accept only the root's optional trailing slash; non-root canonical paths are exact.
const normalizeCanonical = url => url === site ? `${site}/` : url;
const canonical = path => new URL(path, site).href;
const languageGroup = path => Object.fromEntries([
  ...locales.map(locale => [locale, canonical(localized(path, locale))]),
  ['x-default', canonical(path)],
]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([:\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), value]));
const normalizedGroup = group => Object.fromEntries(Object.entries(group).map(([language, url]) => [language, normalizeCanonical(url)]));
const sameGroup = (actual, expected) => JSON.stringify(Object.entries(normalizedGroup(actual)).sort()) === JSON.stringify(Object.entries(normalizedGroup(expected)).sort());
const failures = [];
const fail = (route, error) => failures.push({route, error});
function hreflangs(markup, route, sitemap = false) {
  const links = [...markup.matchAll(sitemap ? /<xhtml:link\b[^>]*\/?\s*>/g : /<link\b[^>]*>/g)].map(([tag]) => attributes(tag));
  const alternates = links.filter(link => link.rel === 'alternate' && link.hreflang);
  const group = Object.fromEntries(alternates.map(link => [link.hreflang, link.href]));
  if (alternates.length !== Object.keys(group).length) fail(route, 'duplicate hreflang');
  if (alternates.some(link => !link.href)) fail(route, 'hreflang missing href');
  return group;
}

async function read(route) {
  try {
    const response = await fetch(origin + route, {redirect: 'manual', signal: AbortSignal.timeout(30000)});
    return {status: response.status, html: await response.text()};
  } catch (error) {
    fail(route, `request failed: ${error.message}`);
    return {status: 0, html: ''};
  }
}

const sitemap = await read('/sitemap.xml');
if (sitemap.status !== 200) {
  fail('/sitemap.xml', `HTTP ${sitemap.status}`);
  console.log(JSON.stringify({checked: 0, sitemapCount: 0, failures}, null, 2));
  process.exit(1);
}
const locations = [...sitemap.html.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const paths = new Set(locations.map(url => new URL(url).pathname));
const sitemapGroups = new Map([...sitemap.html.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => {
  const location = /<loc>([^<]+)<\/loc>/.exec(entry)?.[1];
  return [location, hreflangs(entry, '/sitemap.xml', true)];
}));
if (locations.length !== new Set(locations).size) fail('/sitemap.xml', 'duplicate URLs');
if (locations.some(url => new URL(url).origin !== site || new URL(url).search || new URL(url).hash)) fail('/sitemap.xml', 'unexpected origin, query or fragment');
const publicPaths = [...englishOnly, ...locales.flatMap(locale => translated.map(path => localized(path, locale)))];
for (const path of publicPaths) if (!paths.has(path)) fail('/sitemap.xml', `missing ${path}`);
const nativeBlogPosts = [...paths].filter(path => path.startsWith(`${blogIndex}/`) && !keywordPaths.includes(path));
const translatedBlogPosts = [...paths].filter(path => keywordPaths.includes(stripLocale(path)));
if (nativeBlogPosts.length !== 14) fail('/sitemap.xml', `expected 14 native-language Ozil blog posts, got ${nativeBlogPosts.length}`);
for (const path of paths) {
  if (/^\/(?:ko\/|ja\/|fr\/|es\/|zh-TW\/)?(?:hotel-lobby-|ai-rap-song-generator|showcases|blog(?:\/|$))/.test(path)) fail('/sitemap.xml', `legacy route ${path}`);
  if (/^\/(?:ko\/|ja\/|fr\/|es\/|zh-TW\/)?(?:app|api|sign-in|sign-up)(?:\/|$)/.test(path)) fail('/sitemap.xml', `private route ${path}`);
  if (locales.some(locale => path === localized('/ozil-goal-generator', locale))) fail('/sitemap.xml', `home alias in sitemap ${path}`);
  if (locales.slice(1).some(locale => englishOnly.some(article => path === localized(article, locale)))) fail('/sitemap.xml', `English-only article mirror ${path}`);
  if (/^\/(?:ko|ja|fr|es|zh-TW)\/ozil-goal-generator\/blog(?:\/|$)/.test(path) && !isTranslatedBlog(stripLocale(path))) fail('/sitemap.xml', `native blog mirror ${path}`);
}

const queue = [
  ...englishOnly.map(route => ({route, locale: 'en', canonicalPath: route, sourcePath: route, kind: 'native'})),
  ...locales.flatMap(locale => translated.map(path => ({route: localized(path, locale), locale, canonicalPath: localized(path, locale), sourcePath: path, kind: 'translated'}))),
  ...locales.flatMap(locale => privatePaths.map(path => ({route: localized(path, locale), locale, canonicalPath: localized(path, locale), sourcePath: path, kind: 'private'}))),
  ...locales.map(locale => ({route: localized('/ozil-goal-generator', locale), locale, canonicalPath: localized('/', locale), sourcePath: '/', kind: 'alias'})),
  ...nativeBlogPosts.map(route => ({route, locale: 'en', canonicalPath: route, sourcePath: route, kind: 'blog-native'})),
];
let checked = 0;
await Promise.all(Array.from({length: 6}, async () => {
  while (queue.length) {
    const {route, locale, canonicalPath, sourcePath, kind} = queue.shift();
    const {status, html} = await read(route);
    if (status !== 200) { fail(route, `HTTP ${status}`); continue; }
    checked++;
    const documentLanguage = /<html\b[^>]*\blang="([^"]+)"/.exec(html)?.[1];
    const isKeywordArticle = keywordPaths.includes(sourcePath);
    const articleLanguage = kind === 'blog-native' || isKeywordArticle
      ? /<article\b[^>]*\blang="([^"]+)"/.exec(html)?.[1] : undefined;
    if (kind === 'blog-native' && !['en', 'pt-BR', 'es'].includes(articleLanguage)) fail(route, `invalid native article language ${articleLanguage}`);
    if (isKeywordArticle && articleLanguage !== locale) fail(route, `wrong translated article language ${articleLanguage}`);
    if (documentLanguage !== (articleLanguage || locale)) fail(route, `wrong document language ${documentLanguage}`);
    if (!/<title>[^<]+<\/title>/.test(html)) fail(route, 'missing title');
    const canonicalLinks = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag)).filter(link => link.rel === 'canonical');
    if (canonicalLinks.length !== 1 || normalizeCanonical(canonicalLinks[0]?.href) !== canonical(canonicalPath)) fail(route, `wrong canonical ${canonicalLinks.map(link => link.href).join(', ')}`);
    const alternates = hreflangs(html, route);
    const expectedLanguages = kind === 'native' || kind === 'blog-native'
      ? {[articleLanguage || 'en']: canonical(canonicalPath), 'x-default': canonical(canonicalPath)}
      : languageGroup(sourcePath);
    if (!sameGroup(alternates, expectedLanguages)) fail(route, `wrong hreflang ${JSON.stringify(alternates)}`);
    if (['translated', 'native', 'blog-native'].includes(kind) && !sameGroup(alternates, sitemapGroups.get(canonical(canonicalPath)) || {})) fail(route, 'page and sitemap hreflang differ');
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    if (kind === 'private' && !noindex) fail(route, 'private page missing noindex');
    if (kind !== 'private' && noindex) fail(route, 'public page is noindex');
    for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/') || /\.[^/]+(?:[?#]|$)/.test(href)) continue;
      const pathname = href.split(/[?#]/)[0];
      if (locales.slice(1).some(language => englishOnly.some(article => pathname === localized(article, language)))) fail(route, `English-only article link has language prefix: ${href}`);
      if (/^\/(?:ko|ja|fr|es|zh-TW)\/ozil-goal-generator\/blog(?:\/|$)/.test(pathname) && !isTranslatedBlog(stripLocale(pathname))) fail(route, `native blog link has language prefix: ${href}`);
      if (kind !== 'translated' || locale === 'en') continue;
      if (englishOnly.includes(pathname) || stripLocale(pathname).startsWith(`${blogIndex}/`) || isTranslatedBlog(stripLocale(pathname))) continue;
      if (!new RegExp(`^/${locale}(?:/|#|\\?|$)`).test(href)) fail(route, `link lost language: ${href}`);
    }
  }
}));

const missingPaths = [
  '/de', '/fr/not-a-page', '/blog', '/showcases', '/ai-rap-song-generator',
  '/hotel-lobby-ai-video-generator',
  ...locales.slice(1).flatMap(locale => ['/blog', '/showcases', '/ai-rap-song-generator', '/hotel-lobby-ai-video-generator', ...englishOnly].map(path => localized(path, locale))),
];
for (const path of missingPaths) {
  const {status} = await read(path);
  if (status !== 404) fail(path, `expected 404, got ${status}`);
}

console.log(JSON.stringify({checked, sitemapCount: locations.length, translatedOzilPages: ozilPages.length * locales.length, nativeEnglishPages: englishOnly.length, missingPathsChecked: missingPaths.length, blogPosts: nativeBlogPosts.length + translatedBlogPosts.length, nativeBlogPosts: nativeBlogPosts.length, translatedBlogPosts: translatedBlogPosts.length, failures}, null, 2));
if (failures.length) process.exitCode = 1;
