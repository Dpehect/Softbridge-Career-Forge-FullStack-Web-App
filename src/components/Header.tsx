"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileDown,
  FileText,
  LayoutDashboard,
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
import { useCareerStore } from "@/store/useCareerStore";
import { exportCvAsPdf } from "@/lib/forge";
import { JourneyStepper } from "@/components/JourneyStepper";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Genel Bakış", shortLabel: "Özet", icon: LayoutDashboard },
  { path: "/forge", label: "Analiz", shortLabel: "Analiz", icon: ScanLine },
  { path: "/resume", label: "Özgeçmiş", shortLabel: "CV", icon: FileText },
  { path: "/jobs", label: "İşler", shortLabel: "İşler", icon: BriefcaseBusiness },
  { path: "/coach", label: "Koç", shortLabel: "Koç", icon: MessagesSquare },
  { path: "/paths", label: "Yollar", shortLabel: "Yollar", icon: Route },
] as const;

export function Header() {
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const {
    resume,
    forgeParsedCv,
    theme,
    setTheme,
    resetResume,
    clearForgeCv,
  } = useCareerStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

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
    forgeParsedCv?.name?.split(" ")[0] || resume.fullName.trim().split(" ")[0] || "Profil";
  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );

  const exportResume = async () => {
    const cv = forgeParsedCv ?? (hasResume ? {
      name: resume.fullName || "Aday",
      title: resume.headline || "Profesyonel",
      email: resume.email,
      phone: null,
      location: resume.location || null,
      summary: resume.summary || null,
      skills: resume.skills,
      experience: resume.experience.map((item) => ({
        company: item.company,
        position: item.role,
        duration: [item.start, item.end].filter(Boolean).join(" – ") || "—",
        description: item.highlights,
      })),
      education: resume.education.map((item) => ({
        school: item.school,
        degree: item.degree,
        year: item.year,
      })),
      rawLength: 0,
      photoDataUrl: resume.photoDataUrl || null,
    } : null);

    if (!cv) {
      toast.error("Önce bir özgeçmiş oluşturun.");
      return;
    }
    await exportCvAsPdf(cv);
    toast.success("PDF hazırlandı.");
    setProfileOpen(false);
  };

  const clearProfile = () => {
    if (!window.confirm("Özgeçmiş ve analiz verilerini temizlemek istiyor musunuz?")) return;
    resetResume();
    clearForgeCv();
    toast.success("Çalışma alanı temizlendi.");
    setProfileOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 w-[min(100%-2rem,80rem)] items-center gap-4">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="CareerForge ana sayfa">
            <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-ink text-[0.6875rem] font-bold text-background transition-transform duration-200 group-hover:-rotate-3">
              CF
            </span>
            <span className="text-[0.9375rem] font-semibold text-ink">CareerForge</span>
          </Link>

          <span className="hidden h-5 w-px bg-line lg:block" aria-hidden />
          <span className="hidden min-w-24 text-xs text-ink-3 lg:block">
            {activeItem?.label || "Kariyer OS"}
          </span>

          <nav className="mx-auto hidden items-stretch self-stretch md:flex" aria-label="Ana menü">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "relative flex items-center px-3 text-[0.8125rem] font-medium transition-colors duration-150",
                    active ? "text-ink" : "text-ink-3 hover:text-ink"
                  )}
                >
                  {item.label}
                  {active && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-brand" />}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label={theme === "dark" ? "Açık temaya geç" : "Koyu temaya geç"}
              title={theme === "dark" ? "Açık tema" : "Koyu tema"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div ref={profileRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-2"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent-wash)] text-[0.625rem] font-bold text-brand-strong">
                  {firstName.slice(0, 1).toUpperCase()}
                </span>
                <span className="max-w-20 truncate">{firstName}</span>
                <ChevronDown className="h-3 w-3 text-ink-3" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-11 w-56 rounded-[var(--radius-panel)] border border-line bg-surface p-1.5 shadow-lg" role="menu">
                  <div className="border-b border-line px-2.5 py-2">
                    <p className="text-xs font-semibold text-ink">Yerel profil</p>
                    <p className="mt-0.5 text-[0.6875rem] text-ink-3">Veriler yalnızca bu cihazda</p>
                  </div>
                  <button
                    type="button"
                    onClick={exportResume}
                    className="mt-1 flex w-full items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-left text-xs text-ink-2 hover:bg-surface-2 hover:text-ink"
                    role="menuitem"
                  >
                    <FileDown className="h-3.5 w-3.5" /> PDF dışa aktar
                  </button>
                  <button
                    type="button"
                    onClick={clearProfile}
                    className="flex w-full items-center gap-2 rounded-[var(--radius-control)] px-2.5 py-2 text-left text-xs text-negative hover:bg-[var(--negative-wash)]"
                    role="menuitem"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Verileri temizle
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] text-ink md:hidden"
              aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <JourneyStepper className="hidden border-t border-line bg-background md:block" />

        {mobileOpen && (
          <nav className="border-t border-line bg-surface px-4 py-3 md:hidden" aria-label="Mobil menü">
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
                    <Icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-6 border-t border-line bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Hızlı menü">
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
              <span className="truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
