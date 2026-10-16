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
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, build_opener
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
base_parts = urlsplit(BASE)
assert base_parts.scheme in ("http", "https") and base_parts.netloc and not any((base_parts.path, base_parts.query, base_parts.fragment, base_parts.username, base_parts.password)), "BASE must be an HTTP(S) origin"
HOME_NAME = "Ozil Goal AI Video Generator"
HOME_TITLE = HOME_NAME + " – From One Photo (2026)"
# The original rendered description, deliberately independent of the edited source.
HOME_DESCRIPTION = "Make the Ozil goal AI video from one photo: the keeper dives, the ball bounces off your chest, the defender slides in. 15 seconds, vertical, 300 credits per video. No CapCut."
BOTS = ("Googlebot", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Google-Extended", "Bingbot")
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}


def normalize(value):
    return re.sub(r"\s+", " ", value).strip()


def canonical_url(path):
    return SITE + path


def normalize_root(url):
    # Next 15 serializes the root canonical as the origin. Empty root and /
    # identify the same URL; this is the only accepted serialization exception.
    return SITE + "/" if url == SITE else url


def is_old_route(path):
    route = re.sub(r"^/(?:ko|ja|fr|es|zh-TW)(?=/|$)", "", path)
    return route.startswith("/hotel-lobby-") or route.startswith(("/ai-rap-song-generator", "/showcases", "/blog"))


class Page(HTMLParser):
    def __init__(self, html):
        super().__init__(convert_charrefs=True)
        self.headings = {"h1": [], "h2": []}
        self.title = []
        self.og_title = []
        self.twitter_title = []
        self.description = []
        self.canonical = []
        self.robots = []
        self.alternates = {}
        self.links = []
        self.jsonld = []
        self.visible = []
        self.paragraphs_after_h1 = []
        self.h1_count = 0
        self.faqs = []
        self.faq = None
        self.capture = None
        self.buffer = []
        self.hidden = None
        self.aria_hidden = 0
        self.script = []
        self.is_jsonld = False
        self.feed(html)
        self.close()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "h1":
            self.h1_count += 1
        if self.aria_hidden:
            if tag not in VOID_TAGS:
                self.aria_hidden += 1
            return
        if attrs.get("aria-hidden") == "true" or "hidden" in attrs:
            self.aria_hidden = int(tag not in VOID_TAGS)
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
        if tag == "meta" and attrs.get("property") == "og:title":
            self.og_title.append(attrs.get("content", ""))
        if tag == "meta" and (attrs.get("name") == "twitter:title" or attrs.get("property") == "twitter:title"):
            self.twitter_title.append(attrs.get("content", ""))
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "details":
            self.faq = {"question": "", "answers": []}
        if tag in ("h1", "h2", "title", "p") or (self.faq is not None and tag == "summary"):
            self.capture, self.buffer = tag, []
        if tag == "br" and self.capture:
            self.buffer.append(" ")

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if self.hidden or self.aria_hidden:
            if self.is_jsonld:
                self.script.append(data)
            return
        self.visible.append(data)
        if self.capture:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
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
                self.title.append("".join(self.buffer))
            elif self.faq is not None and tag == "summary":
                self.faq["question"] = value
            elif tag == "p":
                if self.headings["h1"]:
                    self.paragraphs_after_h1.append(value)
                if self.faq is not None:
                    self.faq["answers"].append(value)
            self.capture = None
        if tag == "details" and self.faq is not None:
            self.faqs.append((self.faq["question"], normalize(" ".join(self.faq["answers"]))))
            self.faq = None


cache = {}
responses = {}


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def request_path(url):
    parts = urlsplit(url)
    assert parts.scheme == "https" and parts.netloc == urlsplit(SITE).netloc and parts.path.startswith("/") and not parts.fragment, ("Refusing external or invalid sitemap target", url)
    return parts.path + ("?" + parts.query if parts.query else "")


