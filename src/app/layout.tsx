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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://careerforge.softbridgesolutions.com");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CareerForge | Kişisel Kariyer Asistanı",
    template: "%s | CareerForge",
  },
  description:
    "CV analizi, iş eşleştirme, ATS optimizasyonu, PDF dışa aktarma ve mülakat hazırlığı — tarayıcınızda gizli. SoftBridge Solutions.",
  keywords: [
    "CV analizi",
    "ATS",
    "kariyer asistanı",
    "CareerForge",
    "mülakat hazırlığı",
    "SoftBridge",
  ],
  authors: [{ name: "SoftBridge Solutions" }],
  openGraph: {
    title: "CareerForge | Kişisel Kariyer Asistanı",
    description:
      "Profesyonel CV araçları, iş eşleştirme, ATS kontrolü ve mülakat hazırlığı — tarayıcınızda gizli.",
    url: siteUrl,
    siteName: "CareerForge",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CareerForge | Kişisel Kariyer Asistanı",
    description: "Yerel AI ile CV analizi ve kariyer hazırlığı.",
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
    var stored = localStorage.getItem('career-store');
    if (stored) {
      var parsed = JSON.parse(stored);
      var theme = parsed && parsed.state && parsed.state.theme;
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
    // Default = light — do nothing if no preference saved
  } catch(e) {}
})();
`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-primary font-sans mesh-bg selection:bg-cosmic-teal/20">
        <Header />
        <main className="flex-1 pt-[6.75rem] sm:pt-[7rem] pb-20 lg:pb-8">{children}</main>
        <Footer />
        <Toaster
          theme="system"
          position="bottom-right"
          toastOptions={{
            className: "border bg-panel text-primary",
            style: { borderColor: "rgba(192,132,252,0.2)" },
          }}
        />
      </body>
    </html>
  );
}
