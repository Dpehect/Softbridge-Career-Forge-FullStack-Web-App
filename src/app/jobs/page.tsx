"use client";

import { useMemo, useState } from "react";
import { Bookmark, BriefcaseBusiness, Search, SlidersHorizontal } from "lucide-react";
import { JobCard, computeJobMatch } from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCareerStore } from "@/store/useCareerStore";
import type { JobType, Seniority, WorkMode } from "@/types";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { getLocalizedJobs } from "@/i18n/content";
import Link from "next/link";

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

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return localizedJobs
      .filter((job) => {
        if (mode !== "All" && job.workMode !== mode) return false;
        if (level !== "All" && job.seniority !== level) return false;
        if (type !== "All" && job.type !== type) return false;
        if (savedOnly && !savedJobIds.includes(job.id)) return false;
        if (!normalizedQuery) return true;
        return [job.title, job.location, job.description, ...job.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => computeJobMatch(resume.skills, b.tags) - computeJobMatch(resume.skills, a.tags));
  }, [query, mode, level, type, savedOnly, savedJobIds, resume.skills, localizedJobs]);

  const topMatch = filtered[0];
  const topFit = topMatch ? computeJobMatch(resume.skills, topMatch.tags) : 0;
  const skillCoverage = topMatch
    ? topMatch.tags.filter((tag) => resume.skills.some((skill) => skill.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill.toLowerCase())))
    : [];
  const missing = topMatch?.tags.filter((tag) => !skillCoverage.includes(tag)) ?? [];

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><BriefcaseBusiness className="h-3.5 w-3.5" /> {copy.kicker}</p>
          <h1 className="page-title-compact mt-4">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{copy.lede}</p>
        </div>
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
      </header>

      {!hasResume && (
        <section className="mt-6 grid gap-4 border border-info/25 bg-[var(--info-wash)] p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div><h2 className="text-sm font-semibold text-ink">{messages.empty.jobsTitle}</h2><p className="mt-1 text-xs leading-5 text-ink-2">{messages.empty.jobsBody}</p></div>
          <div className="flex flex-wrap gap-2"><Link href="/forge"><Button variant="primary">{messages.empty.upload}</Button></Link><Button variant="outline" onClick={loadDemoProfile}>{messages.demo.open}</Button></div>
        </section>
      )}

      <section className="mt-6 surface-panel p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(9rem,auto))]">
          <label className="relative">
            <span className="sr-only">{copy.searchLabel}</span>
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.search} className="pl-9" />
          </label>
          <label>
            <span className="sr-only">{copy.workMode}</span>
            <select value={mode} onChange={(event) => setMode(event.target.value as WorkMode | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {modes.map((item) => <option key={item} value={item}>{copy.work} · {labels[item]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{copy.seniority}</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as Seniority | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {levels.map((item) => <option key={item} value={item}>{copy.level} · {labels[item]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">{copy.type}</span>
            <select value={type} onChange={(event) => setType(event.target.value as JobType | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {types.map((item) => <option key={item} value={item}>{copy.contract} · {labels[item]}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="text-xs text-ink-3"><strong className="font-semibold text-ink">{filtered.length}</strong> {copy.resultSuffix}</p>
            <SlidersHorizontal className="h-4 w-4 text-ink-3" />
          </div>
          {filtered.length ? (
            <div>{filtered.map((job) => <JobCard key={job.id} job={job} />)}</div>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto h-5 w-5 text-ink-3" />
              <p className="mt-3 text-sm font-semibold text-ink">{copy.noResult}</p>
              <button type="button" onClick={() => { setQuery(""); setMode("All"); setLevel("All"); setType("All"); setSavedOnly(false); }} className="mt-2 min-h-11 text-xs font-semibold text-brand-strong hover:underline">{copy.clearFilters}</button>
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="surface-subtle p-6">
            <div className="flex items-center justify-between"><p className="section-label">{copy.strongest}</p><span className="text-[0.625rem] text-ink-3">{copy.sourceDemo}</span></div>
            {topMatch ? (
              <>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-ink">{topMatch.title}</h2>
                    <p className="mt-1 text-xs text-ink-3">{topMatch.location} · {topMatch.workMode}</p>
                  </div>
                  <strong className="metric-number text-3xl font-semibold text-brand-strong">{topFit}%</strong>
                </div>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="text-[0.6875rem] font-semibold text-positive">{copy.matched}</p>
                  <p className="mt-2 text-xs leading-5 text-ink-2">{skillCoverage.join(" · ") || copy.noSkills}</p>
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <p className="text-[0.6875rem] font-semibold text-caution">{copy.missing}</p>
                  <p className="mt-2 text-xs leading-5 text-ink-2">{missing.join(" · ") || copy.noCriticalGap}</p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-3">{copy.filterHint}</p>
            )}
          </div>
          <p className="mt-4 text-[0.6875rem] leading-5 text-ink-3">{copy.scoreNote}</p>
        </aside>
      </div>
    </main>
  );
}