def fetch(path):
    if path not in cache:
        assert path.startswith("/") and not path.startswith("//"), ("Invalid local request path", path)
        status, location, body, error_message = None, None, b"", None
        try:
            if HTTP_CLIENT == "curl":
                result = subprocess.run(
                    ["curl", "--disable", "--silent", "--show-error", "--compressed", "--globoff", "--path-as-is",
                     "--proto", "=http,https", "--max-redirs", "0", "--max-time", "30",
                     "--write-out", "\n%{http_code}\n%{redirect_url}", BASE + path],
                    capture_output=True, timeout=35,
                )
                body, status_text, location_text = result.stdout.rsplit(b"\n", 2)
                status, location = int(status_text) or None, location_text.decode() or None
                if result.returncode:
                    error_message = result.stderr.decode(errors="replace").strip()
            else:
                try:
                    with build_opener(NoRedirect()).open(BASE + path, timeout=30) as response:
                        status, location, body = response.status, response.headers.get("Location"), response.read()
                except HTTPError as error:
                    status, location, body = error.code, error.headers.get("Location"), error.read()
        except (OSError, URLError, ValueError, subprocess.TimeoutExpired) as error:
            error_message = str(error)
        cache[path] = body
        responses[path] = {"url": canonical_url(path), "request_url": BASE + path, "status": status, "location": location}
        if error_message:
            responses[path]["error"] = error_message
    return cache[path]


def write_report(report):
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    if len(sys.argv) > 2:
        with open(sys.argv[2], "w", encoding="utf-8") as output:
            output.write(rendered + "\n")
    print(rendered)


def require_http_success(stats):
    non_200 = [value for _, value in sorted(responses.items()) if value["status"] != 200 or value.get("error")]
    if non_200:
        write_report({"base": BASE, "result": "fail", **stats, "follow_redirects": False, "non_200": non_200,
                      "responses": [value for _, value in sorted(responses.items())]})
        sys.exit(1)


sitemap_body = fetch("/sitemap.xml")
require_http_success({})
xml = ElementTree.fromstring(sitemap_body)
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9", "x": "http://www.w3.org/1999/xhtml"}
assert xml.tag == "{" + ns["s"] + "}urlset", "Expected sitemap urlset"
locations = [element.text for element in xml.findall("s:url/s:loc", ns)]
alternates = [{"language": element.get("hreflang"), "url": element.get("href")} for element in xml.findall(".//x:link", ns)]
assert locations, "Empty sitemap"
assert len(locations) == len(set(locations)), "Duplicate sitemap URLs"
# Validate every target before making any page request; never visit external origins.
target_paths = sorted({request_path(url) for url in locations + [entry["url"] for entry in alternates]})
stats = {"sitemap_loc_count": len(locations), "sitemap_alternate_count": len(alternates), "sitemap_unique_target_count": len(target_paths)}
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(fetch, target_paths))
require_http_success(stats)
assert not any(urlsplit(url).query for url in locations), "Sitemap loc has query parameters"
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
# Exact canonical checks cover every loc, including translated pages and native blogs.
for location in locations:
    page = Page(fetch(request_path(location)).decode())
    assert [normalize_root(url) for url in page.canonical] == [location], (location, "Canonical mismatch", page.canonical)
    assert all(not urlsplit(url).query and not urlsplit(url).fragment for url in page.canonical), (location, "Canonical contains query/fragment")
for path in sorted(expected):
    page = Page(fetch(path).decode())
    assert page.h1_count == 1 and len(page.headings["h1"]) == 1, (path, "Expected one visible server-rendered H1")
    assert len(page.headings["h2"]) >= 2, (path, "Missing server-rendered sections")
    assert len(page.title) == 1 and page.title[0], (path, "Missing title")
    assert len(page.description) == 1 and page.description[0], (path, "Missing description")
    assert [normalize_root(url) for url in page.canonical] == [canonical_url(path)], (path, "Canonical mismatch", page.canonical)
    assert not any("noindex" in value for value in page.robots), (path, "Public page is noindex")
    assert len(normalize(" ".join(page.visible))) > 500, (path, "Missing visible copy")
    assert "LobbyDuo" not in " ".join(page.visible), (path, "Old brand is visible")
    assert {key: normalize_root(value) for key, value in page.alternates.items()} == {
        "en": canonical_url(path), "x-default": canonical_url(path),
    }, (path, "English-only hreflang mismatch")
    rows.append({"path": path, "h1": page.headings["h1"][0], "canonical": page.canonical[0]})
    if path == "/":
        assert page.title == page.og_title == page.twitter_title == [HOME_TITLE], ("Home title/OG/Twitter mismatch", page.title, page.og_title, page.twitter_title)
        assert page.headings["h1"] == [HOME_NAME], ("Home H1 mismatch", page.headings["h1"])
        assert page.paragraphs_after_h1 and page.paragraphs_after_h1[0].count(HOME_NAME) == 1, ("First paragraph after H1 must contain the full product name once", page.paragraphs_after_h1[:1])
        assert page.description == [HOME_DESCRIPTION], ("Home description changed", page.description)
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
    require_http_success(stats)
    assert [normalize_root(url) for url in page.canonical] == [canonical_url("/")], (alias, "Alias canonical mismatch")

