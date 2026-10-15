#!/usr/bin/env python3
"""Read-only SEO smoke check for a running Ozil Goal Generator site.

Usage: python3 scripts/check-geo.py http://127.0.0.1:3011 [report.json]
Set GEO_HTTP_CLIENT=curl when urllib cannot negotiate with the target host.
"""

import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from urllib.parse import urlsplit
from urllib.request import urlopen
from urllib.robotparser import RobotFileParser
from xml.etree import ElementTree

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:3011"
SITE = "https://ozilgoal-aivideo.com"
LOCALES = ("", "/ko", "/ja", "/fr", "/es", "/zh-TW")
GUIDES = (
    "/ozil-goal-generator/ozil-goal-ai-prompt",
    "/ozil-goal-generator/ozil-goal-ai-template",
    "/ozil-goal-generator/ozil-goal-trend",
    "/ozil-goal-generator/ozil-goal-meme",
    "/ozil-goal-generator/ozil-goal-capcut-template",
    "/ozil-goal-generator/ai-football-video-from-photo",
)
HTTP_CLIENT = os.environ.get("GEO_HTTP_CLIENT", "urllib")
assert HTTP_CLIENT in ("urllib", "curl"), "Unsupported GEO_HTTP_CLIENT"


def normalize(value):
    return re.sub(r"\s+", " ", value).strip()


def canonical_url(path):
    return (SITE + path).rstrip("/")


def is_old_route(path):
    route = re.sub(r"^/(?:ko|ja|fr|es|zh-TW)(?=/|$)", "", path)
    return route.startswith("/hotel-lobby-") or route.startswith(("/ai-rap-song-generator", "/showcases", "/blog"))


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.headings = {"h1": [], "h2": []}
        self.title = []
        self.description = []
        self.canonical = []
        self.robots = []
        self.alternates = {}
        self.links = []
        self.jsonld = []
        self.visible = []
        self.faqs = []
        self.faq = None
        self.capture = None
        self.buffer = []
        self.hidden = None
        self.aria_hidden = 0
        self.script = []
        self.is_jsonld = False
        self.feed(html)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if self.aria_hidden:
            self.aria_hidden += 1
            return
        if attrs.get("aria-hidden") == "true":
            self.aria_hidden = 1
            return
        if tag in ("script", "style"):
            self.hidden = tag
            self.is_jsonld = tag == "script" and attrs.get("type") == "application/ld+json"
            self.script = []
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href"))
        if tag == "link" and attrs.get("rel") == "alternate" and attrs.get("hreflang"):
            self.alternates[attrs["hreflang"]] = attrs.get("href")
        if tag == "meta" and attrs.get("name") in ("description", "robots"):
            getattr(self, attrs["name"]).append(attrs.get("content", ""))
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "details":
            self.faq = {"question": "", "answers": []}
        if tag in ("h1", "h2", "title") or (self.faq is not None and tag in ("summary", "p")):
            self.capture, self.buffer = tag, []

    def handle_data(self, data):
        if self.hidden or self.aria_hidden:
            if self.is_jsonld:
                self.script.append(data)
            return
        self.visible.append(data)
        if self.capture:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if self.aria_hidden:
            self.aria_hidden -= 1
            return
        if tag == self.hidden:
            if self.is_jsonld:
                self.jsonld.append(json.loads("".join(self.script)))
            self.hidden, self.is_jsonld = None, False
        if tag == self.capture:
            value = normalize("".join(self.buffer))
            if tag in self.headings:
                self.headings[tag].append(value)
            elif tag == "title":
                self.title.append(value)
            elif self.faq is not None and tag == "summary":
                self.faq["question"] = value
            elif self.faq is not None and tag == "p":
                self.faq["answers"].append(value)
            self.capture = None
        if tag == "details" and self.faq is not None:
            self.faqs.append((self.faq["question"], normalize(" ".join(self.faq["answers"]))))
            self.faq = None


cache = {}


def fetch(path):
    if path not in cache:
        if HTTP_CLIENT == "curl":
            result = subprocess.run(
                ["curl", "--silent", "--show-error", "--fail", "--compressed", "--retry", "2", "--max-time", "30", BASE + path],
                check=True, capture_output=True,
            )
            cache[path] = result.stdout
        else:
            with urlopen(BASE + path, timeout=90) as response:
                assert response.status == 200, (path, response.status)
                cache[path] = response.read()
    return cache[path]


