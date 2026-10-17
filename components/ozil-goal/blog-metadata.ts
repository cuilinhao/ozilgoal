import type { Metadata } from "next";
import { SITE_URL } from "@/content/public-pages";
import { OZIL_BLOG_PATH, ozilBlogAlternates, ozilBlogIndexAlternates } from "@/content/ozil-blog";
import type { OzilBlogPost } from "@/content/ozil-blog/types";
import { localeTags, localizeHref, type Locale } from "@/lib/i18n/routing";
import { ozilBlogIndexUi, ozilBlogText } from "./blog-ui";

export function ozilBlogMetadata(post?: OzilBlogPost, locale: Locale = "en"): Metadata {
  const language = post?.language ?? locale;
  const indexUi = ozilBlogIndexUi[locale];
  const title = post?.metaTitle ?? indexUi.metaTitle;
  const description = ozilBlogText(post?.description ?? indexUi.description);
  const url = `${SITE_URL}${post?.path ?? localizeHref(OZIL_BLOG_PATH, locale)}`;
  const languages = post ? ozilBlogAlternates(post) : ozilBlogIndexAlternates();
  const openGraphLocale = (value: string) => value === "pt-BR" ? "pt_BR" : localeTags[value as Locale].replace("-", "_");
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url, languages: Object.fromEntries(Object.entries(languages).map(([language, path]) => [language, `${SITE_URL}${path}`])) },
    openGraph: {
      title, description, url, siteName: "Ozil Goal Generator", type: post ? "article" : "website",
      locale: openGraphLocale(language),
      alternateLocale: Object.keys(languages).filter(value => value !== language && value !== "x-default").map(openGraphLocale),
      images: [{ url: "/ozil-goal/samples/ai-shot1.jpg", width: 496, height: 864, alt: ozilBlogIndexUi[language === "pt-BR" ? "en" : language].coverAlt }],
      ...(post ? { publishedTime: post.datePublished, modifiedTime: post.dateModified } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: ["/ozil-goal/samples/ai-shot1.jpg"] },
  };
}
