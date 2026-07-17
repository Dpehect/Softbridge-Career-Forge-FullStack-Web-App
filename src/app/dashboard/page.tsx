"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Check,
  FileSearch,
  FileText,
  Flag,
  Route,
  Target,
  CheckSquare,
  Square,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCareerStore, resumeToParsed } from "@/store/useCareerStore";
import { buildJourneyInsight, CAREER_GOALS, generateCvFeedback, getGoal } from "@/lib/forge";
import { useHydrated } from "@/hooks/useHydrated";
import { useMessages } from "@/i18n/useMessages";
import { getLocalizedCompany, getLocalizedJobs, getLocalizedPaths } from "@/i18n/content";
import { calculateAtsScore } from "@/features/analysis/atsScore";
import { AtsScoreBreakdown } from "@/components/AtsScoreBreakdown";
import { ActionableRecommendations } from "@/components/ActionableRecommendations";
import { CloudSyncStatus } from "@/components/sync/CloudSyncStatus";
import { cn } from "@/lib/utils";

function jobFit(userSkills: string[], tags: string[]) {
  if (!userSkills.length) return 0;
  const normalized = userSkills.map((skill) => skill.toLowerCase());
  const matched = tags.filter((tag) =>
    normalized.some((skill) => skill.includes(tag.toLowerCase()) || tag.toLowerCase().includes(skill))
  );
  return Math.round((matched.length / tags.length) * 100);
}

