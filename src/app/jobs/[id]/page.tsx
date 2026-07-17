"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
  Plus,
  AlertTriangle,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { getJob } from "@/data/jobs";
import { getCompany } from "@/data/companies";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeDate, formatSalary, cn } from "@/lib/utils";
import { useCareerStore } from "@/store/useCareerStore";
import { useTranslation } from "@/lib/forge/i18n";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const job = getJob(id);
  if (!job) notFound();

  const company = getCompany(job.companyId);
  const {
    savedJobIds,
    appliedJobIds,
    toggleSaveJob,
    applyToJob,
    resume,
    addSkills,
  } = useCareerStore();
  const { lang } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute skill matches locally
  const matchAnalysis = useMemo(() => {
    if (!resume.skills.length) {
      return {
        score: 0,
        matched: [] as string[],
        missing: job.tags,
      };
    }
    const userSkillsLower = resume.skills.map((s) => s.toLowerCase().trim());
    const matched = job.tags.filter((tag) =>
      userSkillsLower.some((s) => s.includes(tag.toLowerCase()) || tag.toLowerCase().includes(s))
    );
    const missing = job.tags.filter((tag) => !matched.includes(tag));
    const score = Math.round((matched.length / job.tags.length) * 100);

    return {
      score,
      matched,
      missing,
    };
  }, [resume.skills, job.tags]);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-purple-600" />
      </div>
    );
  }

  const saved = savedJobIds.includes(job.id);
  const applied = appliedJobIds.includes(job.id);

  const handleAddMissingSkill = (skill: string) => {
    const added = addSkills([skill]);
    if (added) {
      toast.success(`“${skill}” yeteneği özgeçmişinize eklendi!`);
    } else {
      toast.info(`“${skill}” zaten özgeçmişinizde var.`);
    }
  };

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-5xl mx-auto space-y-6 text-left">
        
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "tr" ? "İş ilanlarına dön" : "Back to jobs"}
        </Link>

        {/* Dynamic Split View: Job Details vs ATS Fit Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
          
          {/* Left panel: Core Job Sheet */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6">
            
            {/* Header section */}
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center font-bold text-lg text-purple-600 shrink-0">
                {company?.logo ?? "??"}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {job.featured && <Badge variant="accent">{lang === "tr" ? "Öne Çıkan" : "Featured"}</Badge>}
                  <Badge>{job.seniority}</Badge>
                  <Badge variant="soft">{job.type}</Badge>
                </div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {job.title}
                </h1>
                <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
                    {job.applicants} başvuru
                  </span>
                </p>
              </div>
            </div>

            {/* Info Row */}
            <div className="flex flex-wrap justify-between items-center gap-4 border-y dark:border-white/5 py-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Tahmini Maaş Aralığı
                </span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    {job.type === "Contract" ? "/saat" : "/yıl"}
                  </span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Yayınlanma Tarihi
                </span>
                <span className="text-xs text-slate-500">
                  {formatRelativeDate(job.postedAt)}
                </span>
              </div>
            </div>

            {/* Job Description Sections */}
            <div className="space-y-6 pt-2">
              <section className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Rol Tanımı
                </h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {job.description}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Temel Sorumluluklar
                </h3>
                <ul className="space-y-1.5 pl-1">
                  {job.responsibilities.map((resp) => (
                    <li key={resp} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                      <span className="text-purple-600 dark:text-[#C084FC] shrink-0 mt-1">•</span>
                      <span className="leading-relaxed">{resp}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                  Gereksinimler
                </h3>
                <ul className="space-y-1.5 pl-1">
                  {job.requirements.map((req) => (
                    <li key={req} className="text-xs md:text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                      <span className="text-purple-600 dark:text-[#C084FC] shrink-0 mt-1">•</span>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {company && (
                <section className="rounded-2xl bg-slate-50 dark:bg-white/[0.01] border dark:border-white/5 p-5 space-y-2.5">
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">
                    Şirket Hakkında
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {company.description}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sektör: {company.industry} · Boyut: {company.size} · Merkez: {company.location}
                  </p>
                </section>
              )}
            </div>
          </div>

          {/* Right panel: Live ATS Fit & Actions Panel */}
          <aside className="space-y-4 lg:sticky lg:top-24">
            
            {/* ATS Match Gauge card */}
            <div className="glass-panel p-6 rounded-3xl space-y-5 border-purple-200/50 dark:border-purple-500/10">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  ATS Rol Eşleşme Analizi
                </span>
                
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-600 text-purple-700 dark:border-purple-400 dark:text-purple-300 flex items-center justify-center font-black text-lg">
                    {matchAnalysis.score}%
                  </div>
                  <div className="text-left space-y-0.5">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Uyum Skoru
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Özgeçmişinizin ilan anahtar kelimeleriyle eşleşme oranı.
                    </p>
                  </div>
                </div>
              </div>

              {/* Matched vs Missing checklist */}
              <div className="space-y-4 pt-3 border-t dark:border-white/5 text-xs">
                {/* Matched skills */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Eşleşen Beceriler ({matchAnalysis.matched.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {matchAnalysis.matched.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-500/20 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                    {matchAnalysis.matched.length === 0 && (
                      <span className="text-slate-400">Eşleşen yetenek bulunamadı.</span>
                    )}
                  </div>
                </div>

                {/* Missing skills with Add action */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Eksik Beceriler ({matchAnalysis.missing.length})
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {matchAnalysis.missing.map((s) => (
                      <div
                        key={s}
                        className="flex items-center justify-between p-2 rounded-xl bg-amber-500/[0.02] border border-amber-500/10 text-[11px]"
                      >
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{s}</span>
                        <button
                          onClick={() => handleAddMissingSkill(s)}
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> CV'ye Ekle
                        </button>
                      </div>
                    ))}
                    {matchAnalysis.missing.length === 0 && (
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/[0.02] border border-emerald-500/10 text-emerald-800 dark:text-emerald-300">
                        <Award className="w-4 h-4 shrink-0" />
                        <span>Mükemmel! İlan için tüm yeteneklere sahipsiniz.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Application button card */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <Button
                variant="primary"
                className="w-full h-11 shadow-lg"
                disabled={applied}
                onClick={() => {
                  applyToJob(job.id);
                  toast.success("Başvurunuz başarıyla kaydedildi!");
                }}
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Başvuruldu
                  </>
                ) : (
                  "Hemen Başvur"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-850"
                onClick={() => {
                  toggleSaveJob(job.id);
                  toast.success(saved ? "İlan kaydedilenlerden kaldırıldı." : "İlan kaydedildi.");
                }}
              >
                {saved ? "Kaydetmeyi Bırak" : "İlanı Kaydet"}
              </Button>
            </div>
          </aside>
          
        </div>

      </div>
    </div>
  );
}
