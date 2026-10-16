import type { MetadataRoute } from "next";

export const SITE_URL = "https://ozilgoal-aivideo.com";
export const HOTEL_LOBBY_PATH = "/hotel-lobby-ai-video-generator";

export type PublicPage = {
  path: string;
  label: string;
  priority: number;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  lastModified?: string;
};

// Add only live public routes. Set lastModified only for a recorded content revision.
export const publicPages: PublicPage[] = [
  { path: "/", label: "Home", priority: 1, changeFrequency: "monthly", lastModified: "2026-10-16" },
  { path: "/pricing", label: "Pricing", priority: 0.7, changeFrequency: "monthly" },
  { path: "/ozil-goal-generator/ozil-goal-ai-prompt", label: "Ozil Goal AI Prompt", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/ozil-goal-generator/ozil-goal-ai-template", label: "Ozil Goal AI Template", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/ozil-goal-generator/ozil-goal-trend", label: "Ozil Goal Trend", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/ozil-goal-generator/ozil-goal-meme", label: "Ozil Goal Meme", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/ozil-goal-generator/ozil-goal-capcut-template", label: "Ozil Goal CapCut Template", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/ozil-goal-generator/ai-football-video-from-photo", label: "AI Football Video from Photo", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-10-15" },
  { path: "/privacy-policy", label: "Privacy Policy", priority: 0.7, changeFrequency: "yearly", lastModified: "2026-10-03" },
  { path: "/terms-of-service", label: "Terms of Service", priority: 0.7, changeFrequency: "yearly", lastModified: "2026-10-03" },
  { path: "/refund-policy", label: "Refund Policy", priority: 0.7, changeFrequency: "yearly", lastModified: "2026-10-03" },
  { path: "/acceptable-use-policy", label: "Acceptable Use Policy", priority: 0.7, changeFrequency: "yearly", lastModified: "2026-10-03" },
  { path: "/contact", label: "Contact", priority: 0.5, changeFrequency: "yearly", lastModified: "2026-10-03" },
];

export const hotelLobbyPages = publicPages.filter((page) => page.path.startsWith("/hotel-lobby-") || page.path.startsWith("/blog/best-hotel-lobby-"));
