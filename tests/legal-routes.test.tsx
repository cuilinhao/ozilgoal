import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { type ReactElement } from "react";
import LocalizedPage, { generateMetadata } from "../app/[locale]/[[...path]]/page";
import { LegalPage } from "../components/sections/legal-page";
import { LocaleProvider } from "../components/i18n/locale-provider";
import { SiteFooter } from "../components/site-footer";
import { getMessages, locales, localizeHref } from "../lib/i18n";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "../content/support";

const request = vi.hoisted(() => ({ locale: "en", path: "/" }));
vi.mock("next/headers", () => ({ headers: async () => new Headers({ "x-migos-locale": request.locale, "x-migos-pathname": request.path }) }));

describe("policy routes and support access", () => {
  it.each(locales)("renders the policy and contact routes and footer links in %s", async (locale) => {
    request.locale = locale;
    const messages = getMessages(locale);
    for (const [path, title] of [["privacy-policy", "Privacy Policy"], ["terms-of-service", "Terms of Service"], ["refund-policy", "Refund Policy"], ["acceptable-use-policy", "Acceptable Use Policy"], ["contact", "Contact"]]) {
      request.path = `/${path}`;
      const params = Promise.resolve({ locale, path: [path] });
      const route = await LocalizedPage({ params });
      // Resolve the reused async server page and its LegalPage template before SSR.
      const Page = route.type as () => Promise<ReactElement<Parameters<typeof LegalPage>[0]>>;
      const page = await Page();
      const content = await LegalPage(page.props);
      const html = renderToStaticMarkup(<LocaleProvider locale={locale} messages={messages}>{content}</LocaleProvider>);
      expect(html).toContain(`<h1>${messages[title] ?? title}</h1>`);
      expect(html).toContain(`href="${SUPPORT_MAILTO}"`);
      expect(html).toContain(SUPPORT_EMAIL);
      expect(html).not.toMatch(/LobbyDuo|migosai\.design|Hotel Lobby|Waffo|Wan 3\.0/i);
      expect(html).toContain(`href="${localizeHref(path === "terms-of-service" ? "/privacy-policy" : "/terms-of-service", locale)}"`);
      const metadata = await generateMetadata({ params });
      expect(metadata.alternates?.canonical).toBe(`https://ozilgoal-aivideo.com${localizeHref(`/${path}`, locale)}`);
    }
    const footer = renderToStaticMarkup(<LocaleProvider locale={locale} messages={messages}><SiteFooter/></LocaleProvider>);
    expect(footer).toContain(`href="${localizeHref("/refund-policy", locale)}"`);
    expect(footer).toContain(`href="${localizeHref("/acceptable-use-policy", locale)}"`);
    expect(footer).toContain(`href="${localizeHref("/contact", locale)}"`);
    expect(footer).toContain("Ozil Goal Generator");
    expect(footer).not.toMatch(/LobbyDuo|migosai\.design|hotel-lobby|ai-rap-song/i);
    expect(footer).toContain(`href="${SUPPORT_MAILTO}"`);
    expect(footer).toContain(SUPPORT_EMAIL);
  });

  it.each(locales)("discloses GA4 cookies and visitor choices on the privacy page in %s", async (locale) => {
    request.locale = locale;
    request.path = "/privacy-policy";
    const messages = getMessages(locale);
    const route = await LocalizedPage({ params: Promise.resolve({ locale, path: ["privacy-policy"] }) });
    const Page = route.type as () => Promise<ReactElement<Parameters<typeof LegalPage>[0]>>;
    const page = await Page();
    const content = await LegalPage(page.props);
    const html = renderToStaticMarkup(<LocaleProvider locale={locale} messages={messages}>{content}</LocaleProvider>);
    const analytics = html.split('<section id="google-analytics"')[1]?.split("</section>")[0];
    const collection = html.split('<section id="information-collection-and-use"')[1]?.split("</section>")[0];

    expect(analytics).toBeDefined();
    expect(analytics).toContain("Google Analytics 4");
    expect(analytics).toContain('href="https://tools.google.com/dlpage/gaoptout"');
    expect(analytics).toContain('href="https://policies.google.com/technologies/partner-sites"');
    expect(collection).toContain("Google Analytics");
    if (locale !== "en") expect(analytics).not.toContain("We use Google Analytics 4 on our production website");
  });
});
