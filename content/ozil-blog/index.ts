import { englishPosts } from "./en";
import { portuguesePosts } from "./pt";
import { spanishPosts } from "./es";
import type { OzilBlogPost } from "./types";

export const OZIL_BLOG_PATH = "/ozil-goal-generator/blog";
export const OZIL_BLOG_UPDATED = "2026-10-15";
export const ozilBlogPosts: OzilBlogPost[] = [...englishPosts, ...portuguesePosts, ...spanishPosts];
export const ozilBlogLanguages = [
  { language: "en", label: "English", description: "The trend, the tools, photo tutorials and what free really means." },
  { language: "pt-BR", label: "Português", description: "Entenda a trend do gol do Özil e aprenda a criar seu vídeo com IA." },
  { language: "es", label: "Español", description: "Qué es el gol de Özil con IA, cómo usar tu foto y qué opciones son gratis." },
] as const;

export function getOzilBlogPost(slug: string): OzilBlogPost | undefined {
  return ozilBlogPosts.find(post => post.slug === slug);
}

/** Native articles share topics, not translations; only declare each article's own language. */
export function ozilBlogAlternates(post: OzilBlogPost): Record<string, string> {
  return { [post.language]: post.path, "x-default": post.path };
}
