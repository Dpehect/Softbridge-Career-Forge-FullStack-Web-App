"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark, BriefcaseBusiness, Search, BarChart3 } from "lucide-react";
import { JobCard, computeJobMatch } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCareerStore } from "@/store/useCareerStore";
import type { JobType, Seniority, WorkMode } from "@/types";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { getLocalizedCompany, getLocalizedJobs } from "@/i18n/content";
import { AnimatedNumber } from "@/motion/AnimatedNumber";
import { NextStepCta } from "@/components/NextStepCta";
import Link from "next/link";
import { toast } from "sonner";

const modes: Array<WorkMode | "All"> = ["All", "Remote", "Hybrid", "On-site"];
const levels: Array<Seniority | "All"> = ["All", "Intern", "Junior", "Mid", "Senior", "Lead", "Principal"];
const types: Array<JobType | "All"> = ["All", "Full-time", "Part-time", "Contract", "Internship"];

export default function JobsPage() {
  const mounted = useHydrated();
  const { locale, messages, page } = useMessages();
  const copy = page.jobs;
  const localizedJobs = useMemo(() => getLocalizedJobs(locale), [locale]);
  const labels: Record<string, string> = locale === "tr" ? {
    All: "Tümü", Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste", Intern: "Stajyer", Junior: "Başlangıç", Mid: "Orta", Senior: "Kıdemli", Lead: "Lider", Principal: "Uzman", "Full-time": "Tam zamanlı", "Part-time": "Yarı zamanlı", Contract: "Sözleşmeli", Internship: "Staj",
  } : {
    All: "All", Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site", Intern: "Intern", Junior: "Junior", Mid: "Mid", Senior: "Senior", Lead: "Lead", Principal: "Principal", "Full-time": "Full-time", "Part-time": "Part-time", Contract: "Contract", Internship: "Internship",
  };
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [level, setLevel] = useState<Seniority | "All">("All");
  const [type, setType] = useState<JobType | "All">("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const { resume, savedJobIds, loadDemoProfile } = useCareerStore();
  const hasResume = Boolean(resume.fullName || resume.skills.length || resume.experience.length);

  interface SavedFilter {
    id: string;
    label: string;
    query: string;
    mode: WorkMode | "All";
    level: Seniority | "All";
    type: JobType | "All";
    savedOnly: boolean;
  }

  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem("cf_saved_search_filters");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveCurrentFilter = () => {
    const label = prompt(
      locale === "tr"
        ? "Bu arama filtresi için bir isim girin:"
        : "Enter a name for this search filter:"
    );
    if (!label?.trim()) return;
    const newFilter: SavedFilter = {
      id: crypto.randomUUID(),
      label: label.trim(),
      query,
      mode,
      level,
      type,
      savedOnly,
    };
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("cf_saved_search_filters", JSON.stringify(updated));
    toast.success(locale === "tr" ? "Arama filtresi kaydedildi." : "Search filter saved.");
  };

  const deleteFilter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("cf_saved_search_filters", JSON.stringify(updated));
    toast.success(locale === "tr" ? "Filtre silindi." : "Filter deleted.");
  };

  const applyFilter = (filter: SavedFilter) => {
    setQuery(filter.query);
    setMode(filter.mode);
    setLevel(filter.level);
    setType(filter.type);
    setSavedOnly(filter.savedOnly);
    toast.success(
      locale === "tr"
        ? `"${filter.label}" filtresi uygulandı.`
        : `Applied filter "${filter.label}".`
    );
  };

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return localizedJobs
      .filter((job) => {
        if (mode !== "All" && job.workMode !== mode) return false;
        if (level !== "All" && job.seniority !== level) return false;
        if (type !== "All" && job.type !== type) return false;
        if (savedOnly && !savedJobIds.includes(job.id)) return false;
        if (!normalizedQuery) return true;
        const company = getLocalizedCompany(job.companyId, locale);
        const companyName = company?.name || "";
        return [job.title, job.location, job.description, companyName, ...job.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => computeJobMatch(resume.skills, b.tags) - computeJobMatch(resume.skills, a.tags));
  }, [query, mode, level, type, savedOnly, savedJobIds, resume.skills, localizedJobs, locale]);

  const topMatch = filtered[0];
  const topFit = topMatch ? computeJobMatch(resume.skills, topMatch.tags) : 0;
  const skillCoverage = topMatch
    ? topMatch.tags.filter((tag) => resume.skills.some((skill) => skill.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill.toLowerCase())))
    : [];
  const missing = topMatch?.tags.filter((tag) => !skillCoverage.includes(tag)) ?? [];

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="mt-6 space-y-6">
          <div className="h-28 w-full rounded-2xl border border-line skeleton-shimmer" />
          <div className="grid gap-6 lg:grid-cols-[1fr_minmax(18rem,0.45fr)]">
            <div className="space-y-4">
              <div className="h-28 rounded-2xl border border-line skeleton-shimmer" />
              <div className="h-28 rounded-2xl border border-line skeleton-shimmer" />
              <div className="h-28 rounded-2xl border border-line skeleton-shimmer" />
            </div>
            <div className="h-80 rounded-2xl border border-line skeleton-shimmer" />
          </div>
        </div>
      );
    }

    return (
      <>
        {!hasResume && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid gap-4 border border-line border-l-[3px] border-l-brand bg-surface-2 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <h2 className="text-sm font-bold text-ink">{messages.empty.jobsTitle}</h2>
              <p className="mt-1 text-xs leading-5 text-ink-2">{messages.empty.jobsBody}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/forge"><Button variant="primary">{messages.empty.upload}</Button></Link>
              <Button variant="outline" onClick={loadDemoProfile}>{messages.demo.open}</Button>
            </div>
          </motion.section>
        )}

        <section className="premium-card mt-6 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(9rem,auto))]">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-ink-2">{copy.searchLabel}</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-ink-3" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                  className="rounded-xl pl-9"
                />
              </span>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-ink-2">{copy.workMode}</span>
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value as WorkMode | "All")}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]"
              >
                {modes.map((item) => (
                  <option key={item} value={item}>{copy.work} · {labels[item]}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-ink-2">{copy.seniority}</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as Seniority | "All")}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]"
              >
                {levels.map((item) => (
                  <option key={item} value={item}>{copy.level} · {labels[item]}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-ink-2">{copy.type}</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as JobType | "All")}
                className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]"
              >
                {types.map((item) => (
                  <option key={item} value={item}>{copy.contract} · {labels[item]}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Quick mode chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-3">
              {locale === "tr" ? "Hızlı filtre" : "Quick filter"}
            </span>
            {modes.map((item) => (
              <button
                key={item}
                type="button"
                data-active={mode === item}
                aria-pressed={mode === item}
                className="filter-chip"
                onClick={() => setMode(item)}
              >
                {labels[item]}
              </button>
            ))}
          </div>

          {savedFilters.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
              <span className="mr-1 text-xs font-semibold uppercase text-ink-3">
                {locale === "tr" ? "Kayıtlı Aramalar:" : "Saved Searches:"}
              </span>
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink"
                >
                  <button
                    type="button"
                    onClick={() => applyFilter(filter)}
                    className="transition-colors hover:text-brand-strong"
                  >
                    {filter.label}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => deleteFilter(e, filter.id)}
                    className="ml-1 font-bold text-ink-3 hover:text-negative"
                    aria-label="Delete filter"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-ink-3">
              <span className="font-bold text-ink">{filtered.length}</span>{" "}
              {locale === "tr" ? "ilan" : "listings"}
            </p>
            <button
              type="button"
              onClick={saveCurrentFilter}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-brand-strong hover:bg-surface-2 hover:underline"
            >
              + {locale === "tr" ? "Filtreyi kaydet" : "Save filter"}
            </button>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_minmax(18rem,0.45fr)]">
          <section aria-label={copy.title} className="space-y-3">
            {filtered.length ? (
              filtered.map((job, index) => <JobCard key={job.id} job={job} index={index} />)
            ) : (
              <div className="rounded-2xl border border-dashed border-line py-16 text-center">
                <Search className="mx-auto h-6 w-6 text-ink-3" />
                <p className="mt-3 text-sm font-semibold text-ink">{copy.noResult}</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setMode("All");
                    setLevel("All");
                    setType("All");
                    setSavedOnly(false);
                  }}
                  className="mt-2 min-h-11 text-xs font-semibold text-brand-strong hover:underline"
                >
                  {copy.clearFilters}
                </button>
              </div>
            )}
          </section>

          <aside className="xl:sticky xl:top-32 xl:self-start">
            <div className="premium-card overflow-hidden p-0">
              <div className="border-b border-line bg-surface-2 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="section-label">{copy.strongest}</p>
                  <BarChart3 className="h-4 w-4 text-caution" />
                </div>
              </div>
              <div className="p-6 pt-4">
                {topMatch ? (
                  <>
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-base font-bold text-ink">{topMatch.title}</h2>
                        <p className="mt-1 text-xs text-ink-3">
                          {topMatch.location} · {topMatch.workMode}
                        </p>
                      </div>
                      <strong className="metric-number text-3xl font-bold text-brand-strong">
                        <AnimatedNumber value={topFit} suffix="%" />
                      </strong>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-3">
                      <motion.div
                        className="h-full rounded-full progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${topFit}%` }}
                        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="mt-6 border-t border-line pt-5">
                      <p className="text-[0.6875rem] font-bold text-positive">{copy.matched}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(skillCoverage.length ? skillCoverage : [copy.noSkills]).map((tag) => (
                          <span
                            key={tag}
                            className="min-h-6 rounded-full bg-[var(--positive-wash)] px-2.5 py-1 text-xs font-semibold text-positive"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 border-t border-line pt-5">
                      <p className="text-[0.6875rem] font-bold text-caution">{copy.missing}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(missing.length ? missing : [copy.noCriticalGap]).map((tag) => (
                          <span
                            key={tag}
                            className="min-h-6 rounded-full bg-[var(--caution-wash)] px-2.5 py-1 text-xs font-semibold text-caution"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/jobs/${topMatch.id}`} className="mt-5 inline-flex">
                      <Button variant="primary" size="sm">
                        {locale === "tr" ? "İlanı aç" : "Open role"}
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-ink-3">{copy.filterHint}</p>
                )}
              </div>
            </div>
            <p className="mt-4 text-[0.6875rem] leading-5 text-ink-3">{copy.scoreNote}</p>
          </aside>
        </div>
      </>
    );
  };

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><BriefcaseBusiness className="h-3.5 w-3.5" /> {copy?.kicker || "İşler"}</p>
          <h1 className="page-title-compact mt-4">{copy?.title || "İş Fırsatları"}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy?.lede}</p>
        </div>
        {mounted && (
          <button
            type="button"
            onClick={() => setSavedOnly((value) => !value)}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border px-3 text-xs font-semibold transition-colors",
              savedOnly ? "border-signal/30 bg-[var(--signal-wash)] text-signal" : "border-line bg-surface text-ink-2 hover:bg-surface-2"
            )}
          >
            <Bookmark className={cn("h-3.5 w-3.5", savedOnly && "fill-current")} /> {copy.saved} {savedJobIds.length ? `(${savedJobIds.length})` : ""}
          </button>
        )}
      </header>
      {renderContent()}
      {mounted ? (
        <NextStepCta
          title={
            locale === "tr"
              ? "Bir ilan seçtin mi? CV’ni o role göre güçlendir."
              : "Picked a role? Tailor your resume next."
          }
          body={
            locale === "tr"
              ? "Eksik becerileri özgeçmişe ekle, sonra mülakat koçunda prova yap."
              : "Add missing skills to your resume, then rehearse with the coach."
          }
          href="/resume"
          actionLabel={locale === "tr" ? "CV’yi düzenle" : "Edit resume"}
          secondaryHref="/coach"
          secondaryLabel={locale === "tr" ? "Mülakat koçu" : "Interview coach"}
        />
      ) : null}
    </main>
  );
}
