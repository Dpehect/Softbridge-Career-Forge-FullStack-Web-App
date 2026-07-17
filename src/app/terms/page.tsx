import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "CareerForge product terms, boundaries, and user responsibilities.",
};

export default function TermsPage() {
  return <LegalPage kind="terms" />;
}
