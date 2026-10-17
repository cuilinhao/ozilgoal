import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { publicPages } from "../content/public-pages";

const execute = promisify(execFile);
const site = "https://ozilgoal-aivideo.com";
const blog = "/ozil-goal-generator/blog";
const languages = ["en", "ko", "ja", "fr", "es", "zh-TW"];
const keywords = ["lamine-yamal", "sepak-bola", "gol-pakai", "gol-de-ozil"];
const native = {
  "what-is-ozil-goal-trend": "en", "why-ozil-goal-videos-are-popular": "en", "how-to-make-ozil-goal-ai-video": "en", "which-app-makes-ozil-goal-effect": "en", "ozil-goal-ai-video-prompt": "en", "can-you-make-ozil-goal-video-free": "en",
  "o-que-e-trend-gol-do-ozil": "pt-BR", "como-fazer-gol-do-ozil-com-ia": "pt-BR", "como-colocar-minha-foto-no-gol-do-ozil": "pt-BR", "prompt-gol-do-ozil-com-ia": "pt-BR",
  "que-es-trend-gol-de-ozil": "es", "como-hacer-video-gol-de-ozil-con-ia": "es", "gol-de-ozil-con-mi-foto": "es", "donde-hacer-gol-de-ozil-gratis": "es",
};
const pathFor = (path: string, locale: string) => locale === "en" ? path : `/${locale}${path === "/" ? "" : path}`;
const groupFor = (path: string) => Object.fromEntries([...languages.map(locale => [locale, site + pathFor(path, locale)]), ["x-default", site + path]]);
const nativeGroup = (path: string, locale: string) => ({ [locale]: site + path, "x-default": site + path });

type Fault = "product-link" | "native-mirror" | "missing-translation";
async function runFixture(fault?: Fault) {
  const entries: { url: string; alternates?: { languages: Record<string, string> } }[] = publicPages.flatMap(({ path }) => (path === "/mesut-ozil-ludogorets-goal" ? ["en"] : languages).map(locale => ({
    url: site + pathFor(path, locale),
    alternates: { languages: path === "/mesut-ozil-ludogorets-goal" ? nativeGroup(path, "en") : groupFor(path) },
  })));
  const publicPaths = new Set(entries.map(entry => new URL(entry.url).pathname));
  for (const path of [blog, ...keywords.map(slug => `${blog}/${slug}`)]) for (const locale of languages) {
    if (fault === "missing-translation" && locale === "ja" && path.endsWith("lamine-yamal")) continue;
    entries.push({ url: site + pathFor(path, locale), alternates: { languages: groupFor(path) } });
  }
  for (const [slug, locale] of Object.entries(native)) entries.push({ url: `${site}${blog}/${slug}`, alternates: { languages: nativeGroup(`${blog}/${slug}`, locale) } });
  if (fault === "native-mirror") entries.push({ url: `${site}/ja${blog}/what-is-ozil-goal-trend` });
  const xml = `<urlset>${entries.map(entry => `<url><loc>${entry.url}</loc>${Object.entries(entry.alternates?.languages ?? {}).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`).join("")}</url>`).join("")}</urlset>`;
  const server = createServer((request, response) => {
    const path = new URL(request.url!, "http://localhost").pathname;
    if (path === "/sitemap.xml") { response.end(xml); return; }
    const locale = languages.slice(1).find(value => path === `/${value}` || path.startsWith(`/${value}/`)) ?? "en";
    const base = locale === "en" ? path : path.slice(locale.length + 1) || "/";
    const nativeLanguage = native[base.slice(blog.length + 1) as keyof typeof native];
    const isKeyword = keywords.some(slug => base === `${blog}/${slug}`);
    const isPrivate = ["/sign-in", "/sign-up", "/app/video-generator", "/app/my-videos", "/app/my-orders", "/app/my-credits"].includes(base);
    const isAlias = base === "/ozil-goal-generator";
    if (nativeLanguage && locale !== "en") { response.writeHead(308, { location: base }); response.end(); return; }
    if (!publicPaths.has(path) && base !== blog && !nativeLanguage && !isKeyword && !isPrivate && !isAlias) { response.statusCode = 404; response.end("Missing"); return; }
    const canonicalPath = isAlias ? pathFor("/", locale) : path;
    const inLanguage = nativeLanguage ?? locale;
    const group = nativeLanguage || base === "/mesut-ozil-ludogorets-goal" ? nativeGroup(canonicalPath, inLanguage) : groupFor(isAlias ? "/" : base);
    const links = Object.entries(group).map(([language, href]) => `<link rel="alternate" hreflang="${language}" href="${href}">`).join("");
    const productLink = fault === "product-link" && path === `/ja${blog}/lamine-yamal` ? "/pricing" : pathFor("/pricing", locale);
    response.end(`<html lang="${inLanguage}"><head><title>Fixture</title><link rel="canonical" href="${site}${canonicalPath}">${links}${isPrivate ? '<meta name="robots" content="noindex,nofollow">' : ""}</head><body>${nativeLanguage || isKeyword ? `<article lang="${inLanguage}">Article</article>` : ""}<a href="${productLink}">Pricing</a>${isKeyword ? `<a href="${blog}/lamine-yamal">English article</a>` : ""}</body></html>`);
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  try {
    const result = await execute(process.execPath, ["scripts/check-i18n.mjs", `http://127.0.0.1:${address.port}`]);
    return { exitCode: 0, report: JSON.parse(result.stdout) };
  } catch (error) {
    const failure = error as { code: number; stdout: string };
    return { exitCode: failure.code, report: JSON.parse(failure.stdout) };
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

describe("i18n HTTP smoke checker", () => {
  it("accepts six translated indexes and 24 keyword pages alongside 14 native articles", async () => {
    const { exitCode, report } = await runFixture();
    expect(report.failures).toEqual([]);
    expect(exitCode).toBe(0);
    expect(report.translatedBlogPosts).toBe(24);
    expect(report.nativeBlogPosts).toBe(14);
  });

  it.each(["product-link", "native-mirror", "missing-translation"] as const)("rejects the %s regression", async fault => {
    const { exitCode, report } = await runFixture(fault);
    expect(exitCode).toBe(1);
    const expected = { "product-link": "link lost language: /pricing", "native-mirror": "native blog mirror", "missing-translation": "missing /ja/ozil-goal-generator/blog/lamine-yamal" }[fault];
    expect(report.failures.some((failure: { error: string }) => failure.error.includes(expected))).toBe(true);
  });
});
