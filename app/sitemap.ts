import type { MetadataRoute } from "next";
import { isEnglishOnlyOzilPath, locales, localizeHref } from "../lib/i18n/routing";
import { publicPages, SITE_URL } from "../content/public-pages";
import { OZIL_BLOG_PATH, OZIL_BLOG_UPDATED, ozilBlogIndexAlternates, ozilBlogAlternates, ozilBlogPosts } from "../content/ozil-blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const translatedPages = publicPages.flatMap(({ path, priority, changeFrequency, lastModified }) => (isEnglishOnlyOzilPath(path) ? ["en"] as const : locales).map((locale) => ({
    url: new URL(localizeHref(path, locale), SITE_URL).href,
    alternates: { languages: Object.fromEntries([...(isEnglishOnlyOzilPath(path) ? ["en"] as const : locales).map((language) => [language, new URL(localizeHref(path, language), SITE_URL).href]), ["x-default", new URL(path, SITE_URL).href]]) },
    priority,
    changeFrequency,
    ...(lastModified ? { lastModified } : {}),
  })));
  // Each published translation is indexed once; native articles keep their own URLs.
  return [...translatedPages,
    ...locales.map(locale => ({ url: `${SITE_URL}${localizeHref(OZIL_BLOG_PATH, locale)}`, priority: 0.7, changeFrequency: "weekly" as const, lastModified: OZIL_BLOG_UPDATED,
      alternates: { languages: Object.fromEntries(Object.entries(ozilBlogIndexAlternates()).map(([language, path]) => [language, `${SITE_URL}${path}`])) },
    })),
    ...ozilBlogPosts.map(post => ({
      url: `${SITE_URL}${post.path}`, priority: 0.7, changeFrequency: "monthly" as const, lastModified: post.dateModified,
      alternates: { languages: Object.fromEntries(Object.entries(ozilBlogAlternates(post)).map(([language, path]) => [language, `${SITE_URL}${path}`])) },
    })),
  ];
}
