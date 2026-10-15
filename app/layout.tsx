import type { Metadata } from "next";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { getMessages } from "@/lib/i18n";
import { getDocumentLanguage, getLocale, localizeMetadata } from "@/lib/i18n/server";
import "@fontsource/plus-jakarta-sans/400.css";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/600.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "./globals.css";
import "./interactive.css";
import "./auth.css";
import { AuthProvider } from "@/components/auth-provider";
import { GoogleAnalytics } from "@/components/google-analytics";
import { SiteShell } from "@/components/site-shell";

const baseMetadata: Metadata = {
  metadataBase: new URL("https://ozilgoal-aivideo.com"),
  title: { default: "Ozil Goal Generator", template: "%s | Ozil Goal Generator" },
  description: "Create a 15-second AI football video from one photo with Ozil Goal Generator.",
};

export async function generateMetadata(): Promise<Metadata> { return localizeMetadata(baseMetadata); }

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const documentLanguage = await getDocumentLanguage();
  return (
    <html lang={documentLanguage}>
      <body>
        <LocaleProvider locale={locale} messages={getMessages(locale)}>
        <AuthProvider>
          <SiteShell>{children}</SiteShell>
        </AuthProvider>
        </LocaleProvider>
        <GoogleAnalytics measurementId="G-SKCH8EV8M2" />
      </body>
    </html>
  );
}
