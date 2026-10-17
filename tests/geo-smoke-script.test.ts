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
const pathFor = (path: string, language: string) => language === "en" ? path : `/${language}${path === "/" ? "" : path}`;
const groupFor = (path: string) => Object.fromEntries([...languages.map(language => [language, site + pathFor(path, language)]), ["x-default", site + path]]);

// Execute the real script's sitemap/canonical/language audit with captured HTTP
// fixtures. AST boundaries exclude network requests and the unrelated home-page
// product/schema audit, without copying or replacing any validation assertions.
const checkFixture = String.raw`
import ast, json, sys
from pathlib import Path
script = Path("scripts/check-geo.py").resolve()
tree = ast.parse(script.read_text(), filename=str(script))
def assigns(node, name):
    return isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == name for target in node.targets)
setup_end = next(i for i, node in enumerate(tree.body) if assigns(node, "sitemap_body"))
audit_start = next(i for i, node in enumerate(tree.body) if assigns(node, "paths"))
audit_end = next(i for i, node in enumerate(tree.body) if isinstance(node, ast.For) and isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name) and node.iter.func.id == "sorted" and any(isinstance(arg, ast.Name) and arg.id == "expected" for arg in node.iter.args))
fixture = json.loads(sys.argv[1])
sys.argv = [str(script)]
namespace = {"__file__": str(script)}
exec(compile(ast.Module(body=tree.body[:setup_end], type_ignores=[]), str(script), "exec"), namespace)
namespace.update(locations=list(fixture), sitemap_languages={url: item["alternates"] for url, item in fixture.items()}, fetch=lambda path: fixture[namespace["SITE"] + path]["html"].encode())
try:
    exec(compile(ast.Module(body=tree.body[audit_start:audit_end], type_ignores=[]), str(script), "exec"), namespace)
except AssertionError as error:
    print(json.dumps({"result": "fail", "error": str(error)}))
else:
    print(json.dumps({"result": "pass", "pages": len(namespace["pages"])}))
`;

type Fault = "missing-translation" | "missing-index" | "missing-native" | "native-mirror" | "article-language" | "index-language" | "translation-alternates" | "native-alternates";
async function runFixture(fault?: Fault) {
  const fixture: Record<string, { html: string; alternates: Record<string, string> }> = {};
  const add = (path: string, language: string, alternates: Record<string, string>, article = false) => {
    fixture[site + path] = {
      alternates,
      html: `<html lang="${language}"><head><link rel="canonical" href="${site + path}">${Object.entries(alternates).map(([locale, href]) => `<link rel="alternate" hreflang="${locale}" href="${href}">`).join("")}</head><body>${article ? `<article lang="${fault === "article-language" && path === `/ja${blog}/lamine-yamal` ? "en" : language}">Article</article>` : ""}</body></html>`,
    };
  };
  for (const { path } of publicPages) {
    for (const language of path === "/mesut-ozil-ludogorets-goal" ? ["en"] : languages) {
      add(pathFor(path, language), language, path === "/mesut-ozil-ludogorets-goal" ? { en: site + path, "x-default": site + path } : groupFor(path));
    }
  }
  for (const path of [blog, ...keywords.map(slug => `${blog}/${slug}`)]) for (const language of languages) {
    const localized = pathFor(path, language);
    if (fault === "missing-translation" && localized === `/ja${blog}/lamine-yamal`) continue;
    if (fault === "missing-index" && localized === `/fr${blog}`) continue;
    const alternates = fault === "translation-alternates" && localized === `/ja${blog}/lamine-yamal`
      ? { ja: site + localized, "x-default": site + localized } : groupFor(path);
    add(localized, fault === "index-language" && localized === `/fr${blog}` ? "en" : language, alternates, path !== blog);
  }
  for (const [slug, language] of Object.entries(native)) {
    if (fault === "missing-native" && slug === "what-is-ozil-goal-trend") continue;
    const path = `${blog}/${slug}`;
    add(path, language, fault === "native-alternates" && slug === "what-is-ozil-goal-trend" ? groupFor(path) : { [language]: site + path, "x-default": site + path }, true);
  }
  if (fault === "native-mirror") add(`/ja${blog}/what-is-ozil-goal-trend`, "ja", groupFor(`${blog}/what-is-ozil-goal-trend`), true);
  const result = await execute("python3", ["-c", checkFixture, JSON.stringify(fixture)], { maxBuffer: 1024 * 1024 });
  return JSON.parse(result.stdout) as { result: string; error?: string; pages?: number };
}

describe("GEO smoke checker blog contracts", () => {
  it("accepts six indexes and 24 keyword translations alongside the 14 native articles", async () => {
    const result = await runFixture();
    expect(result).toMatchObject({ result: "pass" });
    expect(result.pages).toBeGreaterThan(44);
  });

  it.each([
    ["missing-translation", "Missing translated blog sitemap routes"],
    ["missing-index", "Missing translated blog sitemap routes"],
    ["missing-native", "Native blog paths changed"],
    ["native-mirror", "Native blog mirror in sitemap"],
    ["article-language", "Translated article language mismatch"],
    ["index-language", "Translated HTML language mismatch"],
    ["translation-alternates", "Real six-language hreflang group changed"],
    ["native-alternates", "Native article wrongly grouped as a translation"],
  ] as const)("rejects the %s regression", async (fault, error) => {
    expect(await runFixture(fault)).toMatchObject({ result: "fail", error: expect.stringContaining(error) });
  });
});
