import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Matching",
  description: "Compare sample roles with verified resume skills and review matched and missing signals.",
  robots: { index: false, follow: false },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
