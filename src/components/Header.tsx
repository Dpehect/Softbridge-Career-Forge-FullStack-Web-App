"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  User,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { toast } from "sonner";
import { AiStatusDot } from "@/components/AiStatusDot";
import { JourneyStepper } from "@/components/JourneyStepper";

/** Sadece 2 ana rota — geri kalanı profil menüsünde */
const MAIN_NAV = [
  { path: "/forge", label: "Analiz" },
  { path: "/resume", label: "Özgeçmişim" },
] as const;

const PROFILE_LINKS = [
  { path: "/dashboard", label: "Kariyer Kokpiti", icon: LayoutDashboard },
  { path: "/coach", label: "AI Koç", icon: MessageSquare },
  { path: "/jobs", label: "İş İlanları", icon: Briefcase },
  { path: "/paths", label: "Kariyer Yolları", icon: GitCompare },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { resume, resetResume, forgeParsedCv, clearForgeCv, theme, setTheme } =
    useCareerStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hasContent =
    Boolean(forgeParsedCv) ||
    Boolean(
      resume.fullName ||
        resume.headline ||
        resume.summary ||
        resume.skills.length > 0 ||
        resume.experience.length > 0
    );

  const displayName =
    forgeParsedCv?.name &&
    forgeParsedCv.name !== "Candidate" &&
    forgeParsedCv.name !== "Aday"
      ? forgeParsedCv.name.split(" ")[0]
      : resume.fullName?.trim().split(" ")[0] || "Profil";

  const handleClearAll = () => {
    if (
      window.confirm(
        "Mevcut CV ve verilerinizi temizlemek istediğinize emin misiniz?"
      )
    ) {
      resetResume();
      clearForgeCv();
      toast.success("CV temizlendi. Sıfırdan başlayabilirsiniz.");
      setProfileOpen(false);
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
        <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:bg-slate-950/80 dark:border-slate-800/80">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6">
            {/* Logo */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6B21A8] via-[#A855F7] to-[#F97316] shadow-lg shadow-purple-500/25 transition-transform group-hover:scale-105">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div className="hidden leading-none sm:block">
                <p className="font-display text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                  CareerForge
                </p>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  SoftBridge Solutions
                </p>
              </div>
            </Link>

            {/* Empty space in the middle for a clean SaaS look */}
            <div className="hidden md:flex flex-1" />

             {/* Sağ: Menü Linkleri + Sistem Hazır · Başla · Profil */}
            <div className="flex items-center gap-6 sm:gap-8">
              {/* Desktop Nav Links on the Right side */}
              <nav className="hidden items-center gap-8 md:flex" aria-label="Ana menü">
                {MAIN_NAV.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-[#C084FC]",
                        active
                          ? "text-purple-600 dark:text-[#C084FC]"
                          : "text-slate-700 dark:text-slate-200"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="hidden sm:block">
                <AiStatusDot />
              </div>

              <Link
                href="/forge"
                className="inline-flex h-9 items-center rounded-full px-4 text-xs font-bold text-white shadow-lg transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
                  boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
                }}
              >
                Başla
              </Link>

              {/* Profil menüsü — sadece şık bir dairesel avatar */}
              <div className="relative flex items-center" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6B21A8] to-[#F97316] text-white transition-all hover:scale-105 active:scale-95 cursor-pointer relative"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  title={displayName}
                >
                  <User className="h-4 w-4" />
                  {hasContent && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#10B981] dark:border-slate-950" />
                  )}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      role="menu"
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="border-b border-slate-100 px-4 py-3 dark:border-white/5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {displayName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Verileriniz cihazınızda · %100 gizli
                        </p>
                      </div>

                      <div className="p-1.5">
                        {PROFILE_LINKS.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              role="menuitem"
                              className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                                active
                                  ? "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                                  : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                              )}
                            >
                              <Icon className="h-4 w-4 opacity-70" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-100 p-1.5 dark:border-white/5">
                        <button
                          type="button"
                          onClick={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                          }
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 cursor-pointer"
                        >
                          {theme === "dark" ? (
                            <Sun className="h-4 w-4 opacity-70" />
                          ) : (
                            <Moon className="h-4 w-4 opacity-70" />
                          )}
                          {theme === "dark" ? "Açık tema" : "Koyu tema"}
                        </button>
                        {hasContent && (
                          <>
                            <button
                              type="button"
                              onClick={handleExport}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 cursor-pointer"
                            >
                              <FileDown className="h-4 w-4 opacity-70" />
                              PDF indir
                            </button>
                            <button
                              type="button"
                              onClick={handleClearAll}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                            >
                              <RotateCcw className="h-4 w-4 opacity-70" />
                              Verileri temizle
                            </button>
                          </>
                        )}
                        <Link
                          href="/"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          <LogOut className="h-4 w-4 opacity-70" />
                          Ana sayfa
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 md:hidden dark:border-white/10 dark:text-slate-300 cursor-pointer"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menü"
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Stepper şeridi — Sadece /forge sayfasında gösterilir */}
          {pathname === "/forge" && (
            <div className="border-t border-slate-100 dark:border-white/5">
              <JourneyStepper className="!border-0 !bg-transparent" />
            </div>
          )}
        </div>

        {/* Mobil menü */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/95"
            >
              <div className="space-y-1 px-4 py-4">
                {MAIN_NAV.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-semibold",
                      isActive(item.path)
                        ? "text-white"
                        : "text-slate-900 hover:bg-slate-50 dark:text-slate-100"
                    )}
                    style={isActive(item.path) ? { background: "linear-gradient(135deg, #6B21A8, #A855F7)" } : {}}
                  >
                    {item.label}
                  </Link>
                ))}
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Diğer
                </p>
                {PROFILE_LINKS.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm font-medium",
                      isActive(item.path)
                        ? "bg-purple-50 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300"
                        : "text-slate-800 hover:bg-slate-50 dark:text-slate-200"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobil alt nav — 3 ana odak */}
      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-stretch justify-around px-2 py-2">
          {[
            { path: "/forge", label: "Analiz" },
            { path: "/resume", label: "Özgeçmiş" },
            { path: "/dashboard", label: "Kokpit" },
          ].map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold transition-colors",
                  active ? "text-purple-700" : "text-slate-800 dark:text-slate-400"
                )}
              >
                <span
                  className={cn(
                    "h-1 w-6 rounded-full transition-colors",
                    active ? "bg-purple-600" : "bg-transparent"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
