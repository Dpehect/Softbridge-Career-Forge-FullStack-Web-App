import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Forge · Analiz",
  description:
    "CV yükle, ATS analizi yap, iş ilanı eşleştir — tamamen tarayıcınızda, %100 gizli.",
};

export default function ForgeLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      title="Sistemimiz şu an kendini güncelliyor"
      hint="Lütfen 5 saniye bekleyip sayfayı yenileyin. Kariyer asistanı kısa süre içinde hazır olacak."
    >
      {children}
    </ErrorBoundary>
  );
}
