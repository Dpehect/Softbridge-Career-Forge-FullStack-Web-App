import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How CareerForge handles Google account information and local resume data.",
};

export default function PrivacyPage() {
  return <LegalPage kind="privacy" />;
}
