"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark, MapPin, Sparkles } from "lucide-react";
import type { Job } from "@/types";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { getLocalizedCompany } from "@/i18n/content";
import { useMessages } from "@/i18n/useMessages";
import { useReducedMotionPreference } from "@/motion/useReducedMotionPreference";

export function computeJobMatch(userSkills: string[], jobTags: string[]): number {
  if (!userSkills.length || !jobTags.length) return 0;
  const normalized = userSkills.map((skill) => skill.toLowerCase().trim());
  const matched = jobTags.filter((tag) =>
    normalized.some((skill) => skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill))
  );
  return Math.min(99, Math.round((matched.length / jobTags.length) * 100));
}

export function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  const { locale } = useMessages();
  const company = getLocalizedCompany(job.companyId, locale);
  const { resume, savedJobIds, appliedJobIds, jobStages, toggleSaveJob } = useCareerStore();
  const prefersReduced = useReducedMotionPreference();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);
  const match = computeJobMatch(resume.skills, job.tags);
  const stage = jobStages?.[job.id] || "applied";
  const stageLabels: Record<string, string> = locale === "tr" ? {
    saved: "Kaydedildi",
    preparing: "Hazırlanıyor",
    applied: "Başvuruldu",
    screening: "İK Görüşmesi",
    interview: "Mülakat",
    technical: "Teknik Değerlendirme",
    final: "Final Mülakatı",
    offer: "Teklif",
    rejected: "Reddedildi",
    withdrawn: "Geri Çekildi",
  } : {
    saved: "Saved",
    preparing: "Preparing",
    applied: "Applied",
    screening: "Recruiter screening",
    interview: "Interview",
    technical: "Technical assessment",
    final: "Final interview",
    offer: "Offer",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  const stageLabel = stageLabels[stage] || stageLabels.applied;

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

  const matchTone =
    match >= 80
      ? "border-positive/30 bg-[var(--positive-wash)] text-positive"
      : match >= 60
        ? "border-brand/30 bg-[var(--accent-wash)] text-brand-strong"
        : match >= 40
          ? "border-caution/30 bg-[var(--caution-wash)] text-caution"
          : "border-line bg-surface-2 text-ink-2";

  return (
    <motion.article
      initial={prefersReduced ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24) }}
      whileHover={
        prefersReduced
          ? undefined
          : { y: -4, transition: { type: "spring", stiffness: 360, damping: 22 } }
      }
      className="premium-card group relative grid gap-4 p-4 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto] sm:items-start sm:p-5"
    >
      <div className="grid h-12 w-12 place-items-center border border-line bg-surface-2 font-mono text-xs font-bold text-ink-2">
        {company?.logo || "CF"}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={`/jobs/${job.id}`}
            className="text-base font-bold leading-6 text-ink before:absolute before:inset-0 hover:text-brand-strong"
          >
            {job.title}
          </Link>
          {job.isDemo && (
            <span className="min-h-6 rounded-full border border-line bg-surface-3 px-2.5 py-1 text-xs font-mono uppercase text-ink-3">
              {locale === "tr" ? "Demo" : "Demo"}
            </span>
          )}
          {job.featured && (
            <span className="inline-flex min-h-6 items-center gap-1 border border-caution/30 bg-[var(--caution-wash)] px-2.5 py-1 text-xs font-bold text-caution">
              <Sparkles className="h-3 w-3" />
              {copy.featured}
            </span>
          )}
          {applied && (
            <span
              className={cn(
                "min-h-6 rounded-full px-2.5 py-1 text-xs font-semibold",
                stage === "rejected"
                  ? "bg-[var(--negative-wash)] text-negative"
                  : stage === "offer"
                    ? "bg-[var(--positive-wash)] text-positive"
                    : "bg-[var(--accent-wash)] text-brand-strong"
              )}
            >
              {stageLabel}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-medium text-ink-3">
          {company?.name} · {copy.type[job.type]}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-5 text-ink-3">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {job.location}
          </span>
          <span>{copy.mode[job.workMode]}</span>
          <span>{copy.seniority[job.seniority]}</span>
          <span>{formatRelativeDate(job.postedAt, locale)}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="min-h-6 rounded-full border border-line bg-surface-2/60 px-2.5 py-1 text-xs font-semibold text-ink-2 transition-colors group-hover:border-sky-200 group-hover:bg-sky-50/50 dark:group-hover:border-sky-500/30 dark:group-hover:bg-sky-500/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-start justify-between gap-4 sm:flex-col sm:items-end">
        <div className="text-left sm:text-right">
          <div
            className={cn(
              "inline-flex items-center justify-center border px-2.5 py-1.5",
              matchTone
            )}
          >
            <p className="metric-number text-lg font-extrabold leading-none">
              {match || "—"}
              {match ? "%" : ""}
            </p>
          </div>
          <p className="mt-1.5 text-xs font-semibold text-ink-3">{copy.match}</p>
          <p className="mt-2 whitespace-nowrap text-xs font-semibold text-ink-2">
            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleSaveJob(job.id)}
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl border transition-all",
            saved
              ? "border-signal/30 bg-[var(--signal-wash)] text-signal shadow-sm scale-105"
              : "border-line bg-surface text-ink-3 hover:border-line-strong hover:text-ink hover:scale-105"
          )}
          aria-label={saved ? copy.remove : copy.save}
          title={saved ? copy.savedTitle : copy.saveTitle}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </button>
      </div>
    </motion.article>
  );
}