export default function DashboardPage() {
  const mounted = useHydrated();
  const { locale, messages, page } = useMessages();
  const copy = page.dashboard;
  const isTr = locale === "tr";

  const {
    resume,
    forgeParsedCv,
    forgeAnalysis,
    forgeHistory,
    savedJobIds,
    appliedJobIds,
    jobStages,
    enrolledPathIds,
    completedModuleIds,
    careerGoalId,
    setCareerGoalId,
    loadDemoProfile,
    forgeBackups,
  } = useCareerStore();

  const localizedJobs = useMemo(() => getLocalizedJobs(locale), [locale]);
  const localizedPaths = useMemo(() => getLocalizedPaths(locale), [locale]);

  const hasResume = Boolean(
    forgeParsedCv || resume.fullName || resume.summary || resume.skills.length || resume.experience.length
  );
  const parsed = forgeParsedCv ?? (hasResume ? resumeToParsed(resume) : null);
  const feedback = useMemo(() => (parsed ? generateCvFeedback(parsed, "", locale) : null), [parsed, locale]);
  const atsResult = useMemo(() => (parsed ? calculateAtsScore(parsed) : null), [parsed]);

  const journey = useMemo(
    () =>
      buildJourneyInsight({
        cv: parsed,
        goalId: careerGoalId,
        atsScore: forgeAnalysis?.atsScore ?? feedback?.atsScore,
        feedback,
        missingFromMatch: forgeAnalysis?.missingSkills,
      }),
    [parsed, careerGoalId, forgeAnalysis, feedback]
  );

  const goal = getGoal(careerGoalId);
  const firstName = parsed?.name && !["Candidate", "Aday"].includes(parsed.name)
    ? parsed.name.split(" ")[0]
    : "";

  const enrolledPaths = localizedPaths.filter((path) => enrolledPathIds.includes(path.id));
  const totalModules = enrolledPaths.reduce((sum, path) => sum + path.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (sum, path) => sum + path.modules.filter((module) => completedModuleIds.includes(module.id)).length,
    0
  );
  const pathProgress = totalModules ? Math.round((doneModules / totalModules) * 100) : 0;

  const recommendedJobs = useMemo(
    () =>
      localizedJobs
        .map((job) => ({ job, fit: jobFit(resume.skills, job.tags) }))
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 3),
    [resume.skills, localizedJobs]
  );

  const metricEvidence = parsed?.experience
    .flatMap((item) => item.description)
    .find((item) => /\d+\s*%|\b\d{2,}\b|[$€£₺]\s*\d+/i.test(item));

  const workModeLabels = locale === "tr"
    ? { Remote: "Uzaktan", Hybrid: "Hibrit", "On-site": "Ofiste" }
    : { Remote: "Remote", Hybrid: "Hybrid", "On-site": "On-site" };

  // Calculate Pipeline Stages
  const pipelineStats = useMemo(() => {
    let applied = 0;
    let interviewing = 0;
    let technical = 0;
    let offer = 0;
    let rejected = 0;

    appliedJobIds.forEach((id) => {
      const stage = jobStages?.[id] || "applied";
      if (stage === "applied") applied++;
      else if (stage === "interviewing") interviewing++;
      else if (stage === "technical") technical++;
      else if (stage === "offer") offer++;
      else if (stage === "rejected") rejected++;
    });

    return { applied, interviewing, technical, offer, rejected };
  }, [appliedJobIds, jobStages]);

  // Weekly Checklist Goals (ATS score >= 80, applied >= 1, modules >= 1)
  const weeklyGoals = useMemo(() => {
    return [
      {
        id: "goal-ats",
        label: isTr ? "Özgeçmiş ATS Optimizasyonu" : "ATS Optimization",
        description: isTr ? "Eşleşme skorunu %80 veya üzerine çıkarın." : "Optimize resume ATS score to 80% or higher.",
        done: (atsResult?.total || 0) >= 80,
        current: atsResult?.total || 0,
        target: 80,
        unit: "%",
      },
      {
        id: "goal-apply",
        label: isTr ? "Aktif Başvuru Aşaması" : "Active Application",
        description: isTr ? "En az 1 ilana başvuru yapın." : "Submit at least 1 job application.",
        done: appliedJobIds.length >= 1,
        current: appliedJobIds.length,
        target: 1,
        unit: "",
      },
      {
        id: "goal-learn",
        label: isTr ? "Sürekli Öğrenme" : "Continuous Learning",
        description: isTr ? "Roadmap üzerinde en az 1 modül tamamlayın." : "Mark at least 1 module as completed.",
        done: completedModuleIds.length >= 1,
        current: completedModuleIds.length,
        target: 1,
        unit: "",
      },
    ];
  }, [atsResult, appliedJobIds, completedModuleIds, isTr]);

  const renderContent = () => {
    if (!mounted) {
      return (
        <div className="space-y-8 mt-6">
          <div className="h-40 w-full animate-pulse rounded bg-surface-2 border border-line" />
          <div className="grid gap-8 md:grid-cols-2">
            <div className="h-64 animate-pulse rounded bg-surface-2 border border-line" />
            <div className="h-64 animate-pulse rounded bg-surface-2 border border-line" />
          </div>
        </div>
      );
    }

    if (!hasResume) {
      return (
        <div className="mt-5 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <h1 className="page-title-compact max-w-xl">{copy.emptyTitle}</h1>
            <p className="page-lede mt-4">{copy.emptyBody}</p>
          </div>
          <div className="surface-subtle p-6 rounded-lg border border-line">
            <p className="section-label">{copy.firstStep}</p>
            <p className="mt-3 text-sm font-semibold text-ink">{copy.localAnalyze}</p>
            <p className="mt-2 text-xs leading-5 text-ink-3">{copy.localAnalyzeBody}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/forge" className="inline-flex">
                <Button variant="primary">
                  {copy.start} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" onClick={loadDemoProfile}>{messages.demo.open}</Button>
            </div>
          </div>
        </div>
      );
    }

    const focusActions = [
      {
        title: journey.missingSkills[0]
          ? isTr ? `“${journey.missingSkills[0]}” için kanıt ekleyin` : `Add evidence for “${journey.missingSkills[0]}”`
          : isTr ? "En güçlü deneyim maddesini hedef role taşıyın" : "Connect your strongest experience bullet to the target role",
        detail: isTr ? "Etki: hedef rol için doğrulanabilir kanıtı görünür kılar" : "Impact: makes verifiable target-role evidence visible",
        href: "/resume",
        done: journey.missingSkills.length === 0,
      },
      {
        title: copy.compareJob,
        detail: `${recommendedJobs[0]?.job.title || (isTr ? "Hedef rol" : "Target role")} · ${recommendedJobs[0]?.fit || 0}% ${isTr ? "mevcut eşleşme" : "current match"}`,
        href: recommendedJobs[0] ? `/jobs/${recommendedJobs[0].job.id}` : "/jobs",
        done: Boolean(forgeAnalysis),
      },
      {
        title: copy.rehearse,
        detail: copy.rehearseDetail,
        href: "/coach",
        done: false,
      },
    ];

    return (
      <>
        {/* Cockpit / Goal Section */}
        <section className="grid border border-line bg-surface md:grid-cols-[1.15fr_0.85fr] mt-6 rounded-lg overflow-hidden shadow-sm">
          <div className="border-b border-line p-6 md:border-b-0 md:border-r md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="section-label">{copy.targetRole}</p>
                <h2 className="mt-2 text-lg font-semibold text-ink">{(isTr ? goal?.labelTr : goal?.labelEn) || copy.noRole}</h2>
              </div>
              <label>
                <span className="sr-only">{copy.changeRole}</span>
                <select
                  value={careerGoalId ?? ""}
                  onChange={(event) => setCareerGoalId(event.target.value || null)}
                  className="min-h-11 rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs font-medium text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]"
                >
                  {CAREER_GOALS.map((item) => <option key={item.id} value={item.id}>{isTr ? item.labelTr : item.labelEn}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-7 flex items-end justify-between gap-6">
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-surface-3">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${journey.progressPct}%` }} />
                </div>
                <p className="mt-3 text-xs leading-5 text-ink-3">
                  {journey.missingSkills.length
                    ? isTr
                      ? `${journey.missingSkills.slice(0, 3).join(", ")} sinyalleri hedef rol için henüz kanıtlanmamış boşluklar.`
                      : `${journey.missingSkills.slice(0, 3).join(", ")} are unverified gaps for the target role.`
                    : copy.readySignals}
                </p>
              </div>
              <strong className="metric-number text-4xl font-semibold text-brand-strong">{journey.progressPct}%</strong>
            </div>
          </div>

          <dl className="grid grid-cols-3 divide-x divide-line">
            {[
              ["ATS", atsResult?.total ?? 0],
              [copy.roadmap, pathProgress],
              [copy.applications, appliedJobIds.length],
            ].map(([label, value]) => (
              <div key={label} className="flex min-h-36 flex-col justify-end p-4 sm:p-6">
                <dt className="text-[0.6875rem] text-ink-3 font-semibold uppercase tracking-wider">{label}</dt>
                <dd className="metric-number mt-2 text-2xl font-semibold text-ink">{label === copy.applications ? value : `${value}%`}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ATS score overview if active */}
        {atsResult && <div className="mt-8"><AtsScoreBreakdown result={atsResult} /></div>}

        <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          {/* Main Content Area */}
          <section className="space-y-10">
            {/* WEEKLY CHECKLIST GOALS */}
            <div>
              <div className="flex items-end justify-between border-b border-line pb-4">
                <div>
                  <p className="section-label">{isTr ? "Bu Haftaki Hedefler" : "Weekly Checklist"}</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">{isTr ? "Aktif İlerleme Durumu" : "Active Weekly Goals"}</h2>
                </div>
                <span className="font-mono text-xs text-ink-3">{weeklyGoals.filter((g) => g.done).length}/3</span>
              </div>
              <div className="mt-5 space-y-3">
                {weeklyGoals.map((goal) => (
                  <div key={goal.id} className={cn("flex items-start gap-4 p-4 border rounded-lg bg-surface transition-all", goal.done ? "border-positive/20 bg-[var(--positive-wash)]/30" : "border-line")}>
                    <div className="shrink-0 mt-0.5">
                      {goal.done ? (
                        <CheckSquare className="h-5 w-5 text-positive" />
                      ) : (
                        <Square className="h-5 w-5 text-ink-3" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ink">{goal.label}</h3>
                      <p className="text-xs text-ink-3 mt-0.5 leading-relaxed">{goal.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-ink">{goal.current}{goal.unit}</span>
                      <span className="text-[10px] text-ink-3 block mt-0.5">/ {goal.target}{goal.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* APPLICATION PIPELINE VISUALIZER */}
            <div>
              <div className="border-b border-line pb-4">
                <p className="section-label">{isTr ? "Süreç Durumu" : "Pipeline Tracker"}</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{isTr ? "Başvuru Süreç Takipçisi" : "Job Application Pipeline"}</h2>
              </div>
              <div className="mt-5 grid grid-cols-5 gap-2.5 text-center">
                {[
                  { label: isTr ? "Başvuruldu" : "Applied", count: pipelineStats.applied, color: "text-ink border-line bg-surface" },
                  { label: isTr ? "Mülakat" : "Interview", count: pipelineStats.interviewing, color: "text-brand-strong border-brand/20 bg-[var(--accent-wash)]" },
                  { label: isTr ? "Teknik Değ." : "Technical", count: pipelineStats.technical, color: "text-indigo-600 border-indigo-200 bg-indigo-50/30" },
                  { label: isTr ? "Teklif" : "Offer", count: pipelineStats.offer, color: "text-positive border-positive/20 bg-[var(--positive-wash)]" },
                  { label: isTr ? "Reddedildi" : "Rejected", count: pipelineStats.rejected, color: "text-negative border-negative/20 bg-[var(--negative-wash)]" }
                ].map((item) => (
                  <div key={item.label} className={cn("flex flex-col items-center p-3.5 border rounded-lg shadow-sm", item.color)}>
                    <span className="text-xl font-bold font-mono">{item.count}</span>
                    <span className="text-[10px] mt-1.5 font-semibold uppercase tracking-wider truncate w-full">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NEXT-BEST ACTIONS */}
            <div>
              <div className="flex items-end justify-between border-b border-line pb-4">
                <div>
                  <p className="section-label">{copy.thisWeek}</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">{copy.focusTitle}</h2>
                </div>
                <span className="font-mono text-xs text-ink-3">{focusActions.filter((item) => item.done).length}/3</span>
              </div>
              <ol className="mt-4">
                {focusActions.map((action, index) => (
                  <li key={action.title}>
                    <Link href={action.href} className="interactive-row group grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-line py-5">
                      <span className="grid h-6 w-6 place-items-center rounded-full border border-line-strong text-ink-3">
                        {action.done ? <Check className="h-3.5 w-3.5 text-positive" /> : <span className="font-mono text-[0.625rem]">0{index + 1}</span>}
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-ink">{action.title}</h3>
                        <p className="mt-1 text-xs text-ink-3">{action.detail}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-ink-3 transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            {/* EVIDENCE MAP */}
            <div>
              <div className="flex items-end justify-between border-b border-line pb-4">
                <div>
                  <p className="section-label">{copy.evidenceMap}</p>
                  <h2 className="mt-2 text-xl font-semibold text-ink">{copy.evidenceTitle}</h2>
                </div>
                <Link href="/resume" className="text-xs font-semibold text-brand-strong hover:underline">{messages.common.edit}</Link>
              </div>
              <div className="grid gap-px bg-line sm:grid-cols-3 rounded-lg overflow-hidden border border-line mt-5">
                {[
                  { label: copy.productImpact, value: metricEvidence ? copy.visible : copy.missing, note: metricEvidence || (isTr ? "Doğrulanmış ölçülebilir sonuç bulunamadı" : "No verified measurable outcome found"), tone: "positive" },
                  { label: copy.technicalDepth, value: resume.skills.length >= 7 ? copy.strong : copy.developing, note: isTr ? `${resume.skills.length} doğrulanabilir beceri` : `${resume.skills.length} verifiable skills`, tone: "info" },
                  { label: copy.teamImpact, value: resume.experience.length ? copy.visible : copy.missing, note: isTr ? `${resume.experience.length} yapılandırılmış deneyim kaydı` : `${resume.experience.length} structured experience entries`, tone: "signal" },
                ].map((item) => (
                  <div key={item.label} className="bg-surface p-5">
                    <p className="text-[0.6875rem] text-ink-3 font-semibold uppercase tracking-wider">{item.label}</p>
                    <p className="mt-3 text-sm font-semibold text-ink">{item.value}</p>
                    <p className="mt-2 text-xs leading-5 text-ink-3">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Sidebar Area */}
          <aside className="space-y-8 xl:sticky xl:top-32 xl:self-start">
            {/* RESUME VERSION LOGS */}
            <section className="bg-surface border border-line rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-ink uppercase tracking-wider">{isTr ? "Kayıtlı CV Sürümleri" : "CV Versions"}</h3>
                <Link href="/resume" className="text-[11px] font-semibold text-brand-strong hover:underline">{isTr ? "Tümünü Gör" : "See All"}</Link>
              </div>
              <div className="space-y-3">
                {forgeBackups.slice(0, 3).map((backup) => (
                  <div key={backup.id} className="flex justify-between items-start text-xs border-b border-line pb-2.5 last:border-0 last:pb-0">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-ink truncate">{backup.label}</p>
                      <p className="text-[10px] text-ink-3 mt-0.5">
                        {new Intl.DateTimeFormat(isTr ? "tr-TR" : "en-US", { dateStyle: "medium" }).format(new Date(backup.createdAt))}
                      </p>
                    </div>
                    <Link href="/resume">
                      <Button variant="ghost" size="sm" className="h-7 text-[10px] shrink-0">{isTr ? "Gözat" : "View"}</Button>
                    </Link>
                  </div>
                ))}
                {!forgeBackups.length && (
                  <p className="text-xs text-ink-3 text-center py-4 bg-surface-2 rounded border border-dashed border-line">{isTr ? "Kayıtlı sürüm bulunamadı." : "No saved versions found."}</p>
                )}
              </div>
            </section>

            {/* RECOMMENDED OPPORTUNITIES */}
            <section className="surface-subtle p-6 rounded-lg border border-line">
              <div className="flex items-center justify-between">
                <p className="section-label">{copy.opportunityQueue}</p>
                <BriefcaseBusiness className="h-4 w-4 text-ink-3" />
              </div>
              <div className="mt-4">
                {recommendedJobs.map(({ job, fit }) => {
                  const company = getLocalizedCompany(job.companyId, locale);
                  return (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="interactive-row block border-t border-line py-4 first:border-t-0 first:pt-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xs font-semibold text-ink">{job.title}</h3>
                          <p className="mt-1 text-[0.6875rem] text-ink-3">{company?.name} · {workModeLabels[job.workMode]}</p>
                        </div>
                        <span className="metric-number text-xs font-semibold text-brand-strong">{fit}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <Link href="/jobs" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-strong hover:underline">{copy.reviewJobs} <ArrowRight className="h-3.5 w-3.5" /></Link>
            </section>

            {/* QUICK STATUS STATS */}
            <section className="border-t border-line pt-6">
              <p className="section-label">{messages.common.status}</p>
              <div className="mt-4 space-y-3 text-xs text-ink-2">
                <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Bookmark className="h-3.5 w-3.5 text-ink-3" /> {copy.savedJobs}</span><strong className="metric-number">{savedJobIds.length}</strong></p>
                <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Route className="h-3.5 w-3.5 text-ink-3" /> {copy.activeRoadmap}</span><strong className="metric-number">{enrolledPathIds.length}</strong></p>
                <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-ink-3" /> {copy.analysisHistory}</span><strong className="metric-number">{forgeHistory.length}</strong></p>
              </div>
            </section>
          </aside>
        </div>
      </>
    );
  };

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><Flag className="h-3.5 w-3.5" /> {copy?.today || "Bugün"}</p>
          <h1 className="page-title-compact mt-4">
            {mounted && firstName ? `${firstName}, ${copy.nextMoveNamed}` : (copy?.nextMove || "Kariyer Hedefiniz")}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">
            {copy?.lede || "Çalışma alanınız yükleniyor..."}
          </p>
        </div>
        {mounted && (
          <div className="flex flex-wrap gap-2">
            <Link href="/forge"><Button variant="outline"><FileSearch className="h-4 w-4" /> {copy.newAnalysis}</Button></Link>
            <Link href="/resume"><Button variant="primary"><FileText className="h-4 w-4" /> {copy.editResume}</Button></Link>
          </div>
        )}
      </header>
      {renderContent()}
    </main>
  );
}
