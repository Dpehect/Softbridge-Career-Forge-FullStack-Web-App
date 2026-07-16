import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forge",
  description:
    "CV yükle, ATS analizi yap, iş ilanı eşleştir ve mülakata hazırlan — CareerForge Forge çalışma alanı.",
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
