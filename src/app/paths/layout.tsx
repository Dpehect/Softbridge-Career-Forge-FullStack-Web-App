import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Roadmap",
  description: "Structured career roadmaps with skill modules, progress tracking, and resume evidence outcomes.",
  robots: { index: false, follow: false },
};

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
