import { notFound, permanentRedirect } from "next/navigation";
import { isLocale } from "@/lib/i18n/routing";
import AccountLayout from "@/app/app/layout";

// Reuse the existing pages while giving translated URLs real App Router routes.
const routes = {
  "/": () => import("@/app/page"),
  "/pricing": () => import("@/app/pricing/page"),
  "/ozil-goal-generator": () => import("@/app/ozil-goal-generator/page"),
  "/ozil-goal-generator/ozil-goal-ai-prompt": () => import("@/app/ozil-goal-generator/ozil-goal-ai-prompt/page"),
  "/ozil-goal-generator/ozil-goal-ai-template": () => import("@/app/ozil-goal-generator/ozil-goal-ai-template/page"),
  "/ozil-goal-generator/ozil-goal-trend": () => import("@/app/ozil-goal-generator/ozil-goal-trend/page"),
  "/ozil-goal-generator/ozil-goal-meme": () => import("@/app/ozil-goal-generator/ozil-goal-meme/page"),
  "/ozil-goal-generator/ozil-goal-capcut-template": () => import("@/app/ozil-goal-generator/ozil-goal-capcut-template/page"),
  "/ozil-goal-generator/ai-football-video-from-photo": () => import("@/app/ozil-goal-generator/ai-football-video-from-photo/page"),
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
  if (isLocale(locale) && /^\/ozil-goal-generator\/blog(?:\/|$)/.test(pathname)) permanentRedirect(pathname);
  if (!isLocale(locale) || !Object.hasOwn(routes, pathname)) notFound();
  return { page: await routes[pathname as keyof typeof routes](), pathname };
}
export async function generateMetadata({ params }: Props) {
  const { page } = await resolvePage(params);
  return page.generateMetadata();
}
export default async function LocalizedPage({ params }: Props) {
  const { page, pathname } = await resolvePage(params);
  const Page = page.default;
  return pathname.startsWith("/app/") ? <AccountLayout><Page/></AccountLayout> : <Page/>;
}
