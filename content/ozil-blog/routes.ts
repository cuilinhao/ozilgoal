/** Shared with client routing: keep article bodies out of this module. */
export const OZIL_BLOG_PATH = "/ozil-goal-generator/blog";
export const ozilKeywordSlugs = ["lamine-yamal", "sepak-bola", "gol-pakai", "gol-de-ozil"] as const;
export type OzilKeywordSlug = (typeof ozilKeywordSlugs)[number];

/** Expects a pathname without a site-language prefix. */
export function isTranslatedOzilBlogPath(path: string): boolean {
  const pathname = path.split(/[?#]/)[0].replace(/\/$/, "");
  return pathname === OZIL_BLOG_PATH || ozilKeywordSlugs.some(slug => pathname === `${OZIL_BLOG_PATH}/${slug}`);
}
