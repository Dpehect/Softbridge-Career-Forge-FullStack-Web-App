"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anvil,
  Menu,
  X,
  FileDown,
  RotateCcw,
  Briefcase,
  GitCompare,
  MessageSquare,
  LayoutDashboard,
  Sun,
  Moon,
  Zap,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { toast } from "sonner";
import { AiStatusDot } from "@/components/AiStatusDot";
import { JourneyStepper } from "@/components/JourneyStepper";

/** Tek düz, profesyonel navigasyon — hepsi görünür, bitişik değil */
const NAV = [
  { path: "/forge", label: "Forge", icon: Anvil },
  { path: "/resume", label: "Özgeçmiş", icon: FileText },
  { path: "/dashboard", label: "Kokpit", icon: LayoutDashboard },
  { path: "/coach", label: "Koç", icon: MessageSquare },
  { path: "/jobs", label: "İlanlar", icon: Briefcase },
  { path: "/paths", label: "Yollar", icon: GitCompare },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resume, resetResume, forgeParsedCv, clearForgeCv, theme, setTheme } =
    useCareerStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const hasContent =
    Boolean(forgeParsedCv) ||
    Boolean(
      resume.fullName ||
        resume.headline ||
        resume.summary ||
        resume.skills.length > 0 ||
        resume.experience.length > 0
    );

  const handleClearAll = () => {
    if (
      window.confirm(
        "Mevcut CV ve verilerinizi temizlemek istediğinize emin misiniz?"
      )
    ) {
      resetResume();
      clearForgeCv();
      toast.success("CV temizlendi. Sıfırdan başlayabilirsiniz.");
    }
  };

  const handleExport = async () => {
    let cvToExport = forgeParsedCv;
    if (!cvToExport && (resume.fullName || resume.headline || resume.summary)) {
      cvToExport = {
        name: resume.fullName || "Aday",
        title: resume.headline || "Profesyonel",
        email: resume.email,
        phone: null,
        location: resume.location || null,
        summary: resume.summary || null,
        skills: resume.skills,
        experience: resume.experience.map((e) => ({
          company: e.company,
          position: e.role,
          duration: [e.start, e.end].filter(Boolean).join(" – ") || "—",
          description: e.highlights,
        })),
        education: resume.education.map((e) => ({
          school: e.school,
          degree: e.degree,
          year: e.year,
        })),
        rawLength: 0,
        photoDataUrl: resume.photoDataUrl || null,
      };
    }
    if (!cvToExport) {
      toast.error("Önce bir CV yükleyin.");
      return;
    }
    try {
      await exportCvAsPdf(cvToExport);
      toast.success("Profesyonel PDF indirildi!");
    } catch {
      toast.error("PDF dışa aktarılamadı.");
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Üst cam bar */}
        <div className="border-b border-white/10 bg-white/75 backdrop-blur-xl dark:bg-[#0c0614]/90 dark:border-white/5">
          <div className="max-w-6xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 shrink-0 group"
              onClick={() => setMobileOpen(false)}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-orange-500 shadow-lg shadow-indigo-500/25 transition-transform group-hover:scale-105">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="hidden sm:block leading-none">
                <p className="font-display text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                  CareerForge
                </p>
                <p className="mt-1 text-[10px] font-medium tracking-wide text-slate-500">
                  SoftBridge
                </p>
              </div>
            </Link>

            {/* Desktop nav — geniş aralıklı, modern pill active */}
            <nav
              className="hidden lg:flex items-center gap-1"
              aria-label="Ana menü"
            >
              {NAV.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "relative px-4 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-200",
                      active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-indigo-300"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sağ aksiyonlar */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {hasContent && (
                <div className="hidden xl:flex items-center gap-1 mr-1">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors dark:hover:bg-rose-500/10"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Temizle
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-white/5"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    PDF
                  </button>
                </div>
              )}

              <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors dark:hover:bg-white/5 cursor-pointer"
                  title={theme === "dark" ? "Açık tema" : "Koyu tema"}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
                <AiStatusDot />
              </div>

              <Link
                href="/forge"
                className="inline-flex h-9 sm:h-10 items-center rounded-full bg-indigo-600 px-4 sm:px-5 text-[12px] sm:text-[13px] font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
              >
                Analiz Başlat
              </Link>

              <button
                type="button"
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300 cursor-pointer"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Yol haritası şeridi — navbar ile bütünleşik */}
          <div className="border-t border-slate-100/80 dark:border-white/5">
            <JourneyStepper className="!border-0 !bg-transparent" />
          </div>
        </div>

        {/* Mobil panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-b border-slate-200/80 bg-white/95 backdrop-blur-xl dark:bg-[#0c0614]/95 dark:border-white/10"
            >
              <nav className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-2 gap-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-colors",
                        active
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                          : "bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-indigo-500/10"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="max-w-6xl mx-auto px-4 pb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex h-10 flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  Tema
                </button>
                <div className="flex h-10 items-center rounded-2xl border border-slate-200 px-3 dark:border-white/10">
                  <AiStatusDot />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobil alt bar — ferah 4 ana rota */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 bg-white/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] dark:bg-[#0c0614]/95 dark:border-white/10">
        <div className="flex items-stretch justify-around px-2 py-2">
          {NAV.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors",
                  active ? "text-indigo-600" : "text-slate-500"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    active && "bg-indigo-50 dark:bg-indigo-500/15"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
