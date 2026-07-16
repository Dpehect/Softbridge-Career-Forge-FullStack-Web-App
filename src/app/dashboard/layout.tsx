import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel",
  description:
    "Kariyer paneli — analiz edilen CV'ler, ATS skoru, mülakat hazırlığı ve son işlemler.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
