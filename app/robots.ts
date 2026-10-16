import type { MetadataRoute } from 'next';
import { locales, localizeHref } from '@/lib/i18n/routing';
import { SITE_URL } from '@/content/public-pages';
export default function robots(): MetadataRoute.Robots {
  // Specific user-agent groups do not inherit exclusions from the wildcard group.
  const disallow = ['/api/', ...locales.flatMap(locale => ['/app/', '/sign-in', '/sign-up'].map(path => localizeHref(path, locale)))];
  return {
    rules: ['*', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Bingbot'].map(userAgent => ({ userAgent, allow: '/', disallow })),
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
