import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://careerforge.softbridgesolutions.com"),
  title: {
    template: "%s | Softbridge CareerForge",
    default: "Softbridge CareerForge — Forge your next role",
  },
  description:
    "Professional career platform: CV analysis, job match, ATS optimization, cover letters, and interview prep. Built by Softbridge Solutions.",
  openGraph: {
    title: "Softbridge CareerForge",
    description:
      "CV tools, job match, ATS optimization, and career coaching — in one premium workspace.",
    siteName: "Softbridge CareerForge",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
    >
      <body className="min-h-full flex flex-col bg-midnight-void text-star-white font-sans mesh-bg">
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            className: "border border-black/5 bg-panel-elevated text-star-white",
          }}
        />
      </body>
    </html>
  );
}
