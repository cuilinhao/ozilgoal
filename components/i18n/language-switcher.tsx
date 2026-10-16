"use client";
import { useEffect, useState } from "react";
import { Languages } from "lucide-react";
import { useLocale } from "./locale-provider";
import { isLocale, locales, languageNames, localizeHref, type Locale } from "@/lib/i18n/routing";
const labels: Record<Locale, string> = { en: "Select language", ko: "언어 선택", ja: "言語を選択", fr: "Choisir la langue", es: "Seleccionar idioma", "zh-TW": "選擇語言" };
const previewLabels: Record<Locale, string> = { en: "Blog preview language", ko: "블로그 미리보기 언어", ja: "ブログプレビューの言語", fr: "Langue de l’aperçu du blog", es: "Idioma de la vista previa del blog", "zh-TW": "部落格預覽語言" };
export function LanguageSwitcher({ compact = false, className = "", previewOnly = false }: { compact?: boolean; className?: string; previewOnly?: boolean }) {
  const locale = useLocale();
  const [previewLocale, setPreviewLocale] = useState<Locale>("en");
  useEffect(() => {
    if (!previewOnly) return;
    const values = new URLSearchParams(window.location.search).getAll("blogLang");
    setPreviewLocale(values.length === 1 && isLocale(values[0]) ? values[0] : "en");
  }, [previewOnly]);
  return <label className={`locale-switcher ${compact ? "locale-switcher-compact" : ""} ${className}`}>
    <Languages size={17} aria-hidden="true"/>
    <select aria-label={previewOnly ? previewLabels[previewLocale] : labels[locale]} value={previewOnly ? previewLocale : locale} onChange={(event) => {
      const next = event.target.value as Locale;
      if (previewOnly) {
        const url = new URL(window.location.href);
        if (next === "en") url.searchParams.delete("blogLang");
        else url.searchParams.set("blogLang", next);
        window.location.assign(url.href);
        return;
      }
      // A full navigation updates the root document language and all server content.
      window.location.assign(localizeHref(window.location.pathname + window.location.search + window.location.hash, next));
    }}>{locales.map((value) => <option lang={value} value={value} key={value}>{languageNames[value]}</option>)}</select>
  </label>;
}
