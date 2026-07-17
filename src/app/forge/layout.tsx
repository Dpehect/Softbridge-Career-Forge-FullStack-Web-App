import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Resume Analysis",
  description: "Private resume parsing, explainable ATS scoring, and target job-description alignment.",
  robots: { index: false, follow: false },
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
