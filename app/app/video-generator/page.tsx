import { localizeMetadata } from "@/lib/i18n/server";
import { OzilGoalGenerator } from "@/components/ozil-goal/generator";

export async function generateMetadata() { return localizeMetadata({ title: "Generate Video" }); }

export default function AccountVideoGeneratorPage() {
  return <div className="dashboard-generator ozil-page og"><OzilGoalGenerator /></div>;
}
