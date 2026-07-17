"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  FileText,
  Sparkles,
  Briefcase,
  Brain,
  TrendingUp,
  Clock,
  CheckCircle2,
  History,
  AlertTriangle,
  Lightbulb,
  FileSearch,
  Target,
  ChevronRight,
  Award,
} from "lucide-react";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { getCompany } from "@/data/companies";
import {
  MOCK_ATS_ANALYSIS,
  MOCK_DASHBOARD_STATS,
  MOCK_RECENT_ACTIVITY,
  USE_MOCK_DATA,
} from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AtsProgressBar } from "@/components/AtsProgressBar";
import { useCareerStore } from "@/store/useCareerStore";
import { formatSalary } from "@/lib/utils";
import { generateCvFeedback, CAREER_GOALS, buildJourneyInsight, getGoal } from "@/lib/forge";
import { useTranslation } from "@/lib/forge/i18n";
import { cn } from "@/lib/utils";

function RadialGauge({
  value,
  max = 100,
  size = 80,
  stroke = 7,
  color = "#8B5CF6",
  label,
  sub,
}: {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label: string;
  sub: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.01] border border-slate-100/50 dark:border-white/5 dark:bg-white/[0.01]">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(0, 0, 0, 0.05)"
            className="dark:stroke-white/5"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-slate-800 dark:text-white">{label}</span>
        </div>
      </div>
      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{sub}</span>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  color: string;
  href?: string;
}) {
  const content = (
    <div className="glass-panel p-5 space-y-4 rounded-3xl hover:scale-[1.02] transition-all hover:border-purple-500/20 duration-200 text-left h-full block">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}12` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h4>
        <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
          {value}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="no-underline">
      {content}
    </Link>
  ) : (
    content
  );
}

export default function DashboardPage() {
  const {
    savedJobIds,
    appliedJobIds,
    enrolledPathIds,
    completedModuleIds,
    resume,
    forgeParsedCv,
    forgeHistory,
    forgeAnalysis,
    careerGoalId,
    setCareerGoalId,
    lastAnalysisMeta,
  } = useCareerStore();

  const { t, lang } = useTranslation();
  const isTR = lang === "tr";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const savedJobs = useMemo(() => jobs.filter((j) => savedJobIds.includes(j.id)), [savedJobIds]);
  const appliedJobs = useMemo(() => jobs.filter((j) => appliedJobIds.includes(j.id)), [appliedJobIds]);
  const enrolledPaths = useMemo(() => careerPaths.filter((p) => enrolledPathIds.includes(p.id)), [enrolledPathIds]);
  
  const totalModules = enrolledPaths.reduce((n, p) => n + p.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (n, p) => n + p.modules.filter((m) => completedModuleIds.includes(m.id)).length,
    0
  );

  const hasResume =
    Boolean(resume.fullName || resume.headline || resume.summary) || resume.skills.length > 0;
  const firstName = resume.fullName?.trim().split(" ")[0] || forgeParsedCv?.name?.split(" ")[0];

  const feedback = useMemo(() => {
    if (forgeParsedCv) return generateCvFeedback(forgeParsedCv);
    if (hasResume)
      return generateCvFeedback({
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
      });
    return null;
  }, [forgeParsedCv, hasResume, resume]);

  const analyzedCvCount = USE_MOCK_DATA
    ? MOCK_DASHBOARD_STATS.analyzedCvCount
    : Math.max(
        forgeHistory.filter(
          (h) => h.action === "parse" || h.action === "analyze" || h.action === "ats"
        ).length,
        forgeParsedCv || hasResume ? 1 : 0
      );

  const latestAtsScore = USE_MOCK_DATA
    ? MOCK_ATS_ANALYSIS.atsScore
    : forgeAnalysis?.atsScore ?? feedback?.atsScore ?? null;

  const recentItems = USE_MOCK_DATA
    ? MOCK_RECENT_ACTIVITY
    : forgeHistory.slice(0, 5).map((h) => ({
        id: h.id,
        title: h.summary,
        summary: h.action === "parse" ? "CV Çözümleme" : h.action === "analyze" ? "Rol Analizi" : "ATS Taraması",
        createdAt: h.createdAt,
      }));

  const isEmpty = !forgeParsedCv && !hasResume && forgeHistory.length === 0;

  const cvScore = feedback?.overallScore ?? (USE_MOCK_DATA ? MOCK_ATS_ANALYSIS.atsScore : 0);
  const atsScore = latestAtsScore ?? 0;
  const pathProgress = totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;

  const journey = useMemo(() => {
    return buildJourneyInsight({
      cv: forgeParsedCv,
      goalId: careerGoalId,
      atsScore: latestAtsScore,
      feedback,
      missingFromMatch: forgeAnalysis?.missingSkills,
    });
  }, [forgeParsedCv, careerGoalId, latestAtsScore, feedback, forgeAnalysis]);

  const activeGoal = getGoal(careerGoalId);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-purple-600" />
      </div>
    );
  }

  // 1. Primary Action Guidance (What is happening? What should I do next? What value do I get?)
  const recommendedAction = (() => {
    if (isEmpty) {
      return {
        title: "Kariyer kokpitinizi etkinleştirmek için ilk CV'nizi yükleyin",
        desc: "Yapay zeka motorunun size uygun eksik yetenekleri, mülakat hazırlık sorularını ve rol uyum puanlarını listelemesi için özgeçmişinizi yüklemeniz gerekir.",
        cta: "Analiz Sayfasına Git",
        href: "/forge",
        alertType: "warning" as const,
      };
    }
    if (atsScore < 75) {
      return {
        title: "Özgeçmişiniz hedeflenen ATS uyumluluk skorunun altında (%75)",
        desc: `Kariyer hedefiniz olan "${activeGoal?.labelTr || "Seçilen Rol"}" için özgeçmişinizde eksik terimler tespit edildi. Aşağıdaki yetenekleri ekleyerek veya maddeleri metrikler kullanarak düzenleyiciden güncelleyebilirsiniz.`,
        cta: "Özgeçmiş Düzenleyiciyi Aç",
        href: "/resume?from=analiz",
        alertType: "info" as const,
      };
    }
    return {
      title: "Özgeçmişiniz başvurular için mükemmel durumda!",
      desc: "ATS puanınız hedefin üzerinde. Size uygun iş ilanlarını listeleyebilir ve doğrudan başvurularınızı gerçekleştirebilirsiniz.",
      cta: "İş İlanlarını Listele",
      href: "/jobs",
      alertType: "success" as const,
    };
  })();

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-8 text-left">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300">
              <Brain className="w-3.5 h-3.5" />
              {t("navDashboard")}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {firstName ? `Kariyer kokpitin, ${firstName} 👋` : "Kariyer Kokpiti"}
            </h1>
            <p className="text-slate-500 mt-1 max-w-xl text-sm leading-relaxed">
              Özgeçmiş durumunuzu takip edin, eksik yeteneklerinizi kapatın ve hedeflerinize giden yolda sıradaki adımı tamamlayın.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link href="/forge">
              <Button variant="primary" className="gap-1.5 shadow-md">
                Yeni Analiz Başlat <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="outline" className="text-slate-800 dark:text-slate-200">
                Özgeçmişi Düzenle
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. Recommended Next Step Banner (Primary focus action) */}
        <section
          className={cn(
            "rounded-3xl p-6 border relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6",
            recommendedAction.alertType === "warning" && "bg-amber-500/[0.04] border-amber-500/20",
            recommendedAction.alertType === "info" && "bg-purple-500/[0.04] border-purple-500/20",
            recommendedAction.alertType === "success" && "bg-emerald-500/[0.04] border-emerald-500/20"
          )}
        >
          <div className="space-y-2 flex-1">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border",
                recommendedAction.alertType === "warning" && "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-500/20",
                recommendedAction.alertType === "info" && "bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-500/20",
                recommendedAction.alertType === "success" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-500/20"
              )}
            >
              Önerilen Sıradaki Adım
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {recommendedAction.title}
            </h3>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              {recommendedAction.desc}
            </p>
          </div>
          <Link href={recommendedAction.href} className="shrink-0">
            <Button variant="primary" className="shadow-lg whitespace-nowrap">
              {recommendedAction.cta}
            </Button>
          </Link>
        </section>

        {/* 2. Intelligent Empty State */}
        {isEmpty ? (
          <div className="glass-panel p-12 text-center rounded-3xl border-dashed border-2 max-w-3xl mx-auto space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
              <FileSearch className="w-6 h-6 text-purple-600 dark:text-[#C084FC]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Henüz Özgeçmiş Analizi Yapılmadı
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Kariyer kokpitinin puan kartlarını, eksik yetenek haritalarını ve mülakat asistanını açmak için özgeçmişinizi sisteme yükleyin.
            </p>
            <Link href="/forge">
              <Button variant="primary" className="shadow-md">
                İlk Özgeçmişimi Yükle
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* 3. Core Metrics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
              
              {/* Career Goal Card */}
              <div className="glass-panel rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-purple-600 dark:text-[#C084FC]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
                        Hedef Pozisyon: {activeGoal ? activeGoal.labelTr : "Seçilmedi"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Optimizasyonlar bu hedef role göre yapılır.
                      </p>
                    </div>
                  </div>
                  <div>
                    <select
                      value={careerGoalId ?? ""}
                      onChange={(e) => setCareerGoalId(e.target.value || null)}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800 dark:bg-slate-950 dark:border-white/10 dark:text-white outline-none cursor-pointer"
                    >
                      {CAREER_GOALS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.labelTr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Kariyer Rota Uyum Oranı
                    </span>
                    <span className="font-black text-purple-600 dark:text-[#C084FC] tabular-nums">
                      %{journey.progressPct}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${journey.progressPct}%`,
                        background: "linear-gradient(90deg, #6B21A8, #A855F7, #F97316)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Seçtiğiniz hedef rolün gereksinimleri ile özgeçmiş yetenekleriniz karşılaştırıldı. 
                    {journey.missingSkills.length > 0 ? (
                      <>
                        {" "}Gelişim sağlamak için özgeçmişinize{" "}
                        <strong className="text-slate-800 dark:text-white">
                          “{journey.missingSkills.slice(0, 2).join(", ")}”
                        </strong>{" "}
                        eklemeyi düşünün.
                      </>
                    ) : (
                      " Özgeçmişiniz hedef rolün gerekliliklerini tam olarak karşılıyor."
                    )}
                  </p>
                </div>

                {journey.missingSkills.length > 0 && (
                  <div className="space-y-3 pt-3 border-t dark:border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Eksik Yetkinlikler
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {journey.missingSkills.slice(0, 5).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Radial Gauges */}
              <div className="glass-panel rounded-3xl p-6 flex flex-row sm:flex-col lg:flex-row gap-4 items-center justify-around">
                <RadialGauge
                  value={cvScore}
                  label={`${cvScore}%`}
                  sub="Özgeçmiş Gücü"
                  color="#8B5CF6"
                />
                <RadialGauge
                  value={atsScore}
                  label={`${atsScore}%`}
                  sub="ATS Skoru"
                  color="#EC4899"
                />
                {totalModules > 0 && (
                  <RadialGauge
                    value={pathProgress}
                    label={`${pathProgress}%`}
                    sub="Yol İlerlemesi"
                    color="#10B981"
                  />
                )}
              </div>
            </div>

            {/* Quick KPI stats cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                icon={FileText}
                label="Toplam Analiz"
                value={analyzedCvCount}
                sub="cihaz içi işlem"
                color="#6366F1"
                href="/forge"
              />
              <MetricCard
                icon={Briefcase}
                label="Başvurularım"
                value={appliedJobIds.length}
                sub="kayıtlı başvuru"
                color="#EC4899"
                href="/jobs"
              />
              <MetricCard
                icon={Bookmark}
                label="Kaydedilenler"
                value={savedJobIds.length}
                sub="takip edilen ilan"
                color="#F59E0B"
                href="/jobs"
              />
              <MetricCard
                icon={TrendingUp}
                label="Kayıtlı Yollar"
                value={enrolledPathIds.length}
                sub="aktif geliştirme"
                color="#10B981"
                href="/paths"
              />
            </div>

            {/* Bottom grids: Applications / Activity / CV improvements */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
              
              {/* CV Quality improvements */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b pb-4 dark:border-white/5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-[#C084FC]" />
                    Özgeçmiş Sağlık Durumu & Öneriler
                  </h3>
                  <Link href="/resume" className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-[#C084FC] hover:underline flex items-center gap-0.5">
                    Düzenle <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {feedback?.improvements && feedback.improvements.length > 0 ? (
                    feedback.improvements.slice(0, 3).map((imp: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] text-rose-800 dark:text-rose-300 text-xs"
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-300 leading-normal">{imp}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] text-emerald-800 dark:text-emerald-300 text-xs">
                      <Award className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="text-slate-600 dark:text-slate-300 leading-normal">
                        Özgeçmişinizde herhangi bir yapısal hata bulunamadı. Harika bir iş!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent activity log */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between border-b pb-4 dark:border-white/5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
                    <History className="w-4 h-4 text-purple-600 dark:text-[#C084FC]" />
                    Son Oturum İşlemleri
                  </h3>
                </div>

                {recentItems.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">İşlem geçmişi boş.</p>
                ) : (
                  <ul className="space-y-3">
                    {recentItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 text-xs p-3 rounded-2xl bg-white/[0.01] border dark:border-white/5"
                      >
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                            {item.title}
                          </p>
                          <span className="text-[10px] text-slate-500 block">
                            {item.summary}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {new Date(item.createdAt).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Jobs lists: Saved / Applied */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Applied jobs */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white border-b pb-4 dark:border-white/5 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Aktif Başvurularım
                </h3>

                {appliedJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Henüz bir pozisyona başvurmadınız.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {appliedJobs.slice(0, 4).map((job) => {
                      const co = getCompany(job.companyId);
                      return (
                        <li key={job.id}>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl p-3 border border-slate-100/60 dark:border-white/5 bg-white/[0.01] hover:bg-purple-500/[0.02] transition-colors"
                          >
                            <div className="text-left">
                              <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                                {job.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {co?.name} · {job.location}
                              </p>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border dark:border-emerald-500/10">
                              Başvuruldu
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Saved jobs */}
              <div className="glass-panel p-6 rounded-3xl space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white border-b pb-4 dark:border-white/5 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  Kaydedilen İlanlar
                </h3>

                {savedJobs.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">
                    Henüz kaydedilen ilan yok.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {savedJobs.slice(0, 4).map((job) => {
                      const co = getCompany(job.companyId);
                      return (
                        <li key={job.id}>
                          <Link
                            href={`/jobs/${job.id}`}
                            className="flex items-center justify-between gap-3 rounded-2xl p-3 border border-slate-100/60 dark:border-white/5 bg-white/[0.01] hover:bg-purple-500/[0.02] transition-colors"
                          >
                            <div className="text-left">
                              <h4 className="font-bold text-slate-800 dark:text-white text-xs">
                                {job.title}
                              </h4>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {co?.name} · {job.workMode}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
