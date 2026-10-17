import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LocalizedLink from "../components/i18n/localized-link";
import { LocaleProvider } from "../components/i18n/locale-provider";
import { describe, expect, it } from "vitest";
import { OzilBlogArticle, OzilBlogIndex, OzilBlogPreview } from "../components/ozil-goal/blog";
import { getOzilBlogPost, nativeOzilBlogPosts } from "../content/ozil-blog";
import type { OzilBlogPost } from "../content/ozil-blog/types";
import { locales } from "../lib/i18n/routing";

type Props = { children?: ReactNode; className?: string; href?: string; post?: OzilBlogPost };
function descendants(node: ReactNode): ReactElement<Props>[] {
  if (Array.isArray(node)) return node.flatMap(descendants);
  if (!isValidElement<Props>(node)) return [];
  return [node, ...descendants(node.props.children)];
}

const nativePaths = new Set(nativeOzilBlogPosts.map(post => post.path));

describe("blog navigation across document languages", () => {
  it.each(locales)("reloads the document when switching from the %s article to another language", locale => {
    const tree = OzilBlogArticle({ post: getOzilBlogPost("lamine-yamal", locale)! });
    const navigation = descendants(tree).find(node => node.props.className === "ozil-blog-translations")!;
    const links = descendants(navigation).filter(node => node.props.href);
    expect(links).toHaveLength(5);
    // A Next Link renders the same HTML but retains RootLayout's old LocaleProvider.
    // Native anchors are the boundary contract for refreshing document lang and all UI copy.
    expect(links.every(link => link.type === "a")).toBe(true);
  });

  it("reloads the document for native article cards in a localized blog index", () => {
    const cards = descendants(OzilBlogIndex({ locale: "ja" })).filter(node => node.props.post && !node.props.post.translationKey);
    expect(cards).toHaveLength(14);
    const links = cards.flatMap(card => {
      const renderCard = card.type as (props: { post: OzilBlogPost }) => ReactElement;
      return descendants(renderCard({ post: card.props.post! })).filter(node => node.props.href);
    });
    expect(links).toHaveLength(28);
    expect(links.every(link => link.type === "a" && nativePaths.has(link.props.href!))).toBe(true);
  });

  it("reloads the document when a translated article links to related native articles", () => {
    const tree = OzilBlogArticle({ post: getOzilBlogPost("gol-de-ozil", "es")! });
    const related = descendants(tree).find(node => node.props.className === "geo-link-grid")!;
    const nativeLinks = descendants(related).filter(node => nativePaths.has(node.props.href ?? ""));
    expect(nativeLinks).toHaveLength(4);
    expect(nativeLinks.every(link => link.type === "a")).toBe(true);
  });

  it("reloads the document when home teasers open their native-language articles", () => {
    const nativeLinks = descendants(OzilBlogPreview({ locale: "ja" })).filter(node => nativePaths.has(node.props.href ?? ""));
    expect(nativeLinks).toHaveLength(6);
    expect(nativeLinks.every(link => link.type === "a")).toBe(true);
  });
});

function InspectNavigation({ href }: { href: string }) {
  const link = LocalizedLink({ href, children: "Destination" });
  return createElement("output", { "data-href": link.props.href }, link.type === "a" ? "document" : "client");
}

describe("inline links to native documents", () => {
  it.each([
    ["/mesut-ozil-ludogorets-goal?from=article#finish", "/mesut-ozil-ludogorets-goal?from=article#finish"],
    ["/ozil-goal-generator/blog/gol-de-ozil-con-mi-foto", "/ozil-goal-generator/blog/gol-de-ozil-con-mi-foto"],
  ])("refreshes the document language and provider when a Japanese article opens %s", (href, destination) => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, { locale: "ja", messages: {}, children: createElement(InspectNavigation, { href }) }));
    expect(html).toBe(`<output data-href="${destination}">document</output>`);
  });

  it.each([
    ["/pricing", "/ja/pricing"],
    ["/ozil-goal-generator/blog/lamine-yamal", "/ja/ozil-goal-generator/blog/lamine-yamal"],
  ])("retains client navigation for same-locale destination %s", (href, destination) => {
    const html = renderToStaticMarkup(createElement(LocaleProvider, { locale: "ja", messages: {}, children: createElement(InspectNavigation, { href }) }));
    expect(html).toBe(`<output data-href="${destination}">client</output>`);
  });
});
