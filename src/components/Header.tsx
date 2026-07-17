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
  History,
  Sun,
  Moon,
  User,
  Zap,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { toast } from "sonner";
import { AiStatusDot } from "@/components/AiStatusDot";
import { JourneyStepper } from "@/components/JourneyStepper";

/** Sade ana menü: Logo · Forge · Özgeçmişim · (profil) */
const primaryLinks = [
  { name: "Forge", path: "/forge", icon: Anvil, label: "Forge" },
  { name: "Resume", path: "/resume", icon: FileText, label: "Özgeçmişim" },
  { name: "Dashboard", path: "/dashboard", icon: History, label: "Kokpit" },
] as const;

/** Hamburger / “Daha fazla” altı */
const moreLinks = [
  { name: "Coach", path: "/coach", icon: MessageSquare, label: "AI Koç" },
  { name: "Jobs", path: "/jobs", icon: Briefcase, label: "İş İlanları" },
  { name: "Paths", path: "/paths", icon: GitCompare, label: "Kariyer Yolları" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const { resume, resetResume, forgeParsedCv, clearForgeCv, theme, setTheme } =
    useCareerStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
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

  const handleClearAll = () => {
    if (window.confirm("Mevcut CV ve verilerinizi temizlemek istediğinize emin misiniz?")) {
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

  const linkClass = (active: boolean) =>
    cn(
      "text-sm font-semibold tracking-wide transition-colors",
      active ? "text-indigo-600" : "text-slate-600 hover:text-indigo-600"
    );

  return (
    <>
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4 pb-0"
      >
        <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #6B21A8, #F97316)",
                boxShadow: "0 8px 20px rgba(107,33,168,0.4)",
              }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-[13px] tracking-tight text-star-white">
                CareerForge
              </p>
              <p className="text-[10px] text-slate-500 hidden sm:block">
                SoftBridge · %100 gizli
              </p>
            </div>
          </Link>

          {/* Desktop: sade ana menü + gap-8 */}
          <nav className="hidden lg:flex items-center gap-8">
            {primaryLinks.map((link) => {
              const active =
                pathname === link.path || pathname.startsWith(`${link.path}/`);
              return (
                <Link key={link.path} href={link.path} className={linkClass(active)}>
                  {link.label}
                </Link>
              );
            })}

            {/* Daha fazla → hamburger tarzı dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer",
                  moreOpen && "text-indigo-600"
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
                Daha fazla
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-lg p-2 dark:bg-panel dark:border-white/10"
                  >
                    {moreLinks.map((link) => {
                      const Icon = link.icon;
                      const active =
                        pathname === link.path ||
                        pathname.startsWith(`${link.path}/`);
                      return (
                        <Link
                          key={link.path}
                          href={link.path}
                          onClick={() => setMoreOpen(false)}
                          className={cn(
                            "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                            active
                              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15"
                              : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-white/5"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Sağ kontroller */}
          <div className="flex items-center gap-2">
            {hasContent && (
              <div className="hidden md:inline-flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-9 text-xs text-sunset-coral hover:bg-sunset-coral/8 gap-1 px-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Temizle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExport}
                  className="h-9 text-xs gap-1 px-2 text-slate-600 border border-slate-200 hover:text-indigo-600"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  PDF
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
              title={theme === "dark" ? "Açık tema" : "Koyu tema"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <AiStatusDot />

            <div
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-sm"
              title="Profil"
            >
              <User className="w-4 h-4" />
            </div>

            <Link
              href="/forge"
              className="hidden sm:inline-flex h-9 items-center rounded-xl px-4 text-xs font-bold text-white bg-indigo-600 shadow-lg transition-colors hover:bg-indigo-700"
            >
              Forge&apos;u Aç
            </Link>

            <button
              type="button"
              className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menü"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden max-w-6xl mx-auto mt-2 glass-panel rounded-2xl p-3 flex flex-col gap-1"
            >
              {[...primaryLinks, ...moreLinks].map((link) => {
                const active =
                  pathname === link.path || pathname.startsWith(`${link.path}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                      active
                        ? "bg-indigo-600 text-white"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto mt-2 mb-2">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <JourneyStepper />
          </div>
        </div>
      </motion.header>

      {/* Mobil alt nav — sadece ana 3 yol */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-slate-200/60 py-2 px-4 flex items-center justify-around">
        {primaryLinks.map((link) => {
          const active =
            pathname === link.path || pathname.startsWith(`${link.path}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              href={link.path}
              className="flex flex-col items-center gap-0.5 py-1 min-w-[64px]"
            >
              <Icon
                className={cn(
                  "w-5 h-5",
                  active ? "text-indigo-600" : "text-slate-500"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold",
                  active ? "text-indigo-600" : "text-slate-500"
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
