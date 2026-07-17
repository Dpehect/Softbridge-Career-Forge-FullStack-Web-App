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
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
            <Target className="w-4 h-4 text-purple-600 dark:text-[#C084FC]" />
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

        {/* Danışmanlık kutusu — puan + 3 yetenek + tek tık aksiyon */}
        <div className="rounded-xl border border-purple-200/70 bg-purple-50/90 p-4 space-y-3 dark:border-purple-500/25 dark:bg-purple-500/10">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 leading-relaxed">
            Puanınızı <strong>85</strong> yapmak için şu 3 yeteneği ekleyin:
            {topSkills.length > 0 ? (
              <span className="font-extrabold"> [{topSkills.join(", ")}]</span>
            ) : (
              <span> metrikli maddeler, ATS anahtar kelimeleri ve net unvan.</span>
            )}
          </p>
          {topSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {topSkills.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={adding}
                  onClick={() => handleAddSkills([k])}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 hover:bg-purple-100 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {k}
                </button>
              ))}
              <button
                type="button"
                disabled={adding}
                onClick={() => handleAddSkills(topSkills, true)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white shadow-lg transition-transform hover:scale-102",
                  adding && "opacity-50 pointer-events-none"
                )}
                style={{
                  background: "linear-gradient(135deg, #6B21A8, #A855F7)",
                  boxShadow: "0 4px 12px rgba(107, 33, 168, 0.25)",
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Düzenleyiciye Ekle
              </button>
            </div>
          )}

        </div>
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
        {insight.missingKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {insight.missingKeywords.map((k) => (
              <span
                key={k}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-500/30 dark:text-rose-300"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* 3 — Sırada ne var */}
      <section className={cn(glass, "p-5 space-y-4 border-purple-200/50 dark:border-purple-500/20")}>
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
          <div className="rounded-xl bg-purple-50 dark:bg-purple-500/10 p-3">
            <p className="text-2xl font-extrabold tracking-tighter text-purple-600 dark:text-[#C084FC]">
              {insight.jobsAfter}
            </p>
            <p className="text-[11px] text-slate-500">düzeltme sonrası potansiyel</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-slate-500">
          {insight.nextStepsTr.map((s, i) => (
            <li key={i} className="flex gap-2">
              <Compass className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/resume"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-102"
            style={{
              background: "linear-gradient(135deg, #6B21A8, #A855F7, #F97316)",
              boxShadow: "0 4px 12px rgba(107, 33, 168, 0.3)",
            }}
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
