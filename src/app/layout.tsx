import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { DemoNotice } from "@/components/DemoNotice";
import { OnboardingModal } from "@/components/OnboardingModal";
import { WorkspaceSyncProvider } from "@/components/providers/WorkspaceSyncProvider";
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
  "https://softbridge-career-forge-full-stack-brown.vercel.app";

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
      "Profesyonel CV araçları, iş eşleştirme, ATS kontrolü ve güvenli hesap senkronizasyonu.",
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

/**
 * Blocking theme bootstrap — runs before first paint / React hydrate.
 * Zustand persist shape: { state: { theme, lang, ... }, version }.
 * Keep this inline (no external file) so it never races CSS/JS chunks.
 *
 * Important: do NOT put React-managed className on <html> (fonts live on
 * <body>). Hydration would otherwise wipe the `dark` class this script adds.
 */
const themeBootstrapScript = `(function(){try{var d=document.documentElement;var raw=localStorage.getItem("softbridge-careerforge-ui-v2")||localStorage.getItem("softbridge-careerforge");var theme="light";var lang=null;if(raw){var p=JSON.parse(raw);var s=p&&p.state?p.state:p;if(s){if(s.theme==="dark"||s.theme==="light")theme=s.theme;if(s.lang==="tr"||s.lang==="en")lang=s.lang;}}d.setAttribute("data-theme",theme);if(theme==="dark"){d.classList.add("dark");d.style.colorScheme="dark";}else{d.classList.remove("dark");d.style.colorScheme="light";}if(lang)d.lang=lang;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // No React-managed className on <html> — hydration must not wipe the
  // `dark` class applied by the blocking script in <head>.
  return (
    <html lang="tr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col bg-background text-ink font-sans`}
      >
        <WorkspaceSyncProvider>
          <Header />
          <div className="flex-1 pt-16 pb-20 md:pt-[6.5rem] md:pb-0">
            <DemoNotice />
            {children}
          </div>
          <Footer />
          <OnboardingModal />
          <Toaster
            theme="system"
            position="bottom-right"
            toastOptions={{
              className: "border border-line bg-surface text-ink",
            }}
          />
        </WorkspaceSyncProvider>
      </body>
    </html>
  );
}
