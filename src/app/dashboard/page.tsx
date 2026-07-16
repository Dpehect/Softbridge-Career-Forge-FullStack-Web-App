"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Bookmark, FileText, Sparkles, Briefcase,
  Anvil, Brain, TrendingUp, Clock, CheckCircle2, History,
  AlertTriangle, Lightbulb,
} from "lucide-react";
import { jobs } from "@/data/jobs";
import { careerPaths } from "@/data/paths";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { formatSalary } from "@/lib/utils";
import { generateCvFeedback } from "@/lib/forge";
import { useTranslation } from "@/lib/forge/i18n";
import { cn } from "@/lib/utils";

// ─── Circular progress ring ───────────────────────────────────────────────────
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
      <p className="font-bold text-sm text-star-white">{label}</p>
      <p className="text-[10px] text-muted-steel">{sub}</p>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color, href }: {
  icon: React.ElementType; label: string; value: string | number;
  sub: string; color: string; href?: string;
}) {
  const inner = (
    <div className="glass-panel rounded-2xl p-5 space-y-3 h-full hover:scale-[1.02] transition-transform group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-black text-star-white">{value}</p>
        <p className="text-sm font-semibold text-star-white/80 mt-0.5">{label}</p>
        <p className="text-xs text-muted-steel mt-0.5">{sub}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    savedJobIds, appliedJobIds, enrolledPathIds, completedModuleIds,
    resume, forgeParsedCv, forgeHistory, forgeBackups,
  } = useCareerStore();

  const { lang } = useTranslation();
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

  const cvScore = feedback?.overallScore ?? 0;
  const atsScore = feedback?.atsScore ?? 0;
  const pathProgress = totalModules > 0 ? Math.round((doneModules / totalModules) * 100) : 0;

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED" }}>
              <Brain className="w-3.5 h-3.5" />
              {isTR ? "Kontrol Paneli" : "Dashboard"}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-star-white">
              {firstName
                ? (isTR ? `Tekrar hoş geldin, ${firstName} 👋` : `Welcome back, ${firstName} 👋`)
                : (isTR ? "Kariyer Merkezi" : "Career HQ")}
            </h1>
            <p className="text-muted-steel mt-2 max-w-xl leading-relaxed">
              {isTR ? "Tüm kariyer aktiviteni tek yerden takip et." : "Track all your career activity in one place."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/forge">
              <Button className="text-white" style={{ background: "linear-gradient(135deg,#6D28D9,#F472B6)", boxShadow: "0 4px 16px rgba(109,40,217,0.35)" }}>
                {isTR ? "Forge'a Git" : "Go to Forge"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/coach">
              <Button variant="outline" className="text-star-white border-cosmic-teal/30 hover:bg-cosmic-teal/8">
                {isTR ? "Koçla Konuş" : "Talk to Coach"}
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Briefcase} label={isTR ? "Başvurular" : "Applications"} value={appliedJobIds.length}
            sub={isTR ? "toplam başvuru" : "total applied"} color="#7C3AED" href="/jobs" />
          <KpiCard icon={Bookmark}  label={isTR ? "Kaydedilenler" : "Saved Jobs"}  value={savedJobIds.length}
            sub={isTR ? "iş ilanı" : "bookmarked roles"} color="#F472B6" href="/jobs" />
          <KpiCard icon={TrendingUp} label={isTR ? "Yollar" : "Career Paths"} value={enrolledPathIds.length}
            sub={isTR ? "kayıtlı yol" : "enrolled paths"} color="#4ADE80" href="/paths" />
          <KpiCard icon={CheckCircle2} label={isTR ? "Modüller" : "Modules"} value={`${doneModules}/${totalModules || 0}`}
            sub={isTR ? "tamamlandı" : "completed"} color="#FB7185" href="/paths" />
        </div>

        {/* CV Health section */}
        <div className="grid lg:grid-cols-[1fr_auto] gap-6">
          <div className="glass-panel rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <FileText className="w-4 h-4 text-cosmic-teal" />
                {isTR ? "CV Durumu" : "CV Status"}
              </h2>
              <div className="flex gap-2">
                <Link href="/forge"><Button size="sm" className="text-white text-xs" style={{ background: "linear-gradient(135deg,#6D28D9,#9333EA)" }}>
                  {isTR ? "Forge" : "Forge"}
                </Button></Link>
                <Link href="/resume"><Button size="sm" variant="outline" className="text-star-white text-xs border-cosmic-teal/20">
                  {isTR ? "Düzenle" : "Edit"}
                </Button></Link>
              </div>
            </div>

            {forgeParsedCv || hasResume ? (
              <>
                <p className="text-sm text-muted-steel">
                  {isTR ? "Aktif profil:" : "Active profile:"}{" "}
                  <span className="font-semibold text-star-white">
                    {forgeParsedCv?.name || resume.fullName || "Unnamed"}
                  </span>
                  {(forgeParsedCv?.title || resume.headline) && (
                    <> · {forgeParsedCv?.title || resume.headline}</>
                  )}
                </p>
                {feedback && <p className="text-sm text-muted-steel leading-relaxed">{feedback.summaryLine}</p>}

                {/* Health alerts */}
                {feedback?.improvements && feedback.improvements.length > 0 && (
                  <div className="space-y-2">
                    {feedback.improvements.slice(0, 3).map((s: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs rounded-xl p-2.5"
                        style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.2)" }}>
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-sunset-coral" />
                        <span className="text-muted-steel">{s}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-start gap-2 text-xs rounded-xl p-3"
                style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
                <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cosmic-teal" />
                <span className="text-muted-steel">
                  {isTR ? "Henüz CV yüklenmedi. Forge'a giderek CV'ni yükle veya oluştur." : "No CV loaded yet. Go to Forge to upload or build your CV."}
                </span>
              </div>
            )}
          </div>

          {/* CV score rings */}
          {feedback && (
            <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center gap-6">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-steel">
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
          <h2 className="font-semibold text-star-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cosmic-teal" />
            {isTR ? "Hızlı Eylemler" : "Quick Actions"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: "/forge",  icon: Anvil,     label: isTR ? "CV Yükle / Analiz Et" : "Upload / Analyze CV",   color: "#7C3AED" },
              { href: "/coach",  icon: Brain,      label: isTR ? "Koçla Konuş" : "Talk to Coach",                  color: "#9333EA" },
              { href: "/jobs",   icon: Briefcase,  label: isTR ? "İş İlanlarına Bak" : "Browse Jobs",              color: "#F472B6" },
              { href: "/paths",  icon: TrendingUp, label: isTR ? "Kariyer Yolları" : "Career Paths",               color: "#4ADE80" },
            ].map((q) => (
              <Link key={q.label} href={q.href}
                className="glass-panel rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.03] transition-transform group">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${q.color}18` }}>
                  <q.icon className="w-4 h-4" style={{ color: q.color }} />
                </div>
                <p className="text-sm font-semibold text-star-white group-hover:text-cosmic-teal transition-colors">{q.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Applications + Saved / History */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Applied */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <CheckCircle2 className="w-4 h-4 text-cosmic-teal" />
                {isTR ? "Başvurularım" : "Applications"}
              </h2>
              <Link href="/jobs" className="text-xs font-semibold text-cosmic-teal hover:underline">
                {isTR ? "İlanlara Bak" : "Browse"}
              </Link>
            </div>
            {appliedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">{isTR ? "Henüz başvuru yok." : "No applications yet."}</p>
            ) : (
              <ul className="space-y-2">
                {appliedJobs.slice(0, 5).map((job) => {
                  const co = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-cosmic-teal/5 transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-star-white">{job.title}</p>
                          <p className="text-xs text-muted-steel">{co?.name} · {formatSalary(job.salaryMin, job.salaryMax, job.currency)}</p>
                        </div>
                        <Badge variant="accent" className="shrink-0">{isTR ? "Başvuruldu" : "Applied"}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Saved */}
          <section className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2 text-star-white">
                <Bookmark className="w-4 h-4 text-sunset-coral" />
                {isTR ? "Kaydedilenler" : "Saved Roles"}
              </h2>
            </div>
            {savedJobs.length === 0 ? (
              <p className="text-sm text-muted-steel">{isTR ? "Henüz kaydedilen ilan yok." : "No saved roles yet."}</p>
            ) : (
              <ul className="space-y-2">
                {savedJobs.slice(0, 5).map((job) => {
                  const co = getCompany(job.companyId);
                  return (
                    <li key={job.id}>
                      <Link href={`/jobs/${job.id}`}
                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-cosmic-teal/5 transition-colors">
                        <div>
                          <p className="font-semibold text-sm text-star-white">{job.title}</p>
                          <p className="text-xs text-muted-steel">{co?.name} · {job.workMode}</p>
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

        {/* History */}
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-star-white">
              <History className="w-4 h-4 text-cosmic-teal" />
              {isTR ? "Geçmiş Analizler" : "Past Analyses"}
            </h2>
            <Link href="/forge#history" className="text-xs font-semibold text-cosmic-teal hover:underline">
              {isTR ? "Forge'da Aç" : "Open in Forge"}
            </Link>
          </div>
          {forgeHistory.length === 0 ? (
            <p className="text-sm text-muted-steel">
              {isTR ? "CV çözümle veya analiz çalıştır — sonuçlar burada görünür." : "Parse a CV or run tools — results will appear here."}
            </p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-2">
              {forgeHistory.slice(0, 6).map((h) => (
                <li key={h.id} className="rounded-xl px-3 py-3 flex items-start gap-3"
                  style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}>
                  <Clock className="w-3.5 h-3.5 text-muted-steel shrink-0 mt-0.5" />
                  <div>
                    <Badge variant="soft" className="mb-1 text-[10px]">{h.action}</Badge>
                    <p className="text-sm text-star-white">{h.summary}</p>
                    <p className="text-[11px] text-muted-steel mt-0.5">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
}
