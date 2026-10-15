import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../app/page";
import AccountVideoGeneratorPage from "../app/app/video-generator/page";
import { generateMetadata as localizedMetadata } from "../app/[locale]/[[...path]]/page";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import * as generationHistoryRoute from "../app/api/generations/route";
import { AuthProvider } from "../components/auth-provider";
import { OzilGoalPage } from "../components/ozil-goal/page-content";
import { localizeMetadata } from "../lib/i18n/server";
import { publicPages } from "../content/public-pages";

const request = vi.hoisted(() => ({ locale: "en", path: "/" }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({
    "x-migos-locale": request.locale,
    "x-migos-pathname": request.path,
  }),
}));

describe("standalone Ozil public scope", () => {
  it("shows the Ozil generator on the site home page", async () => {
    const page = await HomePage();
    expect(page.type).toBe(OzilGoalPage);
    const html = renderToStaticMarkup(createElement(AuthProvider, null, await OzilGoalPage(page.props)));
    expect(html).toContain("Make my video");
    expect(html).toContain('aria-label="Player photo"');
    expect(html).not.toContain("Make Your Own Hotel Lobby Video with AI");
  });

  it("keeps account generation focused on the Ozil photo workflow", () => {
    const html = renderToStaticMarkup(createElement(AuthProvider, null, createElement(AccountVideoGeneratorPage)));
    expect(html).toContain('aria-label="Player photo"');
    expect(html).not.toContain("Person 2");
  });

  it.each([
    "/hotel-lobby-ai-video-generator",
    "/hotel-lobby-ai-template",
    "/ai-rap-song-generator",
    "/showcases",
    "/blog",
    "/blog/what-is-hotel-lobby-ai-video",
  ])("returns 404 for the legacy localized path %s", async path => {
    await expect(localizedMetadata({ params: Promise.resolve({ locale: "fr", path: path.slice(1).split("/") }) }))
      .rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("uses the root URL as canonical for both home paths in each locale", async () => {
    for (const [locale, canonical] of [
      ["en", "https://ozilgoal-aivideo.com/"],
      ["fr", "https://ozilgoal-aivideo.com/fr"],
    ] as const) {
      request.locale = locale;
      for (const path of ["/", "/ozil-goal-generator"]) {
        request.path = path;
        const metadata = await localizeMetadata({ title: "Ozil Goal Generator" });
        expect(metadata.alternates?.canonical).toBe(canonical);
        expect(metadata.alternates?.languages?.en).toBe("https://ozilgoal-aivideo.com/");
      }
    }
    request.locale = "en";
    request.path = "/";
  });

  it("indexes only the Ozil, pricing and support pages on the new domain", () => {
    const paths = publicPages.map(page => page.path);
    expect(paths).toContain("/");
    expect(paths).toContain("/ozil-goal-generator/ozil-goal-ai-prompt");
    expect(paths).toContain("/pricing");
    expect(paths).not.toContain("/ozil-goal-generator");
    expect(paths).not.toContain("/showcases");
    expect(paths).not.toContain("/blog");
    expect(paths.some(path => path.startsWith("/hotel-lobby-"))).toBe(false);
    const entries = sitemap();
    expect(entries.every(entry => entry.url.startsWith("https://ozilgoal-aivideo.com/"))).toBe(true);
    expect(entries.some(entry => entry.url === "https://ozilgoal-aivideo.com/")).toBe(true);
    expect(entries.some(entry => entry.url === "https://ozilgoal-aivideo.com/ozil-goal-generator")).toBe(false);
  });

  it("keeps the shared history endpoint read-only", () => {
    expect(generationHistoryRoute.GET).toBeTypeOf("function");
    expect(Object.hasOwn(generationHistoryRoute, "POST")).toBe(false);
  });

  it("advertises the new sitemap to crawlers", () => {
    expect(robots().sitemap).toBe("https://ozilgoal-aivideo.com/sitemap.xml");
  });
});
