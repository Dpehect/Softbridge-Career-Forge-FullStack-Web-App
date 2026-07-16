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
    template: "%s | SoftBridge CareerForge",
    default: "SoftBridge CareerForge — Professional career workspace",
  },
  description:
    "Upload or build your CV, get professional feedback, match jobs, export PDF, and prepare for interviews. Built by SoftBridge Solutions.",
  openGraph: {
    title: "SoftBridge CareerForge",
    description:
      "Professional CV tools, job matching, ATS checks, and interview prep — private in your browser.",
    siteName: "SoftBridge CareerForge",
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
      <body className="min-h-full flex flex-col bg-midnight-void text-star-white font-sans mesh-bg selection:bg-cosmic-teal/20">
        <Header />
        <main className="flex-1 pt-[5.25rem] md:pt-24">{children}</main>
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
