"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  FileDown,
  FileText,
  LayoutDashboard,
  Languages,
  Menu,
  MessagesSquare,
  Moon,
  Route,
  ScanLine,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { resumeToParsed, useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { JourneyStepper } from "@/components/JourneyStepper";
import { AuthControl } from "@/components/auth/AuthControl";
import { useMessages } from "@/i18n/useMessages";

const NAV_ITEMS = [
  { path: "/dashboard", label: "dashboard", shortLabel: "shortDashboard", icon: LayoutDashboard },
  { path: "/forge", label: "analysis", shortLabel: "shortAnalysis", icon: ScanLine },
  { path: "/resume", label: "resume", shortLabel: "shortResume", icon: FileText },
  { path: "/jobs", label: "jobs", shortLabel: "shortJobs", icon: BriefcaseBusiness },
  { path: "/coach", label: "coach", shortLabel: "shortCoach", icon: MessagesSquare },
  { path: "/paths", label: "roadmap", shortLabel: "shortRoadmap", icon: Route },
] as const;

export function Header() {
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { locale, messages } = useMessages();
  const {
    resume,
    forgeParsedCv,
    theme,
    setTheme,
    setLang,
    resetResume,
    clearForgeCv,
  } = useCareerStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const hasResume = Boolean(
    forgeParsedCv ||
      resume.fullName ||
      resume.headline ||
      resume.summary ||
      resume.skills.length ||
      resume.experience.length
  );
  const firstName =
    forgeParsedCv?.name?.split(" ")[0] || resume.fullName.trim().split(" ")[0] || messages.header.profile;
  const exportResume = async () => {
    const cv = forgeParsedCv ?? (hasResume ? resumeToParsed(resume) : null);

    if (!cv) {
      toast.error(messages.header.createFirst);
      return;
    }
    await exportCvAsPdf(cv);
    toast.success(messages.header.pdfReady);
    setProfileOpen(false);
  };

  const clearProfile = () => {
    if (!window.confirm(messages.header.clearConfirm)) return;
    resetResume();
    clearForgeCv();
    toast.success(messages.header.cleared);
    setProfileOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-[min(100%-2rem,80rem)] items-center gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={messages.header.home}>
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-ink text-[0.6875rem] font-bold text-background transition-transform duration-200 group-hover:-rotate-3">
              CF
            </span>
            <span className="text-[0.9375rem] font-semibold text-ink">CareerForge</span>
          </Link>

          <nav className="mx-auto hidden items-stretch self-stretch xl:flex" aria-label={messages.nav.primary}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative flex items-center px-2 text-xs font-medium transition-colors duration-150",
                    active ? "text-ink" : "text-ink-3 hover:text-ink"
                  )}
                >
                  {messages.nav[item.label]}
                  {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-brand" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLang(locale === "tr" ? "en" : "tr")}
              className="inline-flex h-11 items-center gap-1.5 rounded-[var(--radius-control)] px-2 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label={messages.languageAction}
              title={messages.languageAction}
            >
              <Languages className="h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label={theme === "dark" ? messages.header.lightTheme : messages.header.darkTheme}
              title={theme === "dark" ? messages.header.light : messages.header.dark}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <AuthControl />

            <div ref={profileRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border border-line bg-surface text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                aria-label={messages.header.localProfile}
                title={messages.header.localProfile}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent-wash)] text-[0.625rem] font-bold text-brand-strong">
                  {firstName.slice(0, 1).toUpperCase()}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-[var(--radius-panel)] border border-line bg-surface p-1.5 shadow-lg" role="menu">
                  <div className="border-b border-line px-2.5 py-2">
                    <p className="text-xs font-semibold text-ink">{messages.header.localProfile}</p>
                    <p className="mt-0.5 text-[0.6875rem] text-ink-3">{messages.header.localData}</p>
                  </div>
                  <button
                    type="button"
                    onClick={exportResume}
                    className="mt-1 flex w-full items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-left text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
                    role="menuitem"
                  >
                    <FileDown className="h-3.5 w-3.5" /> {messages.header.exportPdf}
                  </button>
                  <button
                    type="button"
                    onClick={clearProfile}
                    className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-left text-xs text-negative hover:bg-[var(--negative-wash)]"
                    role="menuitem"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {messages.header.clearData}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink xl:hidden"
              aria-label={mobileOpen ? messages.header.closeMenu : messages.header.openMenu}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <JourneyStepper className="hidden border-t border-line bg-background xl:block" />

        {mobileOpen && (
          <nav className="border-t border-line bg-surface px-4 py-3 xl:hidden" aria-label={messages.nav.mobile}>
            <div className="grid grid-cols-2 gap-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2.5 text-sm",
                      active ? "bg-[var(--accent-wash)] text-brand-strong" : "text-ink-2 hover:bg-surface-2"
                    )}
                  >
                    <Icon className="h-4 w-4" /> {messages.nav[item.label]}
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 border-t border-line pt-2">
              <AuthControl variant="mobile" onNavigate={() => setMobileOpen(false)} />
            </div>
          </nav>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-6 border-t border-line bg-surface px-1 pb-[env(safe-area-inset-bottom)] xl:hidden" aria-label={messages.nav.quick}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 text-[0.625rem] font-medium",
                active ? "text-brand-strong" : "text-ink-3"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{messages.nav[item.shortLabel]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
