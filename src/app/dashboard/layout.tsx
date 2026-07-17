import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Private career dashboard for resume evidence, ATS scoring, job alignment, and next actions.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
