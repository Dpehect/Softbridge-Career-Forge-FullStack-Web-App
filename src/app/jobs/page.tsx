"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { jobs } from "@/data/jobs";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Seniority, WorkMode } from "@/types";
import { useTranslation } from "@/lib/forge/i18n";

const workModes: Array<WorkMode | "All"> = ["All", "Remote", "Hybrid", "On-site"];
const seniorities: Array<Seniority | "All"> = [
  "All",
  "Intern",
  "Junior",
  "Mid",
  "Senior",
  "Lead",
  "Principal",
];

export default function JobsPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<(typeof workModes)[number]>("All");
  const [level, setLevel] = useState<(typeof seniorities)[number]>("All");
  const { t, lang } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cosmic-teal border-t-transparent animate-spin" />
      </div>
    );
  }

  const getModeLabel = (m: string) => {
    if (lang === "tr") {
      switch (m) {
        case "All": return "Hepsi";
        case "Remote": return "Uzaktan";
        case "Hybrid": return "Hibrit";
        case "On-site": return "Ofiste";
        default: return m;
      }
    }
    return m;
  };

  const getSeniorityLabel = (s: string) => {
    if (lang === "tr") {
      switch (s) {
        case "All": return "Hepsi";
        case "Intern": return "Stajyer";
        case "Junior": return "Başlangıç";
        case "Mid": return "Orta Seviye";
        case "Senior": return "Kıdemli";
        case "Lead": return "Lider";
        case "Principal": return "Baş Mühendis";
        default: return s;
      }
    }
    return s;
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs
      .filter((job) => {
        if (mode !== "All" && job.workMode !== mode) return false;
        if (level !== "All" && job.seniority !== level) return false;
        if (!q) return true;
        const hay = [job.title, job.location, job.tags.join(" "), job.description]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => +new Date(b.postedAt) - +new Date(a.postedAt));
  }, [query, mode, level]);

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Badge variant="accent" className="mb-3">
            {t("navJobs")}
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-star-white">
            {lang === "tr" ? "Pozisyonlar & İş Fırsatları" : "Find high-fit roles"}
          </h1>
          <p className="text-muted-steel mt-2 max-w-xl leading-relaxed">
            {t("jobBoardDesc")}
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 md:p-5 mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-steel" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-steel shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {lang === "tr" ? "Filtreler" : "Filters"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {workModes.map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    mode === m
                      ? "bg-star-white text-midnight-void border-transparent"
                      : "border-black/8 text-muted-steel hover:text-star-white"
                  }`}
                >
                  {getModeLabel(m)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 sm:ml-auto">
              {seniorities.map((s) => (
                <button
                  key={s}
                  onClick={() => setLevel(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    level === s
                      ? "bg-cosmic-teal/15 text-cosmic-teal border-cosmic-teal/25"
                      : "border-black/8 text-muted-steel hover:text-star-white"
                  }`}
                >
                  {getSeniorityLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-steel mb-4">
          {lang === "tr" 
            ? <>Arama kriterlerine uyan <span className="font-semibold text-star-white">{filtered.length}</span> ilan listeleniyor</>
            : <>Showing <span className="font-semibold text-star-white">{filtered.length}</span> roles</>
          }
        </p>

        <div className="grid gap-3">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="glass-panel rounded-2xl p-10 text-center text-muted-steel">
              {lang === "tr" ? "Filtrelere uygun iş ilanı bulunamadı. Aramanızı genişletmeyi deneyin." : "No roles match those filters. Try a broader search."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
