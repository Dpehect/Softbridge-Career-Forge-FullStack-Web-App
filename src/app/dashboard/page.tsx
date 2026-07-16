"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, CheckCircle2, Route } from "lucide-react";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { StatPill } from "@/components/StatPill";
import { useCareerStore } from "@/store/useCareerStore";
import { formatSalary } from "@/lib/utils";

export default function DashboardPage() {
  const {
    savedJobIds,
    appliedJobIds,
    enrolledPathIds,
    completedModuleIds,
    resume,
  } = useCareerStore();

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const appliedJobs = jobs.filter((j) => appliedJobIds.includes(j.id));
  const enrolledPaths = careerPaths.filter((p) => enrolledPathIds.includes(p.id));

  const totalModules = enrolledPaths.reduce((n, p) => n + p.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (n, p) => n + p.modules.filter((m) => completedModuleIds.includes(m.id)).length,
    0
  );
  const profileStrength = Math.min(
    100,
    20 +
      (resume.summary.length > 40 ? 15 : 0) +
      Math.min(resume.skills.length * 5, 25) +
      Math.min(resume.experience.length * 12, 30) +
      (appliedJobIds.length > 0 ? 10 : 0)
  );

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          Dashboard
        </Badge>
        <h1 className="font-display text-3xl md:text-4xl font-semibold">
          Welcome back, {resume.fullName.split(" ")[0]}
        </h1>
        <p className="text-muted-steel mt-2 mb-8 max-w-xl">
          Your forge board — applications, saved roles, and path progress in one place.
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <StatPill label="Applied" value={appliedJobIds.length} />
          <StatPill label="Saved" value={savedJobIds.length} />
          <StatPill label="Paths" value={enrolledPathIds.length} />
          <StatPill label="Modules done" value={`${doneModules}/${totalModules || 0}`} />
          <StatPill label="Profile" value={`${profileStrength}%`} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cosmic-teal" />
                Applications
              </h2>
              <Link href="/jobs" className="text-xs font-semibold text-cosmic-teal">
                Browse jobs
              </Link>
            </div>
            {appliedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">
                No applications yet. Open a role and hit Apply to track it here.
              </p>
            ) : (
              <ul className="space-y-3">
                {appliedJobs.map((job) => {
                  const company = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-panel-elevated/50 px-3 py-3 hover:border-cosmic-teal/25 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm">{job.title}</p>
                          <p className="text-xs text-muted-steel">
                            {company?.name} · {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                        </div>
                        <Badge variant="accent">Applied</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-cosmic-teal" />
                Saved roles
              </h2>
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">Bookmark roles from the job board to review later.</p>
            ) : (
              <ul className="space-y-3">
                {savedJobs.map((job) => {
                  const company = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-panel-elevated/50 px-3 py-3 hover:border-cosmic-teal/25 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm">{job.title}</p>
                          <p className="text-xs text-muted-steel">
                            {company?.name} · {job.workMode}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-steel" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass-panel rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Route className="w-4 h-4 text-cosmic-teal" />
                Enrolled paths
              </h2>
              <Link href="/paths" className="text-xs font-semibold text-cosmic-teal">
                Explore paths
              </Link>
            </div>
            {enrolledPaths.length === 0 ? (
              <p className="text-sm text-muted-steel">Enroll in a path to start tracking modules.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {enrolledPaths.map((path) => {
                  const done = path.modules.filter((m) =>
                    completedModuleIds.includes(m.id)
                  ).length;
                  const pct = Math.round((done / path.modules.length) * 100);
                  return (
                    <Link
                      key={path.id}
                      href={`/paths/${path.id}`}
                      className="rounded-2xl border border-black/5 bg-panel-elevated/50 p-4 hover:border-cosmic-teal/25 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-semibold">{path.title}</p>
                        <span className="text-xs font-mono text-cosmic-teal">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden mb-2">
                        <div
                          className="h-full bg-cosmic-teal rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-steel">
                        {done} of {path.modules.length} modules · {path.track}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
