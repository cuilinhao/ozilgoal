import { englishPosts } from "./en";
import { portuguesePosts } from "./pt";
import { spanishPosts } from "./es";
import type { OzilBlogPost } from "./types";
import { keywordPosts } from "./keywords";
import { locales, localizeHref, type Locale } from "@/lib/i18n/routing";
import { OZIL_BLOG_PATH } from "./routes";
export { OZIL_BLOG_PATH } from "./routes";

export const OZIL_BLOG_UPDATED = "2026-10-17";
export const nativeOzilBlogPosts: OzilBlogPost[] = [...englishPosts, ...portuguesePosts, ...spanishPosts];
export const ozilBlogPosts: OzilBlogPost[] = [...nativeOzilBlogPosts, ...keywordPosts];
export const ozilBlogLanguages = [
  { language: "en", label: "English", description: "The trend, the tools, photo tutorials and what free really means." },
  { language: "pt-BR", label: "Português", description: "Entenda a trend do gol do Özil e aprenda a criar seu vídeo com IA." },
  { language: "es", label: "Español", description: "Qué es el gol de Özil con IA, cómo usar tu foto y qué opciones son gratis." },
] as const;

/** Explicit locales select a translation; native slugs retain their authored language. */
export function getOzilBlogPost(slug: string, language?: Locale): OzilBlogPost | undefined {
  return ozilBlogPosts.find(post => post.slug === slug && (!post.translationKey || post.language === (language ?? "en")));
}

export function ozilBlogIndexPosts(locale: Locale): OzilBlogPost[] {
  return [...keywordPosts.filter(post => post.language === locale), ...nativeOzilBlogPosts];
}

export function ozilBlogIndexAlternates(): Record<string, string> {
  return Object.fromEntries([...locales.map(locale => [locale, localizeHref(OZIL_BLOG_PATH, locale)]), ["x-default", OZIL_BLOG_PATH]]);
}

/** Only the same translation key establishes an actual language alternative. */
export function ozilBlogAlternates(post: OzilBlogPost): Record<string, string> {
  if (!post.translationKey) return { [post.language]: post.path, "x-default": post.path };
  const translations = ozilBlogPosts.filter(candidate => candidate.translationKey === post.translationKey);
  const defaultPost = translations.find(candidate => candidate.language === "en") ?? post;
  return Object.fromEntries([...translations.map(candidate => [candidate.language, candidate.path]), ["x-default", defaultPost.path]]);
}
