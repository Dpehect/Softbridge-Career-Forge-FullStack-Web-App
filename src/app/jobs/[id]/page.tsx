"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bookmark, Building2, CheckCircle2, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { getJob } from "@/data/jobs";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const job = getJob(id);
  if (!job) notFound();

  const company = getCompany(job.companyId);
  const { savedJobIds, appliedJobIds, toggleSaveJob, applyToJob } = useCareerStore();
  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-steel hover:text-cosmic-teal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-abyss-panel border border-black/5 flex items-center justify-center font-bold text-cosmic-teal shrink-0">
                {company?.logo}
              </div>
              <div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {job.featured && <Badge variant="accent">Featured</Badge>}
                  <Badge>{job.seniority}</Badge>
                  <Badge variant="soft">{job.type}</Badge>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-semibold">{job.title}</h1>
                <p className="text-muted-steel mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {company?.name}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location} · {job.workMode}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {job.applicants} applicants
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-lg font-semibold">
              {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
              <span className="text-sm font-normal text-muted-steel ml-1">
                {job.type === "Contract" ? "/hr" : job.seniority === "Intern" ? "/mo" : " / year"}
              </span>
            </p>
            <span className="text-sm text-muted-steel">Posted {formatRelativeDate(job.postedAt)}</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="accent"
              disabled={applied}
              onClick={() => {
                applyToJob(job.id);
                toast.success(applied ? "Already applied" : "Application saved to your dashboard");
              }}
            >
              {applied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Applied
                </>
              ) : (
                "Apply now"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                toggleSaveJob(job.id);
                toast.message(saved ? "Removed from saved" : "Saved to dashboard");
              }}
            >
              <Bookmark className={cn("w-4 h-4", saved && "fill-current text-cosmic-teal")} />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-6">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="soft">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="mt-10 space-y-8">
            <section>
              <h2 className="font-display font-semibold text-lg mb-3">About the role</h2>
              <p className="text-sm leading-relaxed text-ink-soft">{job.description}</p>
            </section>
            <section>
              <h2 className="font-display font-semibold text-lg mb-3">Responsibilities</h2>
              <ul className="space-y-2">
                {job.responsibilities.map((item) => (
                  <li key={item} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-cosmic-teal mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-display font-semibold text-lg mb-3">Requirements</h2>
              <ul className="space-y-2">
                {job.requirements.map((item) => (
                  <li key={item} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-cosmic-teal mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
            {company && (
              <section className="rounded-2xl bg-abyss-panel/70 border border-black/5 p-5">
                <h2 className="font-display font-semibold text-lg mb-2">About {company.name}</h2>
                <p className="text-sm text-ink-soft leading-relaxed mb-3">{company.description}</p>
                <p className="text-xs text-muted-steel mb-3">
                  {company.industry} · {company.size} · {company.location}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {company.culture.map((c) => (
                    <Badge key={c}>{c}</Badge>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
