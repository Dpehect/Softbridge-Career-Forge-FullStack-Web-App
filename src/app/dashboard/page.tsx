"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Bookmark, FileText, Sparkles, Briefcase,
  Anvil, Brain, TrendingUp, Clock, CheckCircle2, History,
  AlertTriangle, Lightbulb, FileSearch, Target,
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
import { ErrorAlert } from "@/components/ErrorAlert";
import { AtsProgressBar } from "@/components/AtsProgressBar";
import { useCareerStore } from "@/store/useCareerStore";
import { formatSalary } from "@/lib/utils";
import { generateCvFeedback, CAREER_GOALS, buildJourneyInsight, getGoal } from "@/lib/forge";
import { useTranslation } from "@/lib/forge/i18n";
import { cn } from "@/lib/utils";

const glass =
  "rounded-2xl border border-white/10 bg-white/60 backdrop-blur-sm shadow-sm dark:bg-white/5 dark:border-white/10";

function CircleRing({
  value, max = 100, size = 72, stroke = 6,
  color = "#7C3AED", label, sub,
}: {
  value: number; max?: number; size?: number; stroke?: number;
  color?: string; label: string; sub: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = circ * pct;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <p className="font-bold tracking-tight text-sm text-star-white">{label}</p>
      <p className="text-[10px] text-slate-600 dark:text-muted-steel">{sub}</p>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color, href }: {
  icon: React.ElementType; label: string; value: string | number;
  sub: string; color: string; href?: string;
}) {
  const inner = (
    <div className={cn(glass, "p-5 space-y-3 h-full hover:scale-[1.02] transition-transform group")}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold tracking-tighter text-star-white tabular-nums">{value}</p>
        <p className="text-sm font-semibold text-star-white/80 mt-0.5">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const {
    savedJobIds, appliedJobIds, enrolledPathIds, completedModuleIds,
    resume, forgeParsedCv, forgeHistory, forgeAnalysis,
    careerGoalId, setCareerGoalId, lastAnalysisMeta,
  } = useCareerStore();

  const { t, lang } = useTranslation();
  const isTR = lang === "tr";
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const savedJobs = useMemo(() => jobs.filter((j) => savedJobIds.includes(j.id)), [savedJobIds]);
  const appliedJobs = useMemo(() => jobs.filter((j) => appliedJobIds.includes(j.id)), [appliedJobIds]);
  const enrolledPaths = useMemo(() => careerPaths.filter((p) => enrolledPathIds.includes(p.id)), [enrolledPathIds]);
  const totalModules = enrolledPaths.reduce((n, p) => n + p.modules.length, 0);
  const doneModules = enrolledPaths.reduce(
    (n, p) => n + p.modules.filter((m) => completedModuleIds.includes(m.id)).length, 0
  );

  const hasResume = Boolean(resume.fullName || resume.headline || resume.summary) || resume.skills.length > 0;
  const firstName = resume.fullName?.trim().split(" ")[0] || forgeParsedCv?.name?.split(" ")[0];

  const feedback = useMemo(() => {
    if (forgeParsedCv) return generateCvFeedback(forgeParsedCv);
    if (hasResume) return generateCvFeedback({
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
        forgeHistory.filter((h) => h.action === "parse" || h.action === "analyze" || h.action === "ats").length,
        forgeParsedCv || hasResume ? 1 : 0
      );

  const latestAtsScore = USE_MOCK_DATA
    ? MOCK_ATS_ANALYSIS.atsScore
    : forgeAnalysis?.atsScore ?? feedback?.atsScore ?? null;

  const recentItems = USE_MOCK_DATA
    ? MOCK_RECENT_ACTIVITY
    : forgeHistory.slice(0, 6).map((h) => ({
        id: h.id,
        title: h.summary,
        summary: h.action,
        createdAt: h.createdAt,
      }));

  const isEmpty =
    !USE_MOCK_DATA &&
    !forgeParsedCv &&
    !hasResume &&
    forgeHistory.length === 0 &&
    appliedJobIds.length === 0;

  const cvScore = feedback?.overallScore ?? (USE_MOCK_DATA ? MOCK_ATS_ANALYSIS.atsScore : 0);
  const atsScore = latestAtsScore ?? 0;
  const pathProgress = totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;

  const journey = useMemo(
    () =>
      buildJourneyInsight({
        cv: forgeParsedCv,
        goalId: careerGoalId,
        atsScore: latestAtsScore,
        feedback,
        missingFromMatch: forgeAnalysis?.missingSkills,
      }),
    [forgeParsedCv, careerGoalId, latestAtsScore, feedback, forgeAnalysis]
  );
  const activeGoal = getGoal(careerGoalId);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold bg-purple-100/80 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300"
            >
              <Brain className="w-3.5 h-3.5" />
              {t("navDashboard")}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tighter text-star-white">
              {firstName ? `Kariyer kokpitin, ${firstName} 👋` : "Kariyer Kokpiti"}
            </h1>
            <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">
              Bugün neyi iyileştirmelisin? Analiz bitti demiyoruz — hedefe giden bir sonraki adımı
              gösteriyoruz.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/forge">
              <Button variant="primary" className="gap-1 shadow-lg">
                Yolculuğa devam <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/resume">
              <Button variant="ghostBorder">{t("openWorkspace")}</Button>
            </Link>
          </div>
        </div>

        {/* Anlamlı özet kartı — veri değil ilişki */}
        {(lastAnalysisMeta || forgeParsedCv) && (
          <section className={cn(glass, "p-6 space-y-3 border-purple-200/40 dark:border-purple-500/10")}>
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-[#C084FC]">
              Kariyer özeti
            </p>
            <p className="text-sm md:text-base font-semibold text-star-white leading-relaxed">
              <strong>
                {lastAnalysisMeta?.at
                  ? new Date(lastAnalysisMeta.at).toLocaleString("tr-TR")
                  : "Son oturum"}
              </strong>{" "}
              tarihinde{" "}
              <strong>
                {lastAnalysisMeta?.targetTitle ||
                  forgeParsedCv?.title ||
                  activeGoal?.labelTr ||
                  "hedef rolünüz"}
              </strong>{" "}
              hedefiyle analiz yaptınız. Puanınız:{" "}
              <strong className="text-purple-600 dark:text-[#C084FC]">%{journey.atsScore}</strong>.
              {journey.missingSkills[0] ? (
                <>
                  {" "}
                  İyileştirmek için{" "}
                  <strong>“{journey.missingSkills.slice(0, 2).join(", ")}”</strong> eklemelisiniz.
                </>
              ) : (
                <> Profiliniz hedefe yakın — başvuru adımına geçebilirsiniz.</>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/resume?from=analiz"
                className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-bold text-white transition-all hover:opacity-95 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                  boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
                }}
              >
                Düzenleyicide iyileştir
              </Link>
              <Link
                href="/jobs"
                className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                İlanlara bak
              </Link>
            </div>
          </section>
        )}

        {/* Goal card + development progress */}
        <section className={cn(glass, "p-6 md:p-8 space-y-6")}>
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-500/15 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-purple-600 dark:text-[#C084FC]" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Hedef kartı
                </p>
                <h2 className="font-extrabold tracking-tighter text-xl text-star-white">
                  Hedef: {activeGoal ? activeGoal.labelTr : "Henüz seçilmedi"}
                </h2>
                <p className="text-sm text-slate-500 mt-1 max-w-lg">
                  Hedefini seç — her girişte “bugün neyi kapatmalıyım?” sorusuna cevap alırsın.
                </p>
              </div>
            </div>
            <label className="block text-sm">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Hedef rol
              </span>
              <select
                value={careerGoalId ?? ""}
                onChange={(e) => setCareerGoalId(e.target.value || null)}
                className="h-10 rounded-xl border border-slate-200 bg-white/80 px-3 text-sm font-semibold text-slate-800 dark:bg-panel dark:border-white/10 dark:text-star-white min-w-[200px]"
              >
                {CAREER_GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.labelTr}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm font-semibold text-star-white">
                Kariyer hedefine yaklaşma
              </p>
              <p className="text-sm font-extrabold tabular-nums text-purple-600 dark:text-[#C084FC]">
                %{journey.progressPct}
              </p>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-purple-500/15">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${journey.progressPct}%`,
                  background: "linear-gradient(90deg, #6B21A8, #A855F7, #F97316)",
                }}
              />
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Kariyer hedefine{" "}
              <strong className="text-star-white">%{journey.progressPct}</strong> yaklaştın.
              {journey.readySkills.length > 0 && (
                <>
                  {" "}
                  Şu an{" "}
                  <strong className="text-star-white">
                    {journey.readySkills.slice(0, 3).join(", ")}
                    {journey.readySkills.length > 3 ? "…" : ""}
                  </strong>{" "}
                  tamam
                  {journey.missingSkills[0]
                    ? `; sırada “${journey.missingSkills[0]}” yeteneğini özgeçmişine ekle.`
                    : "."}
                </>
              )}
              {journey.readySkills.length === 0 && (
                <> CV yükleyip becerileri görünür kıldıkça bu çubuk dolacak.</>
              )}
            </p>
            {journey.missingSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {journey.missingSkills.slice(0, 6).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-300/60 bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300"
                  >
                    {isTR ? "Eksik: " : "Gap: "}
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/resume"
                className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-bold text-white transition-all hover:opacity-95 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                  boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
                }}
              >
                {isTR ? "Bugün: CV'ye ekle" : "Today: add to CV"}
              </Link>
              <Link
                href="/coach"
                className="inline-flex h-9 items-center gap-1 rounded-xl px-3 text-xs font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200"
              >
                {isTR ? "Koç ile planla" : "Plan with Coach"}
              </Link>
            </div>
          </div>
        </section>

        {USE_MOCK_DATA && (
          <ErrorAlert
            title={isTR ? "Mock veri modu" : "Mock data mode"}
            message={
              isTR
                ? "USE_MOCK_DATA açık — gerçek Ollama yanıtı yerine sabit veriler gösteriliyor."
                : "USE_MOCK_DATA is on — showing fixtures instead of live Ollama responses."
            }
          />
        )}

        {/* Empty state — dashed guide box */}
        {isEmpty && (
          <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl text-center space-y-4 bg-white/40 dark:bg-white/[0.02] dark:border-slate-600">
            <div
              className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.12)" }}
            >
              <FileSearch className="w-7 h-7 text-purple-600 dark:text-[#C084FC]" />
            </div>
            <h2 className="font-display text-xl md:text-2xl font-extrabold tracking-tighter text-star-white">
              Henüz bir analiz başlatmadınız
            </h2>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
              Kariyer yolculuğuna başlamak için ilk CV&apos;nizi yükleyin. Puan, eksik yetenekler
              ve sıradaki adımlar sizi bekliyor.
            </p>
            <Link
              href="/forge"
              className="inline-flex h-11 items-center gap-2 rounded-2xl px-6 text-sm font-bold text-white transition-all hover:scale-[1.02]"
              style={{
                background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
                boxShadow: "0 4px 14px rgba(107, 33, 168, 0.3)",
              }}
            >
              İlk CV&apos;mi yükle <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Hızlı istatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KpiCard
            icon={FileText}
            label="Analiz Edilen CV"
            value={analyzedCvCount}
            sub="toplam işlem"
            color="#6B21A8"
            href="/forge"
          />
          <div className={cn(glass, "p-5 space-y-4 h-full")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <AtsProgressBar
              score={latestAtsScore ?? journey.atsScore}
              label="ATS Uyumluluk Skoru"
            />
            <p className="text-xs text-slate-500">
              {latestAtsScore != null || forgeParsedCv
                ? "son analiz sonucu"
                : "Henüz analiz edilmedi"}
            </p>
          </div>
          <div className={cn(glass, "p-5 space-y-3 h-full")}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-star-white">Önerilen Yetenekler</p>
            {journey.missingSkills.length === 0 ? (
              <p className="text-xs text-slate-500">
                Hedef yetenekleriniz güçlü görünüyor. Yeni ilanlara bakın.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {journey.missingSkills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-[#C084FC]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
            <Link href="/forge" className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-[#C084FC] hover:underline">
              Detaylı çözüm yolculuğu →
            </Link>
          </div>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Briefcase} label={isTR ? "Başvurular" : "Applications"} value={appliedJobIds.length}
            sub={isTR ? "toplam başvuru" : "total applied"} color="#7C3AED" href="/jobs" />
          <KpiCard icon={Bookmark} label={isTR ? "Kaydedilenler" : "Saved Jobs"} value={savedJobIds.length}
            sub={isTR ? "iş ilanı" : "bookmarked roles"} color="#F472B6" href="/jobs" />
          <KpiCard icon={TrendingUp} label={isTR ? "Yollar" : "Career Paths"} value={enrolledPathIds.length}
            sub={isTR ? "kayıtlı yol" : "enrolled paths"} color="#4ADE80" href="/paths" />
          <KpiCard icon={CheckCircle2} label={isTR ? "Modüller" : "Modules"} value={`${doneModules}/${totalModules || 0}`}
            sub={isTR ? "tamamlandı" : "completed"} color="#FB7185" href="/paths" />
        </div>

        {/* Recent activity */}
        <section className={cn(glass, "rounded-3xl p-6")}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold tracking-tight flex items-center gap-2 text-star-white">
              <History className="w-4 h-4 text-cosmic-teal" />
              {t("recentActivity")}
            </h2>
            <Link href="/forge#history" className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-[#C084FC] hover:underline">
              {isTR ? "Forge'da Aç" : "Open in Forge"}
            </Link>
          </div>
          {recentItems.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-muted-steel">
              {isTR
                ? "CV çözümle veya analiz çalıştır — sonuçlar burada görünür."
                : "Parse a CV or run tools — results will appear here."}
            </p>
          ) : (
            <ul className="space-y-2">
              {recentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl px-3 py-3 border border-white/10 bg-white/30 dark:bg-white/[0.03]"
                >
                  <Clock className="w-3.5 h-3.5 text-muted-steel shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-star-white truncate">{item.title}</p>
                    <p className="text-xs text-slate-600 dark:text-muted-steel mt-0.5">
                      {item.summary}
                      {" · "}
                      {new Date(item.createdAt).toLocaleString(isTR ? "tr-TR" : "en-US")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CV Health */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6">
          <div className={cn(glass, "rounded-3xl p-6 space-y-4")}>
            <div className="flex items-center justify-between">
              <h2 className="font-bold tracking-tight flex items-center gap-2 text-star-white">
                <FileText className="w-4 h-4 text-cosmic-teal" />
                {isTR ? "CV Durumu" : "CV Status"}
              </h2>
              <div className="flex gap-2">
                <Link href="/forge">
                  <Button size="sm" variant="primary" className="text-xs">
                    Forge
                  </Button>
                </Link>
                <Link href="/resume">
                  <Button size="sm" variant="ghostBorder" className="text-xs">
                    {isTR ? "Düzenle" : "Edit"}
                  </Button>
                </Link>
              </div>
            </div>

            {forgeParsedCv || hasResume || USE_MOCK_DATA ? (
              <>
                <p className="text-sm text-slate-600 dark:text-muted-steel">
                  {isTR ? "Aktif profil:" : "Active profile:"}{" "}
                  <span className="font-semibold text-star-white">
                    {USE_MOCK_DATA
                      ? MOCK_ATS_ANALYSIS.candidateName
                      : forgeParsedCv?.name || resume.fullName || "Unnamed"}
                  </span>
                  {(forgeParsedCv?.title || resume.headline || USE_MOCK_DATA) && (
                    <> · {USE_MOCK_DATA ? MOCK_ATS_ANALYSIS.targetRole : forgeParsedCv?.title || resume.headline}</>
                  )}
                </p>
                {feedback && (
                  <p className="text-sm text-slate-600 dark:text-muted-steel leading-relaxed">
                    {feedback.summaryLine}
                  </p>
                )}
                {USE_MOCK_DATA && (
                  <p className="text-sm text-slate-600 dark:text-muted-steel leading-relaxed">
                    {MOCK_ATS_ANALYSIS.feedback}
                  </p>
                )}
                {feedback?.improvements && feedback.improvements.length > 0 && (
                  <div className="space-y-2">
                    {feedback.improvements.slice(0, 3).map((s: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs rounded-xl p-2.5"
                        style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)" }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sunset-coral" />
                        <span className="text-slate-600 dark:text-muted-steel">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex items-start gap-2 text-xs rounded-xl p-3"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cosmic-teal" />
                <span className="text-slate-600 dark:text-muted-steel">{t("emptyDashBody")}</span>
              </div>
            )}
          </div>

          {(feedback || USE_MOCK_DATA) && (
            <div className={cn(glass, "rounded-3xl p-6 flex flex-col items-center justify-center gap-6")}>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-muted-steel">
                {isTR ? "CV Puanları" : "CV Scores"}
              </p>
              <CircleRing value={cvScore} label={`${cvScore}%`} sub={isTR ? "Genel Puan" : "Overall"} color="#7C3AED" />
              <CircleRing value={atsScore} label={`${atsScore}%`} sub="ATS" color="#F472B6" />
              {totalModules > 0 && (
                <CircleRing value={pathProgress} label={`${pathProgress}%`} sub={isTR ? "Yol İlerlemesi" : "Path Progress"} color="#4ADE80" />
              )}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-bold tracking-tight text-star-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cosmic-teal" />
            {t("quickActions")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/forge", icon: Anvil, label: isTR ? "CV Yükle / Analiz Et" : "Upload / Analyze CV", color: "#6B21A8" },
              { href: "/coach", icon: Brain, label: t("openCoach"), color: "#9333EA" },
              { href: "/jobs", icon: Briefcase, label: isTR ? "İş İlanlarına Bak" : "Browse Jobs", color: "#F472B6" },
              { href: "/paths", icon: TrendingUp, label: isTR ? "Kariyer Yolları" : "Career Paths", color: "#4ADE80" },
            ].map((q) => (
              <Link
                key={q.label}
                href={q.href}
                className={cn(glass, "p-4 flex items-center gap-3 hover:scale-[1.03] transition-transform group")}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${q.color}18` }}
                >
                  <q.icon className="w-4 h-4" style={{ color: q.color }} />
                </div>
                <p className="text-sm font-semibold text-star-white group-hover:text-purple-600 dark:group-hover:text-[#C084FC] transition-colors">
                  {q.label}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className={cn(glass, "rounded-3xl p-6")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold tracking-tight flex items-center gap-2 text-star-white">
                <CheckCircle2 className="w-4 h-4 text-cosmic-teal" />
                {isTR ? "Başvurularım" : "Applications"}
              </h2>
              <Link href="/jobs" className="text-xs font-semibold text-purple-600 hover:text-purple-700 dark:text-[#C084FC] hover:underline">
                {isTR ? "İlanlara Bak" : "Browse"}
              </Link>
            </div>
            {appliedJobs.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-muted-steel">
                {isTR ? "Henüz başvuru yok." : "No applications yet."}
              </p>
            ) : (
              <ul className="space-y-2">
                {appliedJobs.slice(0, 5).map((job) => {
                  const co = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-cosmic-teal/5 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-star-white">{job.title}</p>
                          <p className="text-xs text-slate-600 dark:text-muted-steel">
                            {co?.name} · {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                          </p>
                        </div>
                        <Badge variant="accent" className="shrink-0">
                          {isTR ? "Başvuruldu" : "Applied"}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className={cn(glass, "rounded-3xl p-6")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold tracking-tight flex items-center gap-2 text-star-white">
                <Bookmark className="w-4 h-4 text-sunset-coral" />
                {isTR ? "Kaydedilenler" : "Saved Roles"}
              </h2>
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-muted-steel">
                {isTR ? "Henüz kaydedilen ilan yok." : "No saved roles yet."}
              </p>
            ) : (
              <ul className="space-y-2">
                {savedJobs.slice(0, 5).map((job) => {
                  const co = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-cosmic-teal/5 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-sm text-star-white">{job.title}</p>
                          <p className="text-xs text-slate-600 dark:text-muted-steel">
                            {co?.name} · {job.workMode}
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
        </div>
      </div>
    </div>
  );
}