llms = fetch("/llms.txt").decode()
require_http_success(stats)
assert llms.startswith("# Ozil Goal Generator"), "Old llms.txt header"
assert re.search(r"^## Product facts\s*$", llms, re.M), "Missing llms.txt Product facts section"
assert SITE + "/" in llms and all(SITE + path in llms for path in GUIDES), "Missing llms.txt guide links"
assert "migosai.design" not in llms and "LobbyDuo" not in llms, "Old site reference in llms.txt"
robots = fetch("/robots.txt").decode()
require_http_success(stats)
assert "Sitemap: " + SITE + "/sitemap.xml" in robots, "Wrong robots sitemap"
assert {"Disallow: /api/", "Disallow: /app/", "Disallow: /sign-in", "Disallow: /sign-up"} <= set(robots.splitlines())


def parse_robots(text):
    groups, agents, rules = [], [], []
    has_directives = False
    for line in text.splitlines():
        field, separator, value = line.split("#", 1)[0].partition(":")
        if not separator:
            continue
        field, value = field.strip().lower(), value.strip()
        if field == "user-agent":
            if has_directives:
                groups.append((agents, rules))
                agents, rules, has_directives = [], [], False
            agents.append(value.lower())
        elif agents:
            has_directives = True
            if field in ("allow", "disallow") and value:
                rules.append((field == "allow", value))
    if agents:
        groups.append((agents, rules))
    return groups


def can_fetch(groups, bot, path):
    # urllib.robotparser uses the first path match. Use the longest applicable
    # user-agent/path rules instead, with Allow winning equal-length ties.
    candidates = []
    for agents, rules in groups:
        scores = [0 if agent == "*" else len(agent) for agent in agents if agent == "*" or agent in bot.lower()]
        if scores:
            candidates.append((max(scores), rules))
    if not candidates:
        return True
    specificity = max(score for score, _ in candidates)
    matches = []
    for score, rules in candidates:
        if score != specificity:
            continue
        for allow, pattern in rules:
            terminal = pattern.endswith("$")
            pattern = pattern[:-1] if terminal else pattern
            expression = "^" + re.escape(pattern).replace(r"\*", ".*") + ("$" if terminal else "")
            if re.search(expression, path):
                matches.append((len(pattern.replace("*", "").encode()), allow))
    return max(matches)[1] if matches else True


crawler_rules = parse_robots(robots)
declared_agents = {agent for agents, _ in crawler_rules for agent in agents}
assert all(bot.lower() in declared_agents for bot in BOTS if bot != "Googlebot"), "Missing explicit crawler groups"
public_paths = set(target_paths) | {"/ozil-goal-generator", "/_next/static/chunks/seo-check.js", "/assets/seo-check.css", "/ozil-goal/samples/ai-shot1.jpg", "/ozil-goal/samples/ozil-ai-goal-hero.mp4"}
private_paths = {"/api/", "/api/generations", *(prefix + path for prefix in LOCALES for path in ("/app/", "/app/my-videos", "/sign-in", "/sign-up"))}
for bot in (*BOTS, "*"):
    blocked = sorted(path for path in public_paths if not can_fetch(crawler_rules, bot, path))
    exposed = sorted(path for path in private_paths if can_fetch(crawler_rules, bot, path))
    assert not blocked, (bot, "Public routes/assets blocked", blocked)
    assert not exposed, (bot, "Private restrictions lost", exposed)

report = {
    "base": BASE,
    "result": "pass",
    **stats,
    "follow_redirects": False,
    "sitemap_routes": len(paths),
    "canonical_pages_checked": len(locations),
    "canonical_exception": "Only the production origin with an empty root path is equivalent to the same origin plus /. Every non-root path must match exactly.",
    "geo_pages": len(rows),
    "faq_exact_matches": faq_matches,
    "checked_resources": len(cache),
    "robots_crawlers": list(BOTS),
    "robots_public_paths_checked": len(public_paths),
    "robots_private_paths_checked": len(private_paths),
    "sitemap_locations": locations,
    "sitemap_alternates": alternates,
    "non_200": [],
    "responses": [value for _, value in sorted(responses.items())],
    "pages": rows,
    "scope": "Anonymous SSR pages; all sitemap loc/alternate targets and exact canonicals; home titles, first paragraph and original description; FAQ/HowTo, robots rules and llms.txt. No JavaScript, asset downloads, paid generation, external requests, indexing or Rich Results Test.",
}
write_report(report)