xml = ElementTree.fromstring(fetch("/sitemap.xml"))
locations = [element.text for element in xml.findall("{*}url/{*}loc")]
assert len(locations) == len(set(locations)), "Duplicate sitemap URLs"
assert all(url and url.startswith(SITE + "/") for url in locations), "Unexpected sitemap origin"
paths = {urlsplit(url).path or "/" for url in locations}
expected = {"/", *GUIDES}
assert expected <= paths, ("Missing Ozil sitemap routes", sorted(expected - paths))
assert not any(prefix + path in paths for prefix in LOCALES[1:] for path in ("", *GUIDES)), "English-only Ozil mirror in sitemap"
assert "/ozil-goal-generator/blog" in paths, "Missing Ozil blog index"
assert any(path.startswith("/ozil-goal-generator/blog/") for path in paths), "Missing Ozil blog posts"
assert not any(is_old_route(path) for path in paths), "Legacy routes in sitemap"
assert not any(prefix + "/ozil-goal-generator" in paths for prefix in LOCALES), "Alias duplicated in sitemap"
assert not any(re.search(r"/(?:api|app|sign-in|sign-up)(?:/|$)", path) for path in paths), "Private route in sitemap"

rows = []
faq_matches = 0
for path in sorted(expected):
    page = Page(fetch(path).decode())
    assert len(page.headings["h1"]) == 1, (path, "Expected one server-rendered H1")
    assert len(page.headings["h2"]) >= 2, (path, "Missing server-rendered sections")
    assert len(page.title) == 1 and page.title[0], (path, "Missing title")
    assert len(page.description) == 1 and page.description[0], (path, "Missing description")
    assert [url.rstrip("/") for url in page.canonical] == [canonical_url(path)], (path, "Canonical mismatch", page.canonical)
    assert not any("noindex" in value for value in page.robots), (path, "Public page is noindex")
    assert len(normalize(" ".join(page.visible))) > 500, (path, "Missing visible copy")
    assert "LobbyDuo" not in " ".join(page.visible), (path, "Old brand is visible")
    assert {key: value.rstrip("/") for key, value in page.alternates.items()} == {
        "en": canonical_url(path), "x-default": canonical_url(path),
    }, (path, "English-only hreflang mismatch")
    rows.append({"path": path, "h1": page.headings["h1"][0], "canonical": page.canonical[0]})
    if path == "/":
        graph = next((item.get("@graph") for item in page.jsonld if isinstance(item, dict) and item.get("@graph")), None)
        assert graph, (path, "Missing root JSON-LD graph")
        faq = next((item for item in graph if item.get("@type") == "FAQPage"), None)
        howto = next((item for item in graph if item.get("@type") == "HowTo"), None)
        assert faq and howto and howto.get("step"), (path, "Missing FAQ/HowTo schema")
        schema_faqs = [(normalize(item["name"]), normalize(item["acceptedAnswer"]["text"])) for item in faq["mainEntity"]]
        assert schema_faqs and schema_faqs == page.faqs, (path, "Visible FAQ and schema differ")
        faq_matches += len(schema_faqs)

for alias in ("/ozil-goal-generator",):
    page = Page(fetch(alias).decode())
    assert [url.rstrip("/") for url in page.canonical] == [canonical_url("/")], (alias, "Alias canonical mismatch")

llms = fetch("/llms.txt").decode()
assert llms.startswith("# Ozil Goal Generator"), "Old llms.txt header"
assert SITE + "/" in llms and all(SITE + path in llms for path in GUIDES), "Missing llms.txt guide links"
assert "migosai.design" not in llms and "LobbyDuo" not in llms, "Old site reference in llms.txt"
robots = fetch("/robots.txt").decode()
assert "Sitemap: " + SITE + "/sitemap.xml" in robots, "Wrong robots sitemap"
assert {"Disallow: /api/", "Disallow: /app/", "Disallow: /sign-in", "Disallow: /sign-up"} <= set(robots.splitlines())
crawler_rules = RobotFileParser()
crawler_rules.parse(robots.splitlines())
for bot in ("Googlebot", "GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"):
    assert all(crawler_rules.can_fetch(bot, SITE + path) for path in expected), (bot, "A public route is blocked")

report = {
    "base": BASE,
    "result": "pass",
    "sitemap_routes": len(paths),
    "geo_pages": len(rows),
    "faq_exact_matches": faq_matches,
    "checked_resources": len(cache),
    "pages": rows,
    "scope": "Anonymous rendered pages, Ozil FAQ/HowTo schema, sitemap, robots and llms.txt. No paid generation or external indexing check.",
}
if len(sys.argv) > 2:
    with open(sys.argv[2], "w") as output:
        json.dump(report, output, indent=2)
        output.write("\n")
print(json.dumps(report, indent=2))
