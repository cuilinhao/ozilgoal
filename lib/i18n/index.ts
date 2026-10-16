import { pageMessages } from "./messages/pages";
import { sharedMessages } from "./messages/shared";
import { interactiveMessages } from "./messages/interactive";
import { videoExampleMessages } from "./messages/video-examples";
import { videoCustomizationMessages } from "./messages/video-customization";
import { ozilMessages } from "./messages/ozil";
import { authMessages } from "./messages/auth";
import { createTranslator, type Messages, type Values } from "./translator";
import type { Locale } from "./routing";
export * from "./routing";
export * from "./translator";
export function getMessages(locale: Locale): Messages {
  return locale === "en" ? {} : { ...pageMessages[locale], ...sharedMessages[locale], ...interactiveMessages[locale], ...videoExampleMessages[locale], ...videoCustomizationMessages[locale], ...authMessages[locale], ...ozilMessages[locale] };
}
export function translate(locale: Locale, source: string, values?: Values) { return createTranslator(getMessages(locale))(source, values); }
