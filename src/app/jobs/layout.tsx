import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İş İlanları",
  description: "CV becerilerinize göre eşleşen iş ilanlarını keşfedin.",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
