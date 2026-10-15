"use client";

import Link from "@/components/i18n/localized-link";
import { useTranslations } from "@/components/i18n/locale-provider";
import { Mail } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "@/content/support";

const guides = [
  { href: "/ozil-goal-generator/ozil-goal-ai-template", label: "Ozil Goal AI Template" },
  { href: "/ozil-goal-generator/ozil-goal-ai-prompt", label: "Ozil Goal AI Prompt" },
  { href: "/ozil-goal-generator/ozil-goal-trend", label: "Ozil Goal Trend" },
  { href: "/ozil-goal-generator/ozil-goal-meme", label: "Ozil Goal Meme" },
  { href: "/ozil-goal-generator/ozil-goal-capcut-template", label: "Ozil Goal CapCut Guide" },
  { href: "/ozil-goal-generator/ai-football-video-from-photo", label: "AI Football Video From a Photo" },
] as const;

export function SiteFooter() {
  const t = useTranslations();
  return <footer className="site-footer">
    <div className="footer-inner">
      <div className="footer-top">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" href="/"><span className="brand-logo" aria-hidden="true">O</span><span>Ozil Goal Generator</span></Link>
          <p>{t("Make an AI football video from one photo you have permission to use. Review your result and follow each platform’s AI-labeling rules when sharing.")}</p>
          <div className="social-links"><a href={SUPPORT_MAILTO} aria-label={t("Contact information")}><Mail size={18}/></a></div>
        </div>
        <div className="footer-col"><h3>{t("Product")}</h3><Link href="/#generator">{t("Make a video")}</Link><Link href="/#how-it-works">{t("How It Works")}</Link><Link href="/pricing">{t("Pricing")}</Link><Link href="/ozil-goal-generator/blog">{t("Blog")}</Link></div>
        <div className="footer-col"><h3>{t("Guides")}</h3>{guides.map((guide) => <Link key={guide.href} href={guide.href}>{t(guide.label)}</Link>)}</div>
        <div className="footer-col"><h3>{t("Link")}</h3><Link href="/#faq">{t("FAQ")}</Link><Link href="/privacy-policy">{t("Privacy Policy")}</Link><Link href="/terms-of-service">{t("Terms of Service")}</Link><Link href="/refund-policy">{t("Refund Policy")}</Link><Link href="/acceptable-use-policy">{t("Acceptable Use Policy")}</Link><Link href="/contact">{t("Contact")}</Link><a href={SUPPORT_MAILTO}>{SUPPORT_EMAIL}</a></div>
      </div>
      <p className="footer-bottom">{t("Ozil Goal Generator is an independent AI creation service. It is not affiliated with or endorsed by Mesut Özil, any player, club, league, federation or broadcaster.")}</p>
      <div className="footer-bottom">© {new Date().getFullYear()} · Ozil Goal Generator. {t("All rights reserved.")}</div>
    </div>
  </footer>;
}
