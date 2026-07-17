"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anvil, Code2, Menu, X, FileDown, RotateCcw,
  Briefcase, GitCompare, MessageSquare, History,
  Sun, Moon, User, Zap, FileText,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { toast } from "sonner";
import { useTranslation } from "@/lib/forge/i18n";
import { AiStatusDot } from "@/components/AiStatusDot";
import { JourneyStepper } from "@/components/JourneyStepper";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

/** Primary product path first — Jobs/Paths are complementary */
const links = [
  { name: "Forge", path: "/forge", icon: Anvil, primary: true },
  { name: "Resume", path: "/resume", icon: FileText, primary: true },
  { name: "Dashboard", path: "/dashboard", icon: History, primary: true },
  { name: "Coach", path: "/coach", icon: MessageSquare, primary: false },
  { name: "Jobs", path: "/jobs", icon: Briefcase, primary: false },
  { name: "Paths", path: "/paths", icon: GitCompare, primary: false },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resume, resetResume, forgeParsedCv, clearForgeCv, theme, setTheme } = useCareerStore();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const getNavName = (name: string) => {
    switch (name) {
      case "Forge":
        return "Analiz";
      case "Resume":
        return t("navResume");
      case "Jobs":
        return t("navJobs");
      case "Paths":
        return t("navPaths");
      case "Coach":
        return t("navCoach");
      case "Dashboard":
        return "Kokpit";
      default:
        return name;
    }
  };

  const primaryLinks = links.filter((l) => l.primary);
  const secondaryLinks = links.filter((l) => !l.primary);

  const hasContent =
    Boolean(forgeParsedCv) ||
    Boolean(resume.fullName || resume.headline || resume.summary || resume.skills.length > 0 || resume.experience.length > 0);

  const handleClearAll = () => {
    if (window.confirm(t("clearConfirm"))) {
      resetResume();
      clearForgeCv();
      toast.success(t("clearSuccess"));
    }
  };

  const handleExport = async () => {
    let cvToExport = forgeParsedCv;
    if (!cvToExport && (resume.fullName || resume.headline || resume.summary)) {
      cvToExport = {
        name: resume.fullName || "Candidate",
        title: resume.headline || "Professional",
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
      toast.success(t("exportSuccess"));
    } catch {
      toast.error("PDF dışa aktarılamadı.");
    }
  };

  return (
    <>
      {/* ── Top Navbar ────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4 pb-0"
      >
        <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-3.5 md:px-5 py-2.5 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setOpen(false)}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #6B21A8, #F97316)", boxShadow: "0 8px 20px rgba(107,33,168,0.4)" }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display font-bold text-[13px] tracking-tight text-star-white">CareerForge</p>
              <p className="text-[10px] text-muted-steel hidden sm:block">
                Verileriniz cihazınızda · %100 gizli
              </p>
            </div>
          </Link>

          {/* Desktop nav — primary path first */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {primaryLinks.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "relative px-3 py-1.5 rounded-xl text-[11px] font-bold tracking-wide transition-all duration-200",
                    isActive
                      ? "text-white"
                      : "text-muted-steel hover:text-star-white hover:bg-cosmic-teal/8"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 rounded-xl -z-10 bg-indigo-600"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {getNavName(link.name)}
                </Link>
              );
            })}
            <span className="mx-1 h-4 w-px bg-slate-200 dark:bg-white/10" aria-hidden />
            {secondaryLinks.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide transition-colors",
                    isActive
                      ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/15"
                      : "text-muted-steel hover:text-star-white hover:bg-cosmic-teal/8"
                  )}
                >
                  {getNavName(link.name)}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5">
            {/* Export / Clear — only when CV loaded */}
            {hasContent && (
              <div className="hidden sm:inline-flex items-center gap-1.5">
                <Button
                  variant="ghost" size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs text-sunset-coral hover:bg-sunset-coral/8 gap-1 px-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden md:inline">{t("clearCv")}</span>
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={handleExport}
                  className="h-8 text-xs gap-1 px-2 text-star-white border border-cosmic-teal/20 hover:bg-cosmic-teal/8"
                >
                  <FileDown className="w-3 h-3" />
                  <span className="hidden md:inline">{t("exportPdf")}</span>
                </Button>
              </div>
            )}

            {/* Dark/Light toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-8 w-8 rounded-xl border border-border-color flex items-center justify-center text-muted-steel hover:text-star-white hover:bg-cosmic-teal/8 hover:border-cosmic-teal/30 transition-all cursor-pointer"
              title={theme === "dark" ? "Açık tema" : "Koyu tema"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Local AI status — green = hazır */}
            <AiStatusDot />

            {/* GitHub */}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              className="h-8 w-8 rounded-xl border border-border-color flex items-center justify-center text-muted-steel hover:text-star-white hover:bg-cosmic-teal/8 hover:border-cosmic-teal/30 transition-all"
              title="GitHub"
            >
              <Code2 className="w-3.5 h-3.5" />
            </a>

            {/* User avatar (placeholder) */}
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cosmic-teal to-sunset-coral flex items-center justify-center text-white shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>

            {/* CTA */}
            <Link
              href="/forge"
              className="hidden sm:inline-flex h-8 items-center rounded-xl px-3.5 text-[11px] font-bold text-white bg-indigo-600 shadow-sm transition-colors hover:bg-indigo-700"
            >
              {t("openForge")}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden h-8 w-8 rounded-xl border border-border-color flex items-center justify-center text-muted-steel cursor-pointer"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="lg:hidden max-w-6xl mx-auto mt-2 glass-panel rounded-2xl p-2 flex flex-col gap-0.5"
            >
              {links.map((link) => {
                const isActive = pathname.startsWith(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all",
                      isActive
                        ? "text-white"
                        : "text-muted-steel hover:text-star-white hover:bg-cosmic-teal/5"
                    )}
                    style={isActive ? { background: "linear-gradient(135deg, #6B21A8, #A855F7)" } : {}}
                  >
                    <Icon className="w-4 h-4" />
                    {getNavName(link.name)}
                  </Link>
                );
              })}
              <div className="border-t border-border-color mt-1 pt-2 flex gap-2">
                <button
                  onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setOpen(false); }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border border-border-color text-muted-steel hover:text-star-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                  {theme === "dark" ? "Açık" : "Koyu"}
                </button>
              </div>
              {hasContent && (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { handleExport(); setOpen(false); }} className="flex-1 text-xs text-star-white">
                    <FileDown className="w-3.5 h-3.5 mr-1" /> PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { handleClearAll(); setOpen(false); }} className="flex-1 text-xs text-sunset-coral">
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t("clearCv")}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product journey stepper under nav */}
        <div className="max-w-6xl mx-auto mt-2 mb-2">
          <div className="glass-panel rounded-2xl overflow-hidden">
            <JourneyStepper />
          </div>
        </div>
      </motion.header>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-border-color py-2 px-3 flex items-center justify-around">
        {links.map((link) => {
          const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.path}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all min-w-[52px] relative"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute -top-1 w-5 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #6B21A8, #F97316)" }}
                />
              )}
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-cosmic-teal" : "text-muted-steel")} />
              <span className={cn("text-[9px] font-semibold tracking-wide", isActive ? "text-cosmic-teal" : "text-muted-steel")}>
                {getNavName(link.name)}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
