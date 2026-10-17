"use client";
import NextLink from "next/link";
import type { ComponentProps } from "react";
import { useLocale } from "./locale-provider";
import { OZIL_BLOG_PATH, isTranslatedOzilBlogPath } from "@/content/ozil-blog/routes";
import { isEnglishOnlyOzilPath, localizeHref } from "@/lib/i18n/routing";
export default function LocalizedLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const localized = typeof href === "string" ? localizeHref(href, locale) : href.pathname ? { ...href, pathname: localizeHref(href.pathname, locale) } : href;
  // These articles own their document language. A client transition would retain
  // the previous RootLayout's lang and LocaleProvider, so use a document request.
  if (typeof localized === "string" && (isEnglishOnlyOzilPath(localized) || (localized.startsWith(`${OZIL_BLOG_PATH}/`) && !isTranslatedOzilBlogPath(localized)))) {
    const { replace, scroll, shallow, prefetch, locale: linkLocale, legacyBehavior, passHref, onNavigate, ...anchorProps } = props;
    return <a href={localized} {...anchorProps}/>;
  }
  return <NextLink href={localized} {...props}/>;
}
