import { headers } from "next/headers";
import type { Metadata } from "next";
import { cache } from "react";
import { getMessages } from "./index";
import { createTranslator } from "./translator";
import { isEnglishOnlyOzilPath, isLocale, locales, localeTags, localizeHref, type Locale } from "./routing";
import { SITE_URL } from "@/content/public-pages";
import { getOzilBlogPost, OZIL_BLOG_PATH } from "@/content/ozil-blog";
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await headers()).get("x-migos-locale") || "en";
  return isLocale(value) ? value : "en";
});
export const getTranslations = cache(async () => createTranslator(getMessages(await getLocale())));
export async function getDocumentLanguage(): Promise<string> {
  const pathname = (await headers()).get("x-migos-pathname") || "/";
  if (pathname.startsWith(`${OZIL_BLOG_PATH}/`)) {
    const slug = pathname.slice(OZIL_BLOG_PATH.length + 1);
    if (slug && !slug.includes("/")) return getOzilBlogPost(slug)?.language ?? getLocale();
  }
  return getLocale();
}
export async function localizeMetadata(metadata: Metadata): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations();
  const pathname = (await headers()).get("x-migos-pathname") || "/";
  const canonicalPath = pathname === "/ozil-goal-generator" ? "/" : pathname;
  const englishOnly = isEnglishOnlyOzilPath(canonicalPath);
  const canonical = new URL(localizeHref(canonicalPath, locale), SITE_URL).href;
  const title = typeof metadata.title === "string" ? t(metadata.title) : metadata.title ? Object.fromEntries(Object.entries(metadata.title).map(([key, value]) => [key, typeof value === "string" ? t(value) : value])) as Metadata["title"] : metadata.title;
  const privatePage = /^\/(app(?:\/|$)|sign-in(?:\/|$)|sign-up(?:\/|$))/.test(pathname);
  return {
    ...metadata,
    ...(metadata.title ? { title } : {}),
    ...(metadata.description ? { description: t(metadata.description) } : {}),
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
    alternates: { ...metadata.alternates, canonical, languages: Object.fromEntries([...(englishOnly ? ["en"] as const : locales).map((language) => [language, new URL(localizeHref(canonicalPath, language), SITE_URL).href]), ["x-default", new URL(canonicalPath, SITE_URL).href]]) },
    ...(metadata.openGraph ? { openGraph: { ...metadata.openGraph, url: canonical, locale: localeTags[locale].replace("-", "_"), alternateLocale: englishOnly ? [] : locales.filter(l => l !== locale).map(l => localeTags[l].replace("-", "_")), ...(typeof metadata.openGraph.title === "string" ? { title: t(metadata.openGraph.title) } : {}), ...(metadata.openGraph.description ? { description: t(metadata.openGraph.description) } : {}) } } : {}),
    ...(metadata.twitter ? { twitter: { ...metadata.twitter, ...(typeof metadata.twitter.title === "string" ? { title: t(metadata.twitter.title) } : {}), ...(metadata.twitter.description ? { description: t(metadata.twitter.description) } : {}) } } : {}),
  };
}
