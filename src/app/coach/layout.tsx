import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career and Interview Coach",
  description: "Resume-grounded career coaching, STAR answer preparation, and interview practice in Turkish and English.",
  robots: { index: false, follow: false },
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
