"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ArrowRight, Compass, Plus, Target, TrendingUp } from "lucide-react";
import { AtsProgressBar } from "@/components/AtsProgressBar";
import type { JourneyInsight } from "@/lib/forge/journey";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";

const glass =
  "rounded-2xl border border-white/10 bg-white/60 backdrop-blur-sm shadow-sm dark:bg-white/5";

type Props = {
  insight: JourneyInsight;
  className?: string;
  issues?: string[];
};

/**
 * 3-part solution journey (TR): Mevcut durum → Ne kaybediyorsun → Sırada ne var
 */
export function JourneyResults({ insight, className, issues }: Props) {
  const addSkills = useCareerStore((s) => s.addSkills);
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const topSkills = insight.missingKeywords.slice(0, 3);

  const handleAddSkills = (skills: string[], goToEditor = false) => {
    setAdding(true);
    const n = addSkills(skills);
    setAdding(false);
    if (n === 0) {
      toast.message("Bu yetenekler zaten özgeçmişinizde var.");
    } else {
      toast.success(`${n} yetenek özgeçmişinize eklendi.`);
    }
    if (goToEditor) router.push("/resume");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 1 — Mevcut durum */}
      <section className={cn(glass, "p-5 space-y-4")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bölüm 1 · Mevcut Durum
            </p>
            <h3 className="font-extrabold tracking-tighter text-star-white">
              CV&apos;niz ATS robotları tarafından okunmakta zorlanıyor olabilir
            </h3>
          </div>
        </div>
        <AtsProgressBar score={insight.atsScore} label="ATS Skoru (şimdi)" />
        {(issues?.length || insight.missingKeywords.length > 0) && (
          <ul className="space-y-1.5 text-sm text-slate-500">
            {(issues ?? insight.missingKeywords.slice(0, 4)).map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-rose-500 shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm text-slate-500 leading-relaxed">
          Sadece “puan düşük” demiyoruz — hemen şu 3 düzeltmeyi yapın: anahtar kelimeleri gömün,
          metrik ekleyin, tek sütun ATS formatına geçin.
        </p>
      </section>

      {/* 2 — Ne kaybediyorsun */}
      <section className="rounded-2xl border border-rose-200/80 bg-rose-50/90 p-5 space-y-4 dark:border-rose-500/25 dark:bg-rose-500/10">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
            Bölüm 2 · Ne Kaybediyorsun?
          </p>
        </div>
        <p className="text-sm font-medium text-rose-800 dark:text-rose-200 leading-relaxed">
          {insight.painLineTr}
        </p>
        {topSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
              Puanınızı artırmak için şu yetenekleri ekleyin:
            </p>
            <div className="flex flex-wrap gap-2">
              {insight.missingKeywords.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={adding}
                  onClick={() => handleAddSkills([k])}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 border border-rose-200 text-rose-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-300"
                  title="Özgeçmişe ekle"
                >
                  <Plus className="w-3 h-3" />
                  {k}
                </button>
              ))}
            </div>
            <button
              type="button"
              disabled={adding || topSkills.length === 0}
              onClick={() => handleAddSkills(topSkills, true)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700",
                adding && "opacity-50 pointer-events-none"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
              Önerilen 3 yeteneği Düzenleyiciye Ekle
            </button>
          </div>
        )}
      </section>

      {/* 3 — Sırada ne var */}
      <section className={cn(glass, "p-5 space-y-4 border-indigo-200/50 dark:border-indigo-500/20")}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Bölüm 3 · Sırada Ne Var?
            </p>
            <h3 className="font-extrabold tracking-tighter text-star-white">
              Bunu düzeltirsen işe girme şansın artar
            </h3>
          </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          {insight.gainLineTr}
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-slate-100/80 dark:bg-white/5 p-3">
            <p className="text-2xl font-extrabold tracking-tighter text-star-white">
              {insight.jobsNow}
            </p>
            <p className="text-[11px] text-slate-500">şu an güçlü başvuru</p>
          </div>
          <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3">
            <p className="text-2xl font-extrabold tracking-tighter text-indigo-600">
              {insight.jobsAfter}
            </p>
            <p className="text-[11px] text-slate-500">düzeltme sonrası potansiyel</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-slate-500">
          {insight.nextStepsTr.map((s, i) => (
            <li key={i} className="flex gap-2">
              <Compass className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/resume"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Özgeçmiş Düzenleyici <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/jobs"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200"
          >
            İş ilanlarına başvur
          </Link>
          <Link
            href="/coach"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-500 dark:text-slate-200"
          >
            AI Koç ile STAR çalış
          </Link>
        </div>
      </section>
    </div>
  );
}

export default JourneyResults;
