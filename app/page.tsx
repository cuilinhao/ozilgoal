import { getLocale, localizeMetadata } from "@/lib/i18n/server";
import { isLocale } from "@/lib/i18n/routing";
import { OzilGoalPage, ozilMetadata } from "@/components/ozil-goal/page-content";
import type { ReactElement } from "react";

type HomeProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };
type HomePageElement = ReactElement<Parameters<typeof OzilGoalPage>[0]>;
type HomePageComponent = { (): Promise<HomePageElement>; (props: HomeProps): Promise<HomePageElement> };

export async function generateMetadata() {
  return localizeMetadata(ozilMetadata("home"));
}

const HomePage: HomePageComponent = async ({ searchParams }: HomeProps = {}) => {
  const blogLang = (await searchParams)?.blogLang;
  const previewLocale = typeof blogLang === "string" && isLocale(blogLang) ? blogLang : await getLocale();
  return <OzilGoalPage slug="home" previewLocale={previewLocale} />;
};

export default HomePage;
