import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Özgeçmiş Düzenleyici",
  description: "Özgeçmişinizi yapılandırın, düzenleyin ve Forge ile analiz edin.",
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
