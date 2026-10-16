// Read-only route and metadata smoke check against local Next.js or a Cloudflare preview.
// Usage: node scripts/check-i18n.mjs http://127.0.0.1:3011
const origin = (process.argv[2] || 'http://127.0.0.1:3011').replace(/\/$/, '');
const site = 'https://ozilgoal-aivideo.com';
const locales = ['en', 'ko', 'ja', 'fr', 'es', 'zh-TW'];
const englishOnly = [
  '/',
  '/mesut-ozil-ludogorets-goal',
  '/ozil-goal-generator/ozil-goal-ai-prompt',
  '/ozil-goal-generator/ozil-goal-ai-template',
  '/ozil-goal-generator/ozil-goal-trend',
  '/ozil-goal-generator/ozil-goal-meme',
  '/ozil-goal-generator/ozil-goal-capcut-template',
  '/ozil-goal-generator/ai-football-video-from-photo',
];
const translated = [
  '/pricing', '/privacy-policy', '/terms-of-service',
  '/refund-policy', '/acceptable-use-policy', '/contact',
];
const privatePaths = [
  '/sign-in', '/sign-up', '/app/video-generator',
  '/app/my-videos', '/app/my-orders', '/app/my-credits',
];
const localized = (path, locale) => locale === 'en' ? path : `/${locale}${path}`;
const canonical = path => new URL(path, site).href.replace(/\/$/, '');
const failures = [];
const fail = (route, error) => failures.push({route, error});

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
if (locations.length !== new Set(locations).size) fail('/sitemap.xml', 'duplicate URLs');
if (locations.some(url => new URL(url).origin !== site)) fail('/sitemap.xml', 'unexpected origin');
const publicPaths = [...englishOnly, ...locales.flatMap(locale => translated.map(path => localized(path, locale)))];
for (const path of publicPaths) if (!paths.has(path)) fail('/sitemap.xml', `missing ${path}`);
if (!paths.has('/ozil-goal-generator/blog')) fail('/sitemap.xml', 'missing Ozil blog index');
const blogPosts = [...paths].filter(path => path.startsWith('/ozil-goal-generator/blog/'));
if (!blogPosts.length) fail('/sitemap.xml', 'missing native-language Ozil blog posts');
for (const path of paths) {
  if (/^\/(?:ko\/|ja\/|fr\/|es\/|zh-TW\/)?(?:hotel-lobby-|ai-rap-song-generator|showcases|blog(?:\/|$))/.test(path)) fail('/sitemap.xml', `legacy route ${path}`);
  if (/^\/(?:ko\/|ja\/|fr\/|es\/|zh-TW\/)?(?:app|api|sign-in|sign-up)(?:\/|$)/.test(path)) fail('/sitemap.xml', `private route ${path}`);
  if (path === '/ozil-goal-generator' || locales.slice(1).some(locale => path === `/${locale}` || englishOnly.slice(1).some(guide => path === `/${locale}${guide}`))) fail('/sitemap.xml', `duplicate English-only page ${path}`);
}

const queue = [
  ...englishOnly.map(route => ({route, locale: 'en', canonicalPath: route, kind: 'public'})),
  ...locales.flatMap(locale => translated.map(path => ({route: localized(path, locale), locale, canonicalPath: localized(path, locale), kind: 'translated'}))),
  ...locales.flatMap(locale => privatePaths.map(path => ({route: localized(path, locale), locale, canonicalPath: localized(path, locale), kind: 'private'}))),
  {route: '/ozil-goal-generator', locale: 'en', canonicalPath: '/', kind: 'alias'},
  ...['/ozil-goal-generator/blog', ...blogPosts].map(route => ({route, locale: 'en', canonicalPath: route, kind: 'blog'})),
];
let checked = 0;
await Promise.all(Array.from({length: 6}, async () => {
  while (queue.length) {
    const {route, locale, canonicalPath, kind} = queue.shift();
    const {status, html} = await read(route);
    if (status !== 200) { fail(route, `HTTP ${status}`); continue; }
    checked++;
    const documentLanguage = /<html\b[^>]*\blang="([^"]+)"/.exec(html)?.[1];
    const articleLanguage = kind === 'blog' && route !== '/ozil-goal-generator/blog'
      ? /<article\b[^>]*\blang="([^"]+)"/.exec(html)?.[1] : undefined;
    if (documentLanguage !== (articleLanguage || locale)) fail(route, `wrong document language ${documentLanguage}`);
    if (!/<title>[^<]+<\/title>/.test(html)) fail(route, 'missing title');
    const currentCanonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    if (currentCanonical?.replace(/\/$/, '') !== canonical(canonicalPath)) fail(route, `wrong canonical ${currentCanonical}`);
    const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
    if (kind === 'private' && !noindex) fail(route, 'private page missing noindex');
    if (kind !== 'private' && noindex) fail(route, 'public page is noindex');
    if (kind === 'translated' && locale !== 'en') {
      for (const [, href] of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
        if (!href.startsWith('/') || href.startsWith('//') || href.startsWith('/api/') || /\.[^/]+(?:[?#]|$)/.test(href)) continue;
        if (englishOnly.includes(href.split(/[?#]/)[0]) || href.startsWith('/ozil-goal-generator/') || /^\/(?:[?#]|$)/.test(href)) continue; // English-only Ozil pages and native blog.
        if (!new RegExp(`^/${locale}(?:/|#|\\?|$)`).test(href)) fail(route, `link lost language: ${href}`);
      }
    }
  }
}));

for (const path of [
  '/de', '/fr/not-a-page', '/blog', '/showcases', '/ai-rap-song-generator',
  '/hotel-lobby-ai-video-generator',
  ...locales.slice(1).flatMap(locale => ['/blog', '/showcases', '/ai-rap-song-generator', '/hotel-lobby-ai-video-generator'].map(path => `/${locale}${path}`)),
  ...locales.slice(1).flatMap(locale => [`/${locale}`, `/${locale}/ozil-goal-generator`, ...englishOnly.slice(1).map(path => `/${locale}${path}`)]),
]) {
  const {status} = await read(path);
  if (status !== 404) fail(path, `expected 404, got ${status}`);
}

console.log(JSON.stringify({checked, sitemapCount: locations.length, blogPosts: blogPosts.length, failures}, null, 2));
if (failures.length) process.exitCode = 1;
