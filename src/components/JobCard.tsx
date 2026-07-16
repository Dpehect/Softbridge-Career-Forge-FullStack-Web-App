"use client";

import Link from "next/link";
import { Bookmark, MapPin, Clock3, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { Job } from "@/types";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";

// ── Compute CV↔Job match score ─────────────────────────────────────────────
function computeMatchScore(userSkills: string[], jobTags: string[]): number {
  if (!userSkills.length || !jobTags.length) return 0;
  const normalized = userSkills.map((s) => s.toLowerCase().trim());
  const matched = jobTags.filter((tag) =>
    normalized.some((s) => s.includes(tag.toLowerCase()) || tag.toLowerCase().includes(s))
  );
  return Math.min(99, Math.round((matched.length / jobTags.length) * 100));
}

function MatchBadge({ score }: { score: number }) {
  if (score === 0) return null;
  const color =
    score >= 70 ? "#4ADE80" :
    score >= 40 ? "#F472B6" :
    "#9580B8";
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      <Zap className="w-2.5 h-2.5" />
      {score}% {score >= 70 ? "match" : "fit"}
    </div>
  );
}

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const company = getCompany(job.companyId);
  const { savedJobIds, appliedJobIds, toggleSaveJob, resume } = useCareerStore();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);
  const matchScore = computeMatchScore(resume.skills, job.tags);

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group glass-panel rounded-2xl p-5 transition-all hover:scale-[1.005]",
        job.featured && "ring-1 ring-cosmic-teal/20"
      )}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(124,58,237,0.12)";
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(124,58,237,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      <div className="flex items-start gap-4">
        {/* Company logo */}
        <div className="w-11 h-11 rounded-xl border border-border-color flex items-center justify-center font-bold text-xs text-cosmic-teal shrink-0"
          style={{ background: "rgba(124,58,237,0.08)" }}>
          {company?.logo ?? "??"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/jobs/${job.id}`}
                className="font-semibold text-base text-star-white hover:text-cosmic-teal transition-colors truncate block">
                {job.title}
              </Link>
              <p className="text-sm text-muted-steel mt-0.5">{company?.name} · {job.type}</p>
            </div>
            {/* Save button */}
            <button
              onClick={() => toggleSaveJob(job.id)}
              className={cn(
                "p-2 rounded-xl border transition-all cursor-pointer shrink-0 hover:scale-110",
                saved
                  ? "border-sunset-coral/30 text-sunset-coral"
                  : "border-border-color text-muted-steel hover:text-sunset-coral hover:border-sunset-coral/30"
              )}
              style={saved ? { background: "rgba(244,114,182,0.1)" } : {}}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-steel">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span>{job.workMode}</span>
            <span className="font-semibold text-star-white">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              {(job.type === "Contract" || job.seniority === "Intern") && (
                <span className="text-muted-steel font-normal">
                  {job.type === "Contract" ? " /hr" : " /mo"}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              {formatRelativeDate(job.postedAt)}
            </span>
            {matchScore > 0 && <MatchBadge score={matchScore} />}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.featured && <Badge variant="accent">Featured</Badge>}
            {applied && <Badge variant="solid">Applied</Badge>}
            <Badge>{job.seniority}</Badge>
            {job.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="soft">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
