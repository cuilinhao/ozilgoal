import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OzilBlogPreview } from "../components/ozil-goal/blog";
import type { Locale } from "../lib/i18n/routing";

function renderPreview(locale: Locale) {
  return renderToStaticMarkup(createElement(OzilBlogPreview as ComponentType<{ locale: Locale }>, { locale }));
}

describe("Ozil home blog preview", () => {
  it("shows three English article teasers when English is selected", () => {
    const html = renderPreview("en");
    expect(html.match(/class="blog-card"/g)).toHaveLength(3);
    expect(html).toContain("What Is the Ozil Goal Trend on TikTok?");
    expect(html).toContain("How Do I Make an Ozil Goal AI Video with My Photo?");
    expect(html).not.toContain("Português");
    expect(html).not.toContain("Español");
  });

  it("shows Japanese copy and identifies linked articles as English", () => {
    const html = renderPreview("ja");
    expect(html.match(/class="blog-card"/g)).toHaveLength(3);
    expect(html).toContain("トレンドを知る");
    expect(html).toContain("英語");
    expect(html).not.toContain("What Is the Ozil Goal Trend on TikTok?");
    expect(html).not.toContain("Read article");
    expect(html).not.toContain("Português");
  });

  it("links Spanish teasers to Spanish articles", () => {
    const html = renderPreview("es");
    expect(html.match(/class="blog-card"/g)).toHaveLength(3);
    expect(html).toContain("¿Qué es el trend del gol de Özil en TikTok?");
    expect(html).toContain("/ozil-goal-generator/blog/que-es-trend-gol-de-ozil");
    expect(html).not.toContain("What Is the Ozil Goal Trend on TikTok?");
  });
});
