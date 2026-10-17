import { describe, expect, it } from "vitest";
import sitemap from "../app/sitemap";
import { generateMetadata, generateStaticParams } from "../app/ozil-goal-generator/blog/[slug]/page";

const nativeArticles = [
  ["what-is-ozil-goal-trend", "en"],
  ["why-ozil-goal-videos-are-popular", "en"],
  ["how-to-make-ozil-goal-ai-video", "en"],
  ["which-app-makes-ozil-goal-effect", "en"],
  ["ozil-goal-ai-video-prompt", "en"],
  ["can-you-make-ozil-goal-video-free", "en"],
  ["o-que-e-trend-gol-do-ozil", "pt-BR"],
  ["como-fazer-gol-do-ozil-com-ia", "pt-BR"],
  ["como-colocar-minha-foto-no-gol-do-ozil", "pt-BR"],
  ["prompt-gol-do-ozil-com-ia", "pt-BR"],
  ["que-es-trend-gol-de-ozil", "es"],
  ["como-hacer-video-gol-de-ozil-con-ia", "es"],
  ["gol-de-ozil-con-mi-foto", "es"],
  ["donde-hacer-gol-de-ozil-gratis", "es"],
] as const;

describe("Ozil blog discovery", () => {
  it("indexes the blog and native articles without inventing translated copies", () => {
    const entries = sitemap();
    const paths = [
      ...nativeArticles.map(([slug]) => `/ozil-goal-generator/blog/${slug}`),
    ];
    for (const path of paths) {
      const matches = entries.filter(entry => new URL(entry.url).pathname.endsWith(path));
      expect(matches.map(entry => entry.url)).toEqual([`https://ozilgoal-aivideo.com${path}`]);
    }
    expect(generateStaticParams()).toEqual([...nativeArticles.map(([slug]) => ({ slug })), ...["lamine-yamal", "sepak-bola", "gol-pakai", "gol-de-ozil"].map(slug => ({ slug }))]);
  });

  it.each(nativeArticles)("keeps %s in its own native-language group in sitemap and page metadata", async (slug, language) => {
    const url = `https://ozilgoal-aivideo.com/ozil-goal-generator/blog/${slug}`;
    const expectedLanguages = { [language]: url, "x-default": url };
    const entry = sitemap().find(entry => entry.url === url);
    const metadata = await generateMetadata({ params: Promise.resolve({ slug }) });

    expect(entry?.alternates?.languages).toEqual(expectedLanguages);
    expect(metadata.alternates).toEqual({ canonical: url, languages: expectedLanguages });
    expect(metadata.alternates?.languages).toEqual(entry?.alternates?.languages);
  });
});
