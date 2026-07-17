"use client";

import { useMemo, useState } from "react";
import { Bookmark, BriefcaseBusiness, Search, SlidersHorizontal } from "lucide-react";
import { jobs } from "@/data/jobs";
import { JobCard, computeJobMatch } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { useCareerStore } from "@/store/useCareerStore";
import type { JobType, Seniority, WorkMode } from "@/types";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

const modes: Array<WorkMode | "All"> = ["All", "Remote", "Hybrid", "On-site"];
const levels: Array<Seniority | "All"> = ["All", "Intern", "Junior", "Mid", "Senior", "Lead", "Principal"];
const types: Array<JobType | "All"> = ["All", "Full-time", "Part-time", "Contract", "Internship"];

const labels: Record<string, string> = {
  All: "Tümü",
  Remote: "Uzaktan",
  Hybrid: "Hibrit",
  "On-site": "Ofiste",
  Intern: "Stajyer",
  Junior: "Junior",
  Mid: "Orta",
  Senior: "Kıdemli",
  Lead: "Lider",
  Principal: "Principal",
  "Full-time": "Tam zamanlı",
  "Part-time": "Yarı zamanlı",
  Contract: "Sözleşmeli",
  Internship: "Staj",
};

export default function JobsPage() {
  const mounted = useHydrated();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [level, setLevel] = useState<Seniority | "All">("All");
  const [type, setType] = useState<JobType | "All">("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const { resume, savedJobIds } = useCareerStore();

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return jobs
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
  }, [query, mode, level, type, savedOnly, savedJobIds, resume.skills]);

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
          <p className="page-kicker"><BriefcaseBusiness className="h-3.5 w-3.5" /> Fırsat radarı</p>
          <h1 className="page-title-compact mt-4">İlanları değil, uyumu tarayın.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">Roller özgeçmişinizdeki gerçek becerilere göre sıralanır. Puan, eksik kanıtları saklamaz.</p>
        </div>
        <button
          type="button"
          onClick={() => setSavedOnly((value) => !value)}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] border px-3 text-xs font-semibold transition-colors",
            savedOnly ? "border-signal/30 bg-[var(--signal-wash)] text-signal" : "border-line bg-surface text-ink-2 hover:bg-surface-2"
          )}
        >
          <Bookmark className={cn("h-3.5 w-3.5", savedOnly && "fill-current")} /> Kaydedilenler {savedJobIds.length ? `(${savedJobIds.length})` : ""}
        </button>
      </header>

      <section className="mt-6 surface-panel p-3">
        <div className="grid gap-2 lg:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(9rem,auto))]">
          <label className="relative">
            <span className="sr-only">İşlerde ara</span>
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-3" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rol, beceri veya şehir" className="pl-9" />
          </label>
          <label>
            <span className="sr-only">Çalışma modeli</span>
            <select value={mode} onChange={(event) => setMode(event.target.value as WorkMode | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {modes.map((item) => <option key={item} value={item}>Çalışma · {labels[item]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Kıdem</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as Seniority | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {levels.map((item) => <option key={item} value={item}>Kıdem · {labels[item]}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sözleşme tipi</span>
            <select value={type} onChange={(event) => setType(event.target.value as JobType | "All")} className="h-10 w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]">
              {types.map((item) => <option key={item} value={item}>Tür · {labels[item]}</option>)}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-8 grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <section>
          <div className="flex items-center justify-between border-b border-line pb-3">
            <p className="text-xs text-ink-3"><strong className="font-semibold text-ink">{filtered.length}</strong> rol · özgeçmiş uyumuna göre</p>
            <SlidersHorizontal className="h-4 w-4 text-ink-3" />
          </div>
          {filtered.length ? (
            <div>{filtered.map((job) => <JobCard key={job.id} job={job} />)}</div>
          ) : (
            <div className="py-16 text-center">
              <Search className="mx-auto h-5 w-5 text-ink-3" />
              <p className="mt-3 text-sm font-semibold text-ink">Bu filtrelerde rol yok.</p>
              <button type="button" onClick={() => { setQuery(""); setMode("All"); setLevel("All"); setType("All"); setSavedOnly(false); }} className="mt-2 text-xs font-semibold text-brand-strong hover:underline">Filtreleri temizle</button>
            </div>
          )}
        </section>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="surface-subtle p-6">
            <p className="section-label">En güçlü eşleşme</p>
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
                  <p className="text-[0.6875rem] font-semibold text-positive">Eşleşen kanıtlar</p>
                  <p className="mt-2 text-xs leading-5 text-ink-2">{skillCoverage.join(" · ") || "Özgeçmiş becerisi eklenmedi"}</p>
                </div>
                <div className="mt-5 border-t border-line pt-5">
                  <p className="text-[0.6875rem] font-semibold text-caution">Eksik sinyaller</p>
                  <p className="mt-2 text-xs leading-5 text-ink-2">{missing.join(" · ") || "Kritik eksik görünmüyor"}</p>
                </div>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-3">Filtreleri değiştirerek eşleşme özeti oluşturun.</p>
            )}
          </div>
          <p className="mt-4 text-[0.6875rem] leading-5 text-ink-3">Uyum puanı yalnızca özgeçmişinizde listelenen ve ilanda geçen becerileri karşılaştırır. Deneyim kanıtı ayrıca değerlendirilmelidir.</p>
        </aside>
      </div>
    </main>
  );
}
