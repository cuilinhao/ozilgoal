import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import HomePage from "../app/page";
import { AuthProvider } from "../components/auth-provider";
import { OzilGoalPage } from "../components/ozil-goal/page-content";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-migos-locale": "en", "x-migos-pathname": "/" }),
}));

describe("home preview language selection", () => {
  it("renders Japanese teasers from a valid blogLang query without changing the home locale", async () => {
    const page = await HomePage({ searchParams: Promise.resolve({ blogLang: "ja" }) });
    const html = renderToStaticMarkup(createElement(AuthProvider, null, await OzilGoalPage(page.props)));
    const preview = html.match(/<section class="ozil-blog-preview"[\s\S]*?<\/section>/)?.[0];
    expect(preview).toContain("トレンドを知る");
    expect(preview).not.toContain("Português");
    expect(html).toContain("Ozil Goal AI Video Generator turns one photo");
  });

  it("uses English for an unsupported blogLang value", async () => {
    const page = await HomePage({ searchParams: Promise.resolve({ blogLang: "invalid" }) });
    const html = renderToStaticMarkup(createElement(AuthProvider, null, await OzilGoalPage(page.props)));
    const preview = html.match(/<section class="ozil-blog-preview"[\s\S]*?<\/section>/)?.[0];
    expect(preview).toContain("What Is the Ozil Goal Trend on TikTok?");
    expect(preview).not.toContain("Português");
  });
});
