import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Koç",
  description: "Kariyer koçu ile STAR cevapları, CV önerileri ve mülakat pratiği.",
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
