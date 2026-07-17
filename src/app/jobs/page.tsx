"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Briefcase, X, ChevronDown } from "lucide-react";
import { jobs } from "@/data/jobs";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import type { Seniority, WorkMode, JobType } from "@/types";
import { useTranslation } from "@/lib/forge/i18n";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

const workModes: Array<WorkMode | "All"> = ["All", "Remote", "Hybrid", "On-site"];
const seniorities: Array<Seniority | "All"> = ["All", "Intern", "Junior", "Mid", "Senior", "Lead", "Principal"];
const jobTypes: Array<JobType | "All"> = ["All", "Full-time", "Part-time", "Contract", "Internship"];

// ─── Filter chip ──────────────────────────────────────────────────────────────
function FilterChip({
  label, active, onClick, color = "#A855F7",
}: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button onClick={onClick} className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer"
      style={{
        background: active ? `${color}18` : "transparent",
        borderColor: active ? `${color}40` : "var(--border-color)",
        color: active ? color : "var(--text-muted)",
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
      }}>
      {label}
    </button>
  );
}

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<WorkMode | "All">("All");
  const [level, setLevel] = useState<Seniority | "All">("All");
  const [type, setType] = useState<JobType | "All">("All");
  const [showFilters, setShowFilters] = useState(false);
  const { lang } = useTranslation();
  const { savedJobIds } = useCareerStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const getModeLabel = (m: string) => {
    if (lang !== "tr") return m;
    const map: Record<string, string> = { All: "Hepsi", Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste" };
    return map[m] ?? m;
  };

  const getLevelLabel = (s: string) => {
    if (lang !== "tr") return s;
    const map: Record<string, string> = { All: "Hepsi", Intern: "Stajyer", Junior: "Junior", Mid: "Orta", Senior: "Kıdemli", Lead: "Lider", Principal: "Baş Müh." };
    return map[s] ?? s;
  };

  const activeFiltersCount = [mode !== "All", level !== "All", type !== "All"].filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((job) => {
        if (mode !== "All" && job.workMode !== mode) return false;
        if (level !== "All" && job.seniority !== level) return false;
        if (type !== "All" && job.type !== type) return false;
        if (!q) return true;
        return [job.title, job.location, job.tags.join(" "), job.description].join(" ").toLowerCase().includes(q);
      })
      .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  }, [query, mode, level, type]);

  const clearAll = () => { setMode("All"); setLevel("All"); setType("All"); setQuery(""); };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#A855F7", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const isTR = lang === "tr";

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: "rgba(168,85,247,0.12)", color: "#A855F7" }}>
            <Briefcase className="w-3.5 h-3.5" />
            {isTR ? "İş İlanları" : "Job Board"}
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-star-white">
            {isTR ? "Sana Uygun Pozisyonları Keşfet 🎯" : "Find high-fit roles 🎯"}
          </h1>
          <p className="text-muted-steel mt-2 text-sm leading-relaxed max-w-xl">
            {isTR
              ? "CV'ni yüklediysen her ilan için uyum puanı görürsün. İlanları kaydet, başvurularını takip et."
              : "Upload your CV to see match scores per role. Save listings and track your applications."}
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-steel" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={isTR ? "Rol, şehir veya teknoloji ara…" : "Search role, city or technology…"}
                className="pl-10 text-star-white" />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="h-10 px-4 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer"
              style={{
                borderColor: showFilters || activeFiltersCount > 0 ? "rgba(168,85,247,0.4)" : "var(--border-color)",
                background: showFilters || activeFiltersCount > 0 ? "rgba(168,85,247,0.1)" : "transparent",
                color: showFilters || activeFiltersCount > 0 ? "#A855F7" : "var(--text-muted)",
              }}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isTR ? "Filtreler" : "Filters"}
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                  style={{ background: "#A855F7" }}>{activeFiltersCount}</span>
              )}
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearAll}
                className="h-10 px-3 rounded-xl border border-border-color flex items-center gap-1.5 text-xs text-muted-steel hover:text-star-white transition-all cursor-pointer">
                <X className="w-3.5 h-3.5" /> {isTR ? "Temizle" : "Clear"}
              </button>
            )}
          </div>

          {/* Expandable filters */}
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              className="space-y-3 pt-3 border-t border-border-color overflow-hidden">
              {/* Work mode */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-steel w-16 shrink-0">
                  {isTR ? "Lokasyon" : "Location"}
                </span>
                {workModes.map((m) => (
                  <FilterChip key={m} label={getModeLabel(m)} active={mode === m}
                    onClick={() => setMode(m)} color="#A855F7" />
                ))}
              </div>
              {/* Level */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-steel w-16 shrink-0">
                  {isTR ? "Kıdem" : "Level"}
                </span>
                {seniorities.map((s) => (
                  <FilterChip key={s} label={getLevelLabel(s)} active={level === s}
                    onClick={() => setLevel(s)} color="#F97316" />
                ))}
              </div>
              {/* Type */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-steel w-16 shrink-0">
                  {isTR ? "Tür" : "Type"}
                </span>
                {jobTypes.map((t) => (
                  <FilterChip key={t} label={t === "All" ? (isTR ? "Hepsi" : "All") : t} active={type === t}
                    onClick={() => setType(t)} color="#4ADE80" />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Results count + saved indicator */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-steel">
            {isTR ? (
              <><span className="font-bold text-star-white">{filtered.length}</span> ilan listeleniyor</>
            ) : (
              <>Showing <span className="font-bold text-star-white">{filtered.length}</span> roles</>
            )}
          </p>
          {savedJobIds.length > 0 && (
            <p className="text-xs text-muted-steel">
              <span className="font-bold" style={{ color: "#F97316" }}>{savedJobIds.length}</span>{" "}
              {isTR ? "ilanı kaydettin" : "saved"}
            </p>
          )}
        </div>

        {/* Job list */}
        <div className="grid gap-3">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
              <Briefcase className="w-10 h-10 mx-auto" style={{ color: "rgba(168,85,247,0.3)" }} />
              <p className="text-muted-steel">
                {isTR
                  ? "Bu filtrelere uygun ilan bulunamadı. Aramayı genişletmeyi dene."
                  : "No roles match those filters. Try broadening your search."}
              </p>
              <button onClick={clearAll} className="text-xs font-semibold underline cursor-pointer" style={{ color: "#A855F7" }}>
                {isTR ? "Tüm filtreleri temizle" : "Clear all filters"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
