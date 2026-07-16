"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Anvil, Code2, Menu, X, FileDown, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { toast } from "sonner";

const GITHUB_REPO =
  "https://github.com/Dpehect/Softbridge-Career-Forge-FullStack-Web-App/tree/main";

const links = [
  { name: "Forge", path: "/forge" },
  { name: "Resume", path: "/resume" },
  { name: "Jobs", path: "/jobs" },
  { name: "Paths", path: "/paths" },
  { name: "Coach", path: "/coach" },
  { name: "Dashboard", path: "/dashboard" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { resume, resetResume, forgeParsedCv, clearForgeCv } = useCareerStore();

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
    if (window.confirm("Are you sure you want to clear your current CV and reset?")) {
      resetResume();
      clearForgeCv();
      toast.success("CV cleared. You can start fresh.");
    }
  };

  const handleExport = async () => {
    let cvToExport = forgeParsedCv;
    if (!cvToExport) {
      if (resume.fullName || resume.headline || resume.summary) {
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
    }

    if (!cvToExport) {
      toast.error("Please load, build or paste a CV first before exporting.");
      return;
    }

    try {
      await exportCvAsPdf(cvToExport);
      toast.success("Professional PDF exported!");
    } catch {
      toast.error("Could not export PDF.");
    }
  };

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 p-3 md:p-4"
    >
      <div className="max-w-6xl mx-auto glass-panel rounded-2xl px-3.5 md:px-4 py-2.5 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-cosmic-teal text-midnight-void flex items-center justify-center shadow-[0_8px_20px_rgba(217,72,32,0.28)]">
            <Anvil className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <p className="font-display font-bold text-[13px] tracking-tight">CareerForge</p>
            <p className="text-[10px] text-muted-steel hidden sm:block">by SoftBridge</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((link) => {
            const isActive = pathname === link.path || pathname.startsWith(`${link.path}/`);
            return (
              <Link
                key={link.name}
                href={link.path}
                className={cn(
                  "relative px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wide transition-colors",
                  isActive ? "text-midnight-void" : "text-muted-steel hover:text-star-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-star-white rounded-lg -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {hasContent && (
            <div className="hidden sm:inline-flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-9 text-xs text-sunset-coral hover:text-sunset-coral hover:bg-sunset-coral/5 gap-1"
                title="Clear current CV"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear CV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-9 text-xs gap-1"
                title="Export PDF"
              >
                <FileDown className="w-3.5 h-3.5" /> Export PDF
              </Button>
            </div>
          )}
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-2 sm:px-3 text-xs font-semibold border border-black/8 bg-star-white text-midnight-void hover:bg-cosmic-teal transition-colors shadow-sm"
            title="View Source on GitHub"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Source on GitHub</span>
            <span className="sm:hidden">GitHub</span>
          </a>
          <Link
            href="/forge"
            className="hidden sm:inline-flex h-9 items-center rounded-xl px-3.5 text-xs font-semibold bg-cosmic-teal text-midnight-void hover:bg-sunset-coral transition-colors shadow-[0_8px_22px_rgba(217,72,32,0.28)]"
          >
            Open Forge
          </Link>
          <button
            className="lg:hidden p-2 rounded-xl border border-black/8"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="lg:hidden max-w-6xl mx-auto mt-2 glass-panel rounded-2xl p-2 flex flex-col"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-sm font-semibold",
                  pathname.startsWith(link.path)
                    ? "bg-star-white text-midnight-void"
                    : "text-muted-steel"
                )}
              >
                {link.name}
              </Link>
            ))}
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="mt-1 px-3 py-2.5 rounded-xl text-sm font-semibold border border-black/8 inline-flex items-center gap-2 bg-star-white text-midnight-void"
            >
              <Code2 className="w-4 h-4" /> View Source on GitHub
            </a>
            {hasContent && (
              <div className="flex gap-2 border-t border-black/5 mt-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleClearAll();
                    setOpen(false);
                  }}
                  className="flex-1 text-xs text-sunset-coral hover:bg-sunset-coral/5"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear CV
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleExport();
                    setOpen(false);
                  }}
                  className="flex-1 text-xs"
                >
                  <FileDown className="w-3.5 h-3.5 mr-1" /> Export PDF
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
