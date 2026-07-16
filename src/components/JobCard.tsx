"use client";

import Link from "next/link";
import { Bookmark, MapPin, Clock3 } from "lucide-react";
import { motion } from "framer-motion";
import type { Job } from "@/types";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const company = getCompany(job.companyId);
  const { savedJobIds, appliedJobIds, toggleSaveJob } = useCareerStore();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      className={cn(
        "group glass-panel rounded-2xl p-5 hover:border-cosmic-teal/25 transition-colors relative",
        job.featured && "ring-1 ring-cosmic-teal/15"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-abyss-panel border border-black/5 flex items-center justify-center font-bold text-xs text-cosmic-teal shrink-0">
          {company?.logo ?? "??"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link
                href={`/jobs/${job.id}`}
                className="font-semibold text-base hover:text-cosmic-teal transition-colors"
              >
                {job.title}
              </Link>
              <p className="text-sm text-muted-steel mt-0.5">
                {company?.name} · {job.type}
              </p>
            </div>
            <button
              onClick={() => toggleSaveJob(job.id)}
              className={cn(
                "p-2 rounded-xl border border-black/5 transition-colors cursor-pointer",
                saved
                  ? "bg-cosmic-teal/10 text-cosmic-teal border-cosmic-teal/20"
                  : "text-muted-steel hover:text-cosmic-teal"
              )}
              aria-label={saved ? "Unsave job" : "Save job"}
            >
              <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-muted-steel">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span>{job.workMode}</span>
            <span className="font-medium text-star-white">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              {job.type === "Contract" || job.seniority === "Intern" ? (
                <span className="text-muted-steel font-normal">
                  {job.type === "Contract" ? " /hr" : " /mo"}
                </span>
              ) : null}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="w-3 h-3" />
              {formatRelativeDate(job.postedAt)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.featured && <Badge variant="accent">Featured</Badge>}
            {applied && <Badge variant="solid">Applied</Badge>}
            <Badge>{job.seniority}</Badge>
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="soft">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
