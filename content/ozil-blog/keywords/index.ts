import LamineYamalEn from "./lamine-yamal/en.json";
import LamineYamalKo from "./lamine-yamal/ko.json";
import LamineYamalJa from "./lamine-yamal/ja.json";
import LamineYamalFr from "./lamine-yamal/fr.json";
import LamineYamalEs from "./lamine-yamal/es.json";
import LamineYamalZhTw from "./lamine-yamal/zh-TW.json";
import SepakBolaEn from "./sepak-bola/en.json";
import SepakBolaKo from "./sepak-bola/ko.json";
import SepakBolaJa from "./sepak-bola/ja.json";
import SepakBolaFr from "./sepak-bola/fr.json";
import SepakBolaEs from "./sepak-bola/es.json";
import SepakBolaZhTw from "./sepak-bola/zh-TW.json";
import GolPakaiEn from "./gol-pakai/en.json";
import GolPakaiKo from "./gol-pakai/ko.json";
import GolPakaiJa from "./gol-pakai/ja.json";
import GolPakaiFr from "./gol-pakai/fr.json";
import GolPakaiEs from "./gol-pakai/es.json";
import GolPakaiZhTw from "./gol-pakai/zh-TW.json";
import GolDeOzilEn from "./gol-de-ozil/en.json";
import GolDeOzilKo from "./gol-de-ozil/ko.json";
import GolDeOzilJa from "./gol-de-ozil/ja.json";
import GolDeOzilFr from "./gol-de-ozil/fr.json";
import GolDeOzilEs from "./gol-de-ozil/es.json";
import GolDeOzilZhTw from "./gol-de-ozil/zh-TW.json";
import type { BlogPost } from "../../blog";
import type { OzilBlogPost } from "../types";
import { OZIL_BLOG_PATH, ozilKeywordSlugs, type OzilKeywordSlug } from "../routes";
import { locales, localizeHref, type Locale } from "@/lib/i18n/routing";

type KeywordCopy = Omit<BlogPost, "slug" | "path" | "datePublished" | "dateModified">;

// zh-CN.json is the editorial source; only the six supported site locales are published.
// JSON widens block discriminants to string; the complete structures are checked in QA.
const translations = {
  "lamine-yamal": { "en": LamineYamalEn, "ko": LamineYamalKo, "ja": LamineYamalJa, "fr": LamineYamalFr, "es": LamineYamalEs, "zh-TW": LamineYamalZhTw },
  "sepak-bola": { "en": SepakBolaEn, "ko": SepakBolaKo, "ja": SepakBolaJa, "fr": SepakBolaFr, "es": SepakBolaEs, "zh-TW": SepakBolaZhTw },
  "gol-pakai": { "en": GolPakaiEn, "ko": GolPakaiKo, "ja": GolPakaiJa, "fr": GolPakaiFr, "es": GolPakaiEs, "zh-TW": GolPakaiZhTw },
  "gol-de-ozil": { "en": GolDeOzilEn, "ko": GolDeOzilKo, "ja": GolDeOzilJa, "fr": GolDeOzilFr, "es": GolDeOzilEs, "zh-TW": GolDeOzilZhTw },
} as Record<OzilKeywordSlug, Record<Locale, KeywordCopy>>;

export const keywordPosts: OzilBlogPost[] = ozilKeywordSlugs.flatMap(slug => locales.map(language => ({
  ...translations[slug][language],
  slug,
  language,
  topic: slug,
  translationKey: slug,
  path: localizeHref(`${OZIL_BLOG_PATH}/${slug}`, language),
  datePublished: "2026-10-17",
  dateModified: "2026-10-17",
})));
