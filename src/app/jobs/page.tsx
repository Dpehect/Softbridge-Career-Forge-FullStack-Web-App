"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { jobs } from "@/data/jobs";
import { JobCard } from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Seniority, WorkMode } from "@/types";

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
            Job board
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Find high-fit roles</h1>
          <p className="text-muted-steel mt-2 max-w-xl">
            Search curated openings. Save roles and apply — progress is stored in your browser.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-4 md:p-5 mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-steel" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, skill, or location…"
              className="pl-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-steel shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
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
                  {m}
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
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-steel mb-4">
          Showing <span className="font-semibold text-star-white">{filtered.length}</span> roles
        </p>

        <div className="grid gap-3">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
          {filtered.length === 0 && (
            <div className="glass-panel rounded-2xl p-10 text-center text-muted-steel">
              No roles match those filters. Try a broader search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
