import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kariyer Yolları",
  description: "Hedef roller için beceri yolları ve modül takibi.",
};

export default function PathsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
