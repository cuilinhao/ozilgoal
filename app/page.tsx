import { localizeMetadata } from "@/lib/i18n/server";
import { OzilGoalPage, ozilMetadata } from "@/components/ozil-goal/page-content";

export async function generateMetadata() {
  return localizeMetadata(ozilMetadata("home"));
}

export default async function HomePage() {
  return <OzilGoalPage slug="home" />;
}
