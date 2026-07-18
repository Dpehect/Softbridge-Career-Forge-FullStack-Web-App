"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  FileSearch,
  FileText,
  MessageSquareText,
  MoonStar,
  Search,
  Target,
  UserRound,
} from "lucide-react";
import { useCareerStore } from "@/store/useCareerStore";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";

const OPEN_EVENT = "careerforge:open-command-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { locale } = useMessages();
  const theme = useCareerStore((state) => state.theme);
  const setTheme = useCareerStore((state) => state.setTheme);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const isTr = locale === "tr";

  const actions = useMemo(
    () => [
      {
        id: "upload",
        label: isTr ? "CV yükle ve analiz et" : "Upload and analyze resume",
        hint: isTr ? "CV Çalışma Alanı" : "Resume Workspace",
        keywords: "upload import resume cv analiz yükle belge ats",
        icon: FileSearch,
        run: () => router.push("/forge"),
      },
      {
        id: "resume",
        label: isTr ? "Son CV sürümünü düzenle" : "Edit latest resume version",
        hint: isTr ? "CV Çalışma Alanı" : "Resume Workspace",
        keywords: "resume cv edit experience deneyim version sürüm",
        icon: FileText,
        run: () => router.push("/resume"),
      },
      {
        id: "jobs",
        label: isTr ? "İş başvurularını aç" : "Open job applications",
        hint: isTr ? "İş Başvuru Hattı" : "Job Pipeline",
        keywords: "jobs applications pipeline match saved iş ilan başvuru eşleşme",
        icon: BriefcaseBusiness,
        run: () => router.push("/jobs"),
      },
      {
        id: "target",
        label: isTr ? "Hedef ilana göre eşleşmeyi incele" : "Review target-job alignment",
        hint: isTr ? "Kanıt ve eksik sinyaller" : "Evidence and missing signals",
        keywords: "matching role target skill missing hedef rol beceri eksik",
        icon: Target,
        run: () => router.push("/forge#target-role"),
      },
      {
        id: "interview",
        label: isTr ? "Mülakat pratiği başlat" : "Start interview practice",
        hint: isTr ? "Kariyer Asistanı" : "Career Assistant",
        keywords: "coach assistant interview practice mülakat koç asistan",
        icon: MessageSquareText,
        run: () => router.push("/coach"),
      },
      {
        id: "account",
        label: isTr ? "Hesap ve veri ayarlarını aç" : "Open account and data settings",
        hint: isTr ? "Hesap Merkezi" : "Account Center",
        keywords: "profile account data sync security profil hesap veri güvenlik",
        icon: UserRound,
        run: () => router.push("/account"),
      },
      {
        id: "theme",
        label: isTr ? "Temayı değiştir" : "Change theme",
        hint: theme === "dark" ? (isTr ? "Açık temaya geç" : "Switch to light") : (isTr ? "Koyu temaya geç" : "Switch to dark"),
        keywords: "theme dark light tema koyu açık",
        icon: MoonStar,
        run: () => setTheme(theme === "dark" ? "light" : "dark"),
      },
    ],
    [isTr, router, setTheme, theme]
  );

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US");
    if (!normalized) return actions;
    return actions.filter((action) => `${action.label} ${action.hint} ${action.keywords}`.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-US").includes(normalized));
  }, [actions, locale, query]);

  useEffect(() => {
    const show = () => {
      setQuery("");
      setActiveIndex(0);
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show();
      }
      if (event.key === "Escape") setOpen(false);
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const select = (index: number) => {
    const action = results[index];
    if (!action) return;
    setOpen(false);
    action.run();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-[2px]" onMouseDown={() => setOpen(false)}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="command-palette-title" className="sr-only">{isTr ? "Hızlı komutlar" : "Quick commands"}</h2>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-5 w-5 shrink-0 text-ink-3" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((value) => Math.min(results.length - 1, value + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((value) => Math.max(0, value - 1));
              }
              if (event.key === "Enter") {
                event.preventDefault();
                select(activeIndex);
              }
            }}
            placeholder={isTr ? "Ne yapmak istiyorsunuz?" : "What do you want to do?"}
            aria-label={isTr ? "Komut ara" : "Search commands"}
            aria-controls="command-results"
            aria-activedescendant={results[activeIndex] ? `command-${results[activeIndex].id}` : undefined}
            className="h-14 w-full bg-transparent text-base font-medium text-ink outline-none placeholder:text-ink-3"
          />
          <kbd className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[0.6875rem] text-ink-3">ESC</kbd>
        </div>

        <div id="command-results" role="listbox" className="max-h-[24rem] overflow-y-auto p-2">
          {results.length ? results.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                id={`command-${action.id}`}
                key={action.id}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(index)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
                  index === activeIndex ? "bg-[var(--accent-wash)] text-ink" : "text-ink-2 hover:bg-surface-2"
                )}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface">
                  <Icon className="h-4 w-4 text-brand-strong" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{action.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-ink-3">{action.hint}</span>
                </span>
              </button>
            );
          }) : (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-ink">{isTr ? "Eşleşen komut bulunamadı" : "No matching command"}</p>
              <p className="mt-1 text-xs text-ink-3">{isTr ? "CV, iş, mülakat veya hesap aramayı deneyin." : "Try resume, jobs, interview, or account."}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-2 text-[0.6875rem] text-ink-3">
          <span>{isTr ? "↑↓ gezin · Enter aç" : "↑↓ navigate · Enter open"}</span>
          <span>{isTr ? "CareerForge hızlı erişim" : "CareerForge quick access"}</span>
        </div>
      </section>
    </div>
  );
}
