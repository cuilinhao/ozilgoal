import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/routing";
import { OZIL_BLOG_PATH, getOzilBlogPost } from "@/content/ozil-blog";
import { isTranslatedOzilBlogPath } from "@/content/ozil-blog/routes";
import { OzilBlogArticle, OzilBlogIndex } from "@/components/ozil-goal/blog";
import { ozilBlogMetadata } from "@/components/ozil-goal/blog-metadata";
import AccountLayout from "@/app/app/layout";

// Only pages with translated content receive localized App Router routes.
const routes = {
  "/": () => import("@/app/page"),
  "/ozil-goal-generator": () => import("@/app/ozil-goal-generator/page"),
  "/ozil-goal-generator/ozil-goal-ai-prompt": () => import("@/app/ozil-goal-generator/ozil-goal-ai-prompt/page"),
  "/ozil-goal-generator/ozil-goal-ai-template": () => import("@/app/ozil-goal-generator/ozil-goal-ai-template/page"),
  "/ozil-goal-generator/ozil-goal-trend": () => import("@/app/ozil-goal-generator/ozil-goal-trend/page"),
  "/ozil-goal-generator/ozil-goal-meme": () => import("@/app/ozil-goal-generator/ozil-goal-meme/page"),
  "/ozil-goal-generator/ozil-goal-capcut-template": () => import("@/app/ozil-goal-generator/ozil-goal-capcut-template/page"),
  "/ozil-goal-generator/ai-football-video-from-photo": () => import("@/app/ozil-goal-generator/ai-football-video-from-photo/page"),
  "/pricing": () => import("@/app/pricing/page"),
  "/privacy-policy": () => import("@/app/privacy-policy/page"),
  "/terms-of-service": () => import("@/app/terms-of-service/page"),
  "/refund-policy": () => import("@/app/refund-policy/page"),
  "/acceptable-use-policy": () => import("@/app/acceptable-use-policy/page"),
  "/contact": () => import("@/app/contact/page"),
  "/sign-in": () => import("@/app/sign-in/page"),
  "/sign-up": () => import("@/app/sign-up/page"),
  "/app/video-generator": () => import("@/app/app/video-generator/page"),
  "/app/my-videos": () => import("@/app/app/my-videos/page"),
  "/app/my-orders": () => import("@/app/app/my-orders/page"),
  "/app/my-credits": () => import("@/app/app/my-credits/page"),
};
type Props = { params: Promise<{ locale: string; path?: string[] }> };
async function resolvePage(params: Props["params"]) {
  const { locale, path = [] } = await params;
  const pathname = `/${path.join("/")}`;
  if (!isLocale(locale)) notFound();
  if (/^\/ozil-goal-generator\/blog(?:\/|$)/.test(pathname)) {
    if (!isTranslatedOzilBlogPath(pathname)) permanentRedirect(pathname);
    if (pathname === OZIL_BLOG_PATH) return { kind: "blog-index" as const, locale, pathname };
    const post = getOzilBlogPost(pathname.slice(OZIL_BLOG_PATH.length + 1), locale);
    if (!post?.translationKey) notFound();
    return { kind: "blog-article" as const, post, pathname };
  }
  if (!Object.hasOwn(routes, pathname)) notFound();
  return { kind: "page" as const, page: await routes[pathname as keyof typeof routes](), pathname };
}
export async function generateMetadata({ params }: Props) {
  const resolved = await resolvePage(params);
  if (resolved.kind === "blog-index") return ozilBlogMetadata(undefined, resolved.locale);
  if (resolved.kind === "blog-article") return ozilBlogMetadata(resolved.post);
  return resolved.page.generateMetadata();
}
export default async function LocalizedPage({ params }: Props) {
  const resolved = await resolvePage(params);
  if (resolved.kind === "blog-index") return <OzilBlogIndex locale={resolved.locale} />;
  if (resolved.kind === "blog-article") return <OzilBlogArticle post={resolved.post} />;
  const Page = resolved.page.default;
  return resolved.pathname.startsWith("/app/") ? <AccountLayout><Page/></AccountLayout> : <Page/>;
}
