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
        <main className="flex-1 pt-[5.25rem] md:pt-24 pb-16 lg:pb-0">{children}</main>
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
