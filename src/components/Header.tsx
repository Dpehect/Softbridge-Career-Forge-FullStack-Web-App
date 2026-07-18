"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Command,
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
  Home,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { AuthControl } from "@/components/auth/AuthControl";
import { PrivateLocalBadge } from "@/components/PrivateLocalBadge";
import { useMessages } from "@/i18n/useMessages";
import { openCommandPalette } from "@/components/CommandPalette";

const NAV_ITEMS = [
  { path: "/dashboard", labelTr: "Ana Sayfa", labelEn: "Home", icon: LayoutDashboard, activePaths: ["/dashboard"] },
  { path: "/resume", labelTr: "CV Çalışma Alanı", labelEn: "Resume Workspace", icon: FileText, activePaths: ["/resume", "/forge"] },
  { path: "/jobs", labelTr: "İş Başvuru Hattı", labelEn: "Job Pipeline", icon: BriefcaseBusiness, activePaths: ["/jobs"] },
  { path: "/coach", labelTr: "Kariyer Asistanı", labelEn: "Career Assistant", icon: MessagesSquare, activePaths: ["/coach", "/paths"] },
  { path: "/account", labelTr: "Hesap", labelEn: "Account", icon: UserRound, activePaths: ["/account"] },
] as const;

const PUBLIC_ROUTES = ["/login", "/privacy", "/terms", "/auth/callback", "/auth"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function Header() {
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
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

  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 60], [64, 56]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    root.style.colorScheme = isDark ? "dark" : "light";
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
    if (hasResume) {
      await exportCvAsPdf(resume);
      toast.success(messages.header.pdfReady);
      setProfileOpen(false);
    } else if (forgeParsedCv) {
      await exportCvAsPdf(forgeParsedCv);
      toast.success(messages.header.pdfReady);
      setProfileOpen(false);
    } else {
      toast.error(messages.header.createFirst);
    }
  };

  const clearProfile = () => {
    if (!window.confirm(messages.header.clearConfirm)) return;
    resetResume();
    clearForgeCv();
    toast.success(messages.header.cleared);
    setProfileOpen(false);
  };

  const publicRoute = isPublicRoute(pathname);

  // Simplified public/auth layout
  if (publicRoute) {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-[min(100%-2rem,80rem)] items-center justify-between">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={messages.header.home}>
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-ink text-[0.6875rem] font-bold text-background transition-transform duration-200 group-hover:-rotate-3">
              CF
            </span>
            <span className="text-[0.9375rem] font-semibold text-ink">CareerForge</span>
          </Link>
          <div className="flex items-center gap-1.5">
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
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Full app header for workspace pages
  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface"
        style={{ height: headerHeight }}
      >
        <div className="mx-auto flex h-full w-[min(100%-2rem,80rem)] items-center gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={messages.header.home}>
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-ink text-[0.6875rem] font-bold text-background transition-transform duration-200 group-hover:-rotate-3">
              CF
            </span>
            <span className="text-[0.9375rem] font-semibold text-ink">CareerForge</span>
          </Link>
          <div className="hidden md:block">
            <PrivateLocalBadge compact />
          </div>

          <nav className="mx-auto hidden items-stretch self-stretch xl:flex" aria-label={messages.nav.primary}>
            {NAV_ITEMS.map((item) => {
              const active = item.activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative flex items-center px-2 text-xs font-semibold transition-colors duration-150",
                    active ? "text-ink" : "text-ink-2 hover:text-ink"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {locale === "tr" ? item.labelTr : item.labelEn}
                  {active && <span className="absolute inset-x-2 bottom-0 h-0.5 bg-brand" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden h-10 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink lg:inline-flex"
              aria-label={locale === "tr" ? "Hızlı komutları aç" : "Open quick commands"}
              title={locale === "tr" ? "Hızlı komutlar" : "Quick commands"}
            >
              <Command className="h-4 w-4" />
              <span>{locale === "tr" ? "Hızlı erişim" : "Quick access"}</span>
              <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-3">⌘K</kbd>
            </button>
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
              onClick={() => setMoreOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink xl:hidden"
              aria-label={moreOpen ? messages.header.closeMenu : messages.header.openMenu}
              aria-expanded={moreOpen}
            >
              {moreOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Fullscreen Mobile Drawer Menu */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md xl:hidden">
          <div className="flex h-16 items-center justify-between border-b border-line px-4">
            <span className="text-[0.9375rem] font-semibold text-ink">
              {locale === "tr" ? "Menü" : "Menu"}
            </span>
            <button
              type="button"
              onClick={() => setMoreOpen(false)}
              className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] text-ink transition-colors hover:bg-surface-2"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="grid gap-2">
              <p className="section-label px-1">{locale === "tr" ? "Çalışma alanları" : "Workspaces"}</p>
              {NAV_ITEMS.map((item) => {
                const active = item.activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex min-h-[48px] items-center gap-3 rounded-lg border px-4 text-sm font-medium transition-colors",
                      active ? "border-brand bg-[var(--accent-wash)] text-brand-strong" : "border-line bg-surface text-ink hover:bg-surface-2"
                    )}
                  >
                    <Icon className="h-5 w-5" /> {locale === "tr" ? item.labelTr : item.labelEn}
                  </Link>
                );
              })}
            </div>

            <div className="grid gap-2 border-t border-line pt-5">
              <p className="section-label px-1">{locale === "tr" ? "Bağlamsal araçlar" : "Contextual tools"}</p>
              <Link
                href="/forge"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-lg border px-4 text-sm font-medium transition-colors",
                  pathname === "/forge" ? "border-brand bg-[var(--accent-wash)] text-brand-strong" : "border-line bg-surface text-ink hover:bg-surface-2"
                )}
              >
                <ScanLine className="h-5 w-5" /> {locale === "tr" ? "CV'yi analiz et" : "Analyze resume"}
              </Link>
              <Link
                href="/paths"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-lg border px-4 text-sm font-medium transition-colors",
                  pathname === "/paths" ? "border-brand bg-[var(--accent-wash)] text-brand-strong" : "border-line bg-surface text-ink hover:bg-surface-2"
                )}
              >
                <Route className="h-5 w-5" /> {locale === "tr" ? "Gelişim planını aç" : "Open development plan"}
              </Link>
              <Link
                href="/contact"
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex min-h-[48px] items-center gap-3 rounded-lg border px-4 text-sm font-medium transition-colors",
                  pathname === "/contact" ? "border-brand bg-[var(--accent-wash)] text-brand-strong" : "border-line bg-surface text-ink hover:bg-surface-2"
                )}
              >
                <MessagesSquare className="h-5 w-5" /> {locale === "tr" ? "İletişim & Destek" : "Contact & Support"}
              </Link>
              <button
                type="button"
                onClick={() => { setMoreOpen(false); openCommandPalette(); }}
                className="flex min-h-[48px] items-center gap-3 rounded-lg border border-line bg-surface px-4 text-left text-sm font-medium text-ink transition-colors hover:bg-surface-2"
              >
                <Command className="h-5 w-5" /> {locale === "tr" ? "Hızlı komutları aç" : "Open quick commands"}
              </button>
            </div>

            <div className="border-t border-line pt-5">
              <AuthControl variant="mobile" onNavigate={() => setMoreOpen(false)} />
            </div>

            <div className="border-t border-line pt-5">
              <p className="section-label mb-3">{locale === "tr" ? "Tercihler" : "Preferences"}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLang(locale === "tr" ? "en" : "tr")}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink hover:bg-surface-2"
                >
                  <Languages className="h-4.5 w-4.5 text-ink-2" />
                  <span>{locale.toUpperCase()}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 text-xs font-semibold text-ink hover:bg-surface-2"
                >
                  {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-ink-2" /> : <Moon className="h-4.5 w-4.5 text-ink-2" />}
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] xl:hidden"
        aria-label={messages.nav.quick}
      >
        <div className="grid h-16 grid-cols-5 px-1">
          <Link
            href="/dashboard"
            className={cn(
              "flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors",
              pathname === "/dashboard" ? "text-brand-strong" : "text-ink-3 hover:text-ink"
            )}
            aria-current={pathname === "/dashboard" ? "page" : undefined}
          >
            <Home className="h-5 w-5" />
            <span className="truncate">{locale === "tr" ? "Panel" : "Home"}</span>
          </Link>

          <Link
            href="/resume"
            className={cn(
              "relative flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors",
              pathname === "/resume" || pathname.startsWith("/forge") ? "text-brand-strong" : "text-ink-3 hover:text-ink"
            )}
            aria-current={pathname === "/resume" || pathname.startsWith("/forge") ? "page" : undefined}
          >
            {(pathname === "/resume" || pathname.startsWith("/forge")) && <span className="absolute inset-x-5 top-0 h-0.5 bg-brand" />}
            <FileText className="h-5 w-5" />
            <span className="truncate">{locale === "tr" ? "CV" : "Resume"}</span>
          </Link>

          <Link
            href="/jobs"
            className={cn(
              "flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors",
              pathname.startsWith("/jobs") ? "text-brand-strong" : "text-ink-3 hover:text-ink"
            )}
            aria-current={pathname.startsWith("/jobs") ? "page" : undefined}
          >
            <BriefcaseBusiness className="h-5 w-5" />
            <span className="truncate">{locale === "tr" ? "İşler" : "Jobs"}</span>
          </Link>

          <Link
            href="/coach"
            className={cn(
              "flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors",
              pathname.startsWith("/coach") || pathname.startsWith("/paths") ? "text-brand-strong" : "text-ink-3 hover:text-ink"
            )}
            aria-current={pathname.startsWith("/coach") || pathname.startsWith("/paths") ? "page" : undefined}
          >
            <MessagesSquare className="h-5 w-5" />
            <span className="truncate">{locale === "tr" ? "Asistan" : "Assistant"}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-[44px] min-w-0 flex-col items-center justify-center gap-0.5 text-[0.625rem] font-semibold transition-colors",
              moreOpen ? "text-brand-strong" : "text-ink-3 hover:text-ink"
            )}
            aria-expanded={moreOpen}
            aria-haspopup="true"
          >
            <Menu className="h-5 w-5" />
            <span className="truncate">{locale === "tr" ? "Menü" : "Menu"}</span>
          </button>
        </div>
      </nav>
    </>
  );
}
