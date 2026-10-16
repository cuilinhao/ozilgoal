"use client";
import { Languages } from "lucide-react";
import { useLocale } from "./locale-provider";
import { locales, languageNames, localizeHref, type Locale } from "@/lib/i18n/routing";
const labels: Record<Locale, string> = { en: "Select language", ko: "언어 선택", ja: "言語を選択", fr: "Choisir la langue", es: "Seleccionar idioma", "zh-TW": "選擇語言" };
export function LanguageSwitcher({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const locale = useLocale();
  return <label className={`locale-switcher ${compact ? "locale-switcher-compact" : ""} ${className}`}>
    <Languages size={17} aria-hidden="true"/>
    <select aria-label={labels[locale]} value={locale} onChange={(event) => {
      const next = event.target.value as Locale;
      const url = new URL(window.location.href);
      // The former preview-only selector used this query. The full page now owns its language.
      url.searchParams.delete("blogLang");
      // A full navigation updates the root document language and all server content.
      window.location.assign(localizeHref(url.pathname + url.search + url.hash, next));
    }}>{locales.map((value) => <option lang={value} value={value} key={value}>{languageNames[value]}</option>)}</select>
  </label>;
}
