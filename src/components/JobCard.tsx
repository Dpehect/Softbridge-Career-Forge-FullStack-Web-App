"use client";

import Link from "next/link";
import { Bookmark, MapPin } from "lucide-react";
import type { Job } from "@/types";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { getLocalizedCompany } from "@/i18n/content";
import { useMessages } from "@/i18n/useMessages";

export function computeJobMatch(userSkills: string[], jobTags: string[]): number {
  if (!userSkills.length || !jobTags.length) return 0;
  const normalized = userSkills.map((skill) => skill.toLowerCase().trim());
  const matched = jobTags.filter((tag) =>
    normalized.some((skill) => skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill))
  );
  return Math.min(99, Math.round((matched.length / jobTags.length) * 100));
}

export function JobCard({ job }: { job: Job; index?: number }) {
  const { locale } = useMessages();
  const company = getLocalizedCompany(job.companyId, locale);
  const { resume, savedJobIds, appliedJobIds, toggleSaveJob } = useCareerStore();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);
  const match = computeJobMatch(resume.skills, job.tags);
  const copy = locale === "tr" ? {
    featured: "Öne çıkan",
    applied: "Başvuruldu",
    match: "rol uyumu",
    save: "İlanı kaydet",
    remove: "İlanı kaydedilenlerden çıkar",
    savedTitle: "Kaydı kaldır",
    saveTitle: "Kaydet",
    mode: { Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste" },
    type: { "Full-time": "Tam zamanlı", "Part-time": "Yarı zamanlı", Contract: "Sözleşmeli", Internship: "Staj" },
    seniority: { Intern: "Stajyer", Junior: "Başlangıç", Mid: "Orta", Senior: "Kıdemli", Lead: "Lider", Principal: "Uzman" },
  } : {
    featured: "Featured",
    applied: "Applied",
    match: "role match",
    save: "Save listing",
    remove: "Remove saved listing",
    savedTitle: "Remove bookmark",
    saveTitle: "Save",
    mode: { Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" },
    type: { "Full-time": "Full-time", "Part-time": "Part-time", Contract: "Contract", Internship: "Internship" },
    seniority: { Intern: "Intern", Junior: "Junior", Mid: "Mid", Senior: "Senior", Lead: "Lead", Principal: "Principal" },
  };

  return (
    <article className="interactive-row group relative grid gap-4 border-b border-line px-1 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_auto] sm:items-start sm:px-3">
      <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-control)] border border-line bg-surface-2 text-xs font-bold text-ink-2">
        {company?.logo || "CF"}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={`/jobs/${job.id}`} className="font-semibold text-ink before:absolute before:inset-0">
            {job.title}
          </Link>
          {job.featured && <span className="rounded-full bg-[var(--accent-wash)] px-2 py-0.5 text-[0.625rem] font-semibold text-brand-strong">{copy.featured}</span>}
          {applied && <span className="rounded-full bg-[var(--positive-wash)] px-2 py-0.5 text-[0.625rem] font-semibold text-positive">{copy.applied}</span>}
        </div>
        <p className="mt-1 text-xs text-ink-3">{company?.name} · {copy.type[job.type]}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-3">
          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
          <span>{copy.mode[job.workMode]}</span>
          <span>{copy.seniority[job.seniority]}</span>
          <span>{formatRelativeDate(job.postedAt, locale)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[0.625rem] text-ink-2">{tag}</span>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-5 sm:justify-end">
        <div className="text-left sm:text-right">
          <p className={cn("metric-number text-lg font-semibold", match >= 70 ? "text-brand-strong" : "text-ink")}>{match || "—"}{match ? "%" : ""}</p>
          <p className="mt-0.5 text-[0.625rem] text-ink-3">{copy.match}</p>
          <p className="mt-2 whitespace-nowrap text-[0.6875rem] font-medium text-ink-2">{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleSaveJob(job.id)}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-[var(--radius-control)] border transition-colors",
            saved ? "border-signal/30 bg-[var(--signal-wash)] text-signal" : "border-line bg-surface text-ink-3 hover:border-line-strong hover:text-ink"
          )}
          aria-label={saved ? copy.remove : copy.save}
          title={saved ? copy.savedTitle : copy.saveTitle}
        >
          <Bookmark className={cn("h-3.5 w-3.5", saved && "fill-current")} />
        </button>
      </div>
    </article>
  );
}
