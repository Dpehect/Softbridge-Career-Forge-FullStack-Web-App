import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoNotice } from "@/components/DemoNotice";
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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://careerforge.softbridgesolutions.com");

export const metadata: Metadata = {
  applicationName: "CareerForge",
  metadataBase: new URL(siteUrl),
  title: {
    default: "CareerForge | Resume and Career Workspace",
    template: "%s | CareerForge",
  },
  description:
    "Bilingual resume analysis, explainable ATS scoring, job matching, resume editing, interview coaching, and career roadmaps.",
  keywords: [
    "CV analizi",
    "ATS",
    "kariyer asistanı",
    "CareerForge",
    "mülakat hazırlığı",
    "SoftBridge",
  ],
  authors: [{ name: "SoftBridge Solutions" }],
  creator: "SoftBridge Solutions",
  category: "career development",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "CareerForge | Resume and Career Workspace",
    description:
      "Profesyonel CV araçları, iş eşleştirme, ATS kontrolü ve mülakat hazırlığı — tarayıcınızda gizli.",
    url: siteUrl,
    siteName: "CareerForge",
    locale: "tr_TR",
    alternateLocale: "en_US",
    type: "website",
    images: [{ url: "/icon.svg", width: 512, height: 512, alt: "CareerForge" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge | Resume and Career Workspace",
    description: "Explainable resume analysis and career preparation in Turkish and English.",
    images: ["/icon.svg"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
    >
      {/*
        Inline script: reads localStorage BEFORE React hydrates.
        Prevents flash of wrong theme (FOWT).
        Default = light if no saved preference exists.
      */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var stored = localStorage.getItem('softbridge-careerforge');
    if (stored) {
      var parsed = JSON.parse(stored);
      var theme = parsed && parsed.state && parsed.state.theme;
      var lang = parsed && parsed.state && parsed.state.lang;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      if (lang === 'tr' || lang === 'en') {
        document.documentElement.lang = lang;
      }
    }
    // Default = light — do nothing if no preference saved
  } catch(e) {}
})();
`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-ink font-sans">
        <Header />
        <div className="flex-1 pt-16 pb-16 md:pt-[6.5rem] md:pb-0">
          <DemoNotice />
          {children}
        </div>
        <Footer />
        <Toaster
          theme="system"
          position="bottom-right"
          toastOptions={{
            className: "border border-line bg-surface text-ink",
          }}
        />
      </body>
    </html>
  );
}
