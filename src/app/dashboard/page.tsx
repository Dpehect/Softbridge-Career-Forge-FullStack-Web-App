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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { getCompany } from "@/data/companies";
import { useCareerStore, resumeToParsed } from "@/store/useCareerStore";
import { buildJourneyInsight, CAREER_GOALS, generateCvFeedback, getGoal } from "@/lib/forge";
import { useHydrated } from "@/hooks/useHydrated";

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
  const {
    resume,
    forgeParsedCv,
    forgeAnalysis,
    forgeHistory,
    savedJobIds,
    appliedJobIds,
    enrolledPathIds,
    completedModuleIds,
    careerGoalId,
    setCareerGoalId,
  } = useCareerStore();

  const hasResume = Boolean(
    forgeParsedCv || resume.fullName || resume.summary || resume.skills.length || resume.experience.length
  );
  const parsed = forgeParsedCv ?? (hasResume ? resumeToParsed(resume) : null);
  const feedback = useMemo(() => (parsed ? generateCvFeedback(parsed) : null), [parsed]);
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
  const enrolledPaths = careerPaths.filter((path) => enrolledPathIds.includes(path.id));
  const totalModules = enrolledPaths.reduce((sum, path) => sum + path.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (sum, path) => sum + path.modules.filter((module) => completedModuleIds.includes(module.id)).length,
    0
  );
  const pathProgress = totalModules ? Math.round((doneModules / totalModules) * 100) : 0;
  const recommendedJobs = useMemo(
    () =>
      jobs
        .map((job) => ({ job, fit: jobFit(resume.skills, job.tags) }))
        .sort((a, b) => b.fit - a.fit)
        .slice(0, 3),
    [resume.skills]
  );

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  if (!hasResume) {
    return (
      <main className="product-page">
        <p className="page-kicker"><FileSearch className="h-3.5 w-3.5" /> Genel bakış</p>
        <div className="mt-5 grid gap-10 border-t border-line pt-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <h1 className="page-title-compact max-w-xl">Çalışma alanı bir özgeçmişle başlar.</h1>
            <p className="page-lede mt-4">Belgenizi eklediğinizde rol uyumu, başvuru seçenekleri ve kişisel çalışma planı burada birbirine bağlanır.</p>
          </div>
          <div className="surface-subtle p-6">
            <p className="section-label">İlk adım</p>
            <p className="mt-3 text-sm font-semibold text-ink">Özgeçmişinizi cihazınızda çözümleyin</p>
            <p className="mt-2 text-xs leading-5 text-ink-3">PDF veya düz metin yükleyin. Hiçbir içerik sunucuya gönderilmez.</p>
            <Link href="/forge" className="mt-5 inline-flex"><Button variant="primary">Analizi başlat <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </main>
    );
  }

  const focusActions = [
    {
      title: journey.missingSkills[0] ? `“${journey.missingSkills[0]}” için gerçek bir kanıt ekleyin` : "En güçlü deneyim maddesini hedef role taşıyın",
      detail: "Tahmini etki: rol uyumunda 6–9 puan",
      href: "/resume",
      done: journey.missingSkills.length === 0,
    },
    {
      title: "Öncelikli iş ilanını özgeçmişinizle karşılaştırın",
      detail: `${recommendedJobs[0]?.job.title || "Hedef rol"} · ${recommendedJobs[0]?.fit || 0}% mevcut eşleşme`,
      href: recommendedJobs[0] ? `/jobs/${recommendedJobs[0].job.id}` : "/jobs",
      done: Boolean(forgeAnalysis),
    },
    {
      title: "En zor davranışsal soruya prova yapın",
      detail: "CV'nizdeki son ölçülebilir sonuç kullanılır",
      href: "/coach",
      done: false,
    },
  ];

  return (
    <main className="product-page">
      <header className="grid gap-6 border-b border-line pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><Flag className="h-3.5 w-3.5" /> Bugünün çalışma alanı</p>
          <h1 className="page-title-compact mt-4">{firstName ? `${firstName}, sıradaki hamleniz burada.` : "Sıradaki hamleniz burada."}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">
            Hedef rolünüz, özgeçmiş kanıtlarınız ve fırsatlar tek bir ilerleme akışında tutuluyor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/forge"><Button variant="outline"><FileSearch className="h-4 w-4" /> Yeni analiz</Button></Link>
          <Link href="/resume"><Button variant="primary"><FileText className="h-4 w-4" /> Özgeçmişi düzenle</Button></Link>
        </div>
      </header>

      <section className="grid border-x border-b border-line bg-surface md:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-line p-6 md:border-b-0 md:border-r md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-label">Hedef rol</p>
              <h2 className="mt-2 text-lg font-semibold text-ink">{goal?.labelTr || "Rol seçilmedi"}</h2>
            </div>
            <label>
              <span className="sr-only">Hedef rolü değiştir</span>
              <select
                value={careerGoalId ?? ""}
                onChange={(event) => setCareerGoalId(event.target.value || null)}
                className="h-9 rounded-[var(--radius-control)] border border-line bg-surface px-3 text-xs font-medium text-ink outline-none focus:border-brand focus:shadow-[var(--focus-ring)]"
              >
                {CAREER_GOALS.map((item) => <option key={item.id} value={item.id}>{item.labelTr}</option>)}
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
                  ? `${journey.missingSkills.slice(0, 3).join(", ")} kanıtları hedef role giden en kısa boşluklar.`
                  : "Hedef rolün temel sinyalleri özgeçmişinizde görünür durumda."}
              </p>
            </div>
            <strong className="metric-number text-4xl font-semibold text-brand-strong">{journey.progressPct}%</strong>
          </div>
        </div>

        <dl className="grid grid-cols-3 divide-x divide-line">
          {[
            ["ATS", journey.atsScore],
            ["Yol", pathProgress],
            ["Başvuru", appliedJobIds.length],
          ].map(([label, value]) => (
            <div key={label} className="flex min-h-36 flex-col justify-end p-4 sm:p-6">
              <dt className="text-[0.6875rem] text-ink-3">{label}</dt>
              <dd className="metric-number mt-2 text-2xl font-semibold text-ink">{label === "Başvuru" ? value : `${value}%`}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
        <section>
          <div className="flex items-end justify-between border-b border-line pb-4">
            <div>
              <p className="section-label">Bu hafta</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Üç odak, tek başvuru hikâyesi</h2>
            </div>
            <span className="font-mono text-xs text-ink-3">{focusActions.filter((item) => item.done).length}/3</span>
          </div>
          <ol>
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

          <div className="mt-10">
            <div className="flex items-end justify-between border-b border-line pb-4">
              <div>
                <p className="section-label">Kanıt haritası</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Özgeçmişiniz neyi gerçekten kanıtlıyor?</h2>
              </div>
              <Link href="/resume" className="text-xs font-semibold text-brand-strong hover:underline">Düzenle</Link>
            </div>
            <div className="grid gap-px bg-line sm:grid-cols-3">
              {[
                { label: "Ürün etkisi", value: "Güçlü", note: "%35 performans ve 12k kullanıcı", tone: "positive" },
                { label: "Teknik derinlik", value: resume.skills.length >= 7 ? "Güçlü" : "Gelişiyor", note: `${resume.skills.length} doğrulanabilir beceri`, tone: "info" },
                { label: "Takım etkisi", value: resume.experience.length ? "Görünür" : "Eksik", note: "Bileşen kütüphanesi ve ekip kullanımı", tone: "signal" },
              ].map((item) => (
                <div key={item.label} className="bg-surface p-5">
                  <p className="text-[0.6875rem] text-ink-3">{item.label}</p>
                  <p className="mt-3 text-sm font-semibold text-ink">{item.value}</p>
                  <p className="mt-2 text-xs leading-5 text-ink-3">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-8">
          <section className="surface-subtle p-6">
            <div className="flex items-center justify-between">
              <p className="section-label">Fırsat kuyruğu</p>
              <BriefcaseBusiness className="h-4 w-4 text-ink-3" />
            </div>
            <div className="mt-4">
              {recommendedJobs.map(({ job, fit }) => {
                const company = getCompany(job.companyId);
                return (
                  <Link key={job.id} href={`/jobs/${job.id}`} className="interactive-row block border-t border-line py-4 first:border-t-0 first:pt-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-semibold text-ink">{job.title}</h3>
                        <p className="mt-1 text-[0.6875rem] text-ink-3">{company?.name} · {job.workMode}</p>
                      </div>
                      <span className="metric-number text-xs font-semibold text-brand-strong">{fit}%</span>
                    </div>
                  </Link>
                );
              })}
            </div>
            <Link href="/jobs" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand-strong hover:underline">İşleri incele <ArrowRight className="h-3.5 w-3.5" /></Link>
          </section>

          <section className="border-t border-line pt-6">
            <p className="section-label">Durum</p>
            <div className="mt-4 space-y-3 text-xs text-ink-2">
              <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Bookmark className="h-3.5 w-3.5 text-ink-3" /> Kaydedilen ilan</span><strong className="metric-number">{savedJobIds.length}</strong></p>
              <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Route className="h-3.5 w-3.5 text-ink-3" /> Aktif kariyer yolu</span><strong className="metric-number">{enrolledPathIds.length}</strong></p>
              <p className="flex items-center justify-between"><span className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-ink-3" /> Analiz geçmişi</span><strong className="metric-number">{forgeHistory.length}</strong></p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
