"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  FileText,
  History,
  Sparkles,
  Briefcase,
  Anvil,
} from "lucide-react";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatPill } from "@/components/StatPill";
import { useCareerStore } from "@/store/useCareerStore";
import { formatSalary } from "@/lib/utils";
import { generateCvFeedback } from "@/lib/forge";
import { useTranslation } from "@/lib/forge/i18n";

export default function DashboardPage() {
  const {
    savedJobIds,
    appliedJobIds,
    enrolledPathIds,
    completedModuleIds,
    resume,
    forgeParsedCv,
    forgeHistory,
    forgeBackups,
  } = useCareerStore();

  const { t, lang } = useTranslation();

  const savedJobs = jobs.filter((j) => savedJobIds.includes(j.id));
  const appliedJobs = jobs.filter((j) => appliedJobIds.includes(j.id));
  const enrolledPaths = careerPaths.filter((p) => enrolledPathIds.includes(p.id));
  const totalModules = enrolledPaths.reduce((n, p) => n + p.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (n, p) => n + p.modules.filter((m) => completedModuleIds.includes(m.id)).length,
    0
  );

  const hasResume =
    Boolean(resume.fullName || resume.headline || resume.summary) || resume.skills.length > 0;
  const firstName = resume.fullName?.trim().split(" ")[0] || forgeParsedCv?.name?.split(" ")[0];

  const feedback = forgeParsedCv
    ? generateCvFeedback(forgeParsedCv)
    : hasResume
      ? generateCvFeedback({
          name: resume.fullName || "Candidate",
          title: resume.headline || "Professional",
          email: resume.email,
          phone: null,
          location: resume.location || null,
          summary: resume.summary || null,
          skills: resume.skills,
          experience: resume.experience.map((e) => ({
            company: e.company,
            position: e.role,
            duration: `${e.start} – ${e.end}`,
            description: e.highlights,
          })),
          education: resume.education.map((e) => ({
            school: e.school,
            degree: e.degree,
            year: e.year,
          })),
          rawLength: 0,
        })
      : null;

  const quick = [
    { href: "/forge", label: lang === "tr" ? "CV Yükle veya Çözümle" : "Upload or parse CV", icon: Anvil },
    { href: "/resume", label: lang === "tr" ? "CV Düzenleyici" : "Edit resume", icon: FileText },
    { href: "/forge", label: lang === "tr" ? "İş Önerileri" : "Job ideas", icon: Briefcase },
    { href: "/forge", label: lang === "tr" ? "PDF Aktar / Eşleştir" : "Export PDF / Match", icon: Sparkles },
  ];

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto">
        <Badge variant="accent" className="mb-3">
          {t("navDashboard")}
        </Badge>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-star-white">
              {firstName 
                ? (lang === "tr" ? `Tekrar hoş geldin, ${firstName}` : `Welcome back, ${firstName}`) 
                : t("dashboardTitle")}
            </h1>
            <p className="text-muted-steel mt-2 max-w-xl leading-relaxed">
              {t("dashboardDesc")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/forge">
              <Button variant="accent">
                {t("openForge")} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="outline" className="text-star-white">{t("openWorkspace")}</Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <StatPill label={lang === "tr" ? "Başvurulan" : "Applied"} value={appliedJobIds.length} />
          <StatPill label={lang === "tr" ? "Kaydedilenler" : "Saved jobs"} value={savedJobIds.length} />
          <StatPill label={lang === "tr" ? "Yollar" : "Paths"} value={enrolledPathIds.length} />
          <StatPill label={lang === "tr" ? "Modüller" : "Modules"} value={`${doneModules}/${totalModules || 0}`} />
          <StatPill label={lang === "tr" ? "Analizler" : "Analyses"} value={forgeHistory.length} />
          <StatPill label={lang === "tr" ? "Yedekler" : "Backups"} value={forgeBackups.length} />
          {feedback && <StatPill label={lang === "tr" ? "CV Puanı" : "CV score"} value={`%${feedback.overallScore}`} />}
          {feedback && <StatPill label="ATS" value={`%${feedback.atsScore}`} />}
        </div>

        {/* CV status */}
        <section className="glass-panel rounded-3xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <FileText className="w-4 h-4 text-cosmic-teal" />
                {lang === "tr" ? "CV Durumu" : "CV status"}
              </h2>
              {forgeParsedCv || hasResume ? (
                <p className="text-sm text-muted-steel mt-1">
                  {lang === "tr" ? "Aktif profil:" : "Active profile:"}{" "}
                  <span className="font-semibold text-star-white">
                    {forgeParsedCv?.name || resume.fullName || "Unnamed"}
                  </span>
                  {(forgeParsedCv?.title || resume.headline) && (
                    <> · {forgeParsedCv?.title || resume.headline}</>
                  )}
                </p>
              ) : (
                <p className="text-sm text-muted-steel mt-1">
                  {t("noCvLoaded")}
                </p>
              )}
              {feedback && (
                <p className="text-sm text-ink-soft mt-2 max-w-2xl leading-relaxed">{feedback.summaryLine}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/forge">
                <Button size="sm" variant="accent">
                  {lang === "tr" ? "Forge'da Yönet" : "Manage in Forge"}
                </Button>
              </Link>
              <Link href="/resume">
                <Button size="sm" variant="outline" className="text-star-white">
                  {lang === "tr" ? "Alanları Düzenle" : "Edit fields"}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {quick.map((q) => (
            <Link
              key={q.label}
              href={q.href}
              className="glass-panel rounded-2xl p-4 hover:border-cosmic-teal/25 transition-colors group"
            >
              <q.icon className="w-5 h-5 text-cosmic-teal mb-2" />
              <p className="text-sm font-semibold group-hover:text-cosmic-teal transition-colors text-star-white">
                {q.label}
              </p>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <CheckCircle2 className="w-4 h-4 text-cosmic-teal" />
                {lang === "tr" ? "Başvurularım" : "Applications"}
              </h2>
              <Link href="/jobs" className="text-xs font-semibold text-cosmic-teal">
                {lang === "tr" ? "İlanlara Göz At" : "Browse jobs"}
              </Link>
            </div>
            {appliedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">
                {lang === "tr" ? "Henüz başvuru yok. Takip etmek için bir ilana başvurun." : "No applications yet. Open a role and apply to track it here."}
              </p>
            ) : (
              <ul className="space-y-3">
                {appliedJobs.map((job) => {
                  const company = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-panel-elevated/50 px-3 py-3 hover:border-cosmic-teal/25 transition-colors text-star-white"
                      >
                        <div>
                          <p className="font-semibold text-sm">{job.title}</p>
                          <p className="text-xs text-muted-steel">
                            {company?.name} ·{" "}
                            {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                        </div>
                        <Badge variant="accent">{lang === "tr" ? "Başvuruldu" : "Applied"}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <Bookmark className="w-4 h-4 text-cosmic-teal" />
                {lang === "tr" ? "Kaydedilen İlanlar" : "Saved roles"}
              </h2>
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">
                {lang === "tr" ? "Daha sonra incelemek için iş ilanlarını kaydedin." : "Bookmark roles from the job board to review later."}
              </p>
            ) : (
              <ul className="space-y-3">
                {savedJobs.map((job) => {
                  const company = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-panel-elevated/50 px-3 py-3 hover:border-cosmic-teal/25 transition-colors text-star-white"
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
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <History className="w-4 h-4 text-cosmic-teal" />
                {lang === "tr" ? "Geçmiş Analizler" : "Past analyses"}
              </h2>
              <Link href="/forge#history" className="text-xs font-semibold text-cosmic-teal">
                {lang === "tr" ? "Forge geçmişini aç" : "Open Forge history"}
              </Link>
            </div>
            {forgeHistory.length === 0 ? (
              <p className="text-sm text-muted-steel">
                {lang === "tr" ? "CV çözümleyin veya analiz edin — sonuçlar burada görünecektir." : "Parse a CV, run match, or export tools — results will appear here."}
              </p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-2 text-star-white">
                {forgeHistory.slice(0, 8).map((h) => (
                  <li
                    key={h.id}
                    className="rounded-xl border border-black/5 px-3 py-3 bg-panel-elevated/40"
                  >
                    <Badge variant="soft" className="mb-1 text-cosmic-teal">
                      {h.action}
                    </Badge>
                    <p className="text-sm">{h.summary}</p>
                    <p className="text-[11px] text-muted-steel mt-1">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
