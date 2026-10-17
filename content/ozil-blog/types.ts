import type { BlogPost } from "../blog";
import type { Locale } from "@/lib/i18n/routing";
import type { OzilKeywordSlug } from "./routes";

export type OzilBlogLanguage = Locale | "pt-BR";
export type OzilBlogTopic = "trend" | "viral" | "photo" | "apps" | "prompt" | "free" | "tutorial" | OzilKeywordSlug;

/** Native articles retain their own URLs; translated series share a translationKey. */
export type OzilBlogPost = BlogPost & {
  language: OzilBlogLanguage;
  topic: OzilBlogTopic;
  translationKey?: OzilKeywordSlug;
};
