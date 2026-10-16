import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFile } from "node:fs/promises";
import sitemap from "../app/sitemap";
import { localizeHref } from "../lib/i18n/routing";

describe("Ludogorets article discovery", () => {
  it("lists one canonical English article with its recorded publication date", () => {
    const entries = sitemap().filter(entry => entry.url.includes("mesut-ozil-ludogorets-goal"));
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      url: "https://ozilgoal-aivideo.com/mesut-ozil-ludogorets-goal",
      lastModified: "2026-10-16",
      alternates: { languages: {
        en: "https://ozilgoal-aivideo.com/mesut-ozil-ludogorets-goal",
        "x-default": "https://ozilgoal-aivideo.com/mesut-ozil-ludogorets-goal",
      } },
    });
  });

  it("keeps navigation on the authored English article in every UI language", () => {
    for (const locale of ["en", "ko", "ja", "fr", "es", "zh-TW"] as const) {
      expect(localizeHref("/mesut-ozil-ludogorets-goal", locale)).toBe("/mesut-ozil-ludogorets-goal");
      expect(localizeHref("/es/mesut-ozil-ludogorets-goal?from=nav#the-goal", locale)).toBe("/mesut-ozil-ludogorets-goal?from=nav#the-goal");
    }
  });
});

describe("Ludogorets article output", () => {
  it("renders the article, source links and clearly identified AI CTA in server HTML", async () => {
    const { default: ArticlePage } = await import("../app/mesut-ozil-ludogorets-goal/page");
    const html = renderToStaticMarkup(createElement(ArticlePage));
    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1);
    expect(html.match(/<h2(?:\s|>)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).toContain("Mesut Özil&#x27;s Ludogorets Goal: Why It Became Iconic");
    expect(html).toMatch(/<time datetime="2016-11-01">/i);
    expect(html).toContain('href="/ozil-goal-generator"');
    expect(html).toContain('href="/ozil-goal-generator/ozil-goal-trend"');
    expect(html).toContain('href="https://www.uefa.com/');
    expect(html).toContain("AI-generated interpretation");
    expect(html).toContain("not match footage");
    expect(html).toContain("not affiliated with");
  });

  it("aligns article metadata and schema with the visible editorial identity and real image", async () => {
    const { default: ArticlePage, generateMetadata } = await import("../app/mesut-ozil-ludogorets-goal/page");
    const metadata = generateMetadata();
    const html = renderToStaticMarkup(createElement(ArticlePage));
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    const url = "https://ozilgoal-aivideo.com/mesut-ozil-ludogorets-goal";
    const imageUrl = "https://ozilgoal-aivideo.com/ozil-goal/ludogorets-match-card.png";
    expect(metadata.title).toEqual({ absolute: "Mesut Özil's Ludogorets Goal: Why It Became Iconic" });
    expect(metadata.alternates).toEqual({ canonical: url, languages: { en: url, "x-default": url } });
    expect(metadata.openGraph).toMatchObject({ type: "article", url, title: data.headline, images: [{ url: imageUrl, width: 1200, height: 630 }] });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", title: data.headline, images: [imageUrl] });
    expect(data).toMatchObject({
      "@type": "Article", headline: "Mesut Özil's Ludogorets Goal: Why It Became Iconic",
      datePublished: "2026-10-16", dateModified: "2026-10-16", url, image: imageUrl,
      inLanguage: "en", author: { "@type": "Organization", name: "Ozil Goal Generator editorial team", url: "https://ozilgoal-aivideo.com" },
    });
    expect(html).toContain(data.author.name);
    expect(html).toMatch(new RegExp(`<time datetime="${data.datePublished}">`, "i"));
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("review");
    expect(metadata).not.toHaveProperty("keywords");
    const image = await readFile(new URL("../public/ozil-goal/ludogorets-match-card.png", import.meta.url));
    expect(image.subarray(1, 4).toString()).toBe("PNG");
    const dimensions = new DataView(image.buffer, image.byteOffset, image.byteLength);
    expect(dimensions.getUint32(16)).toBe(1200);
    expect(dimensions.getUint32(20)).toBe(630);
  });
});
