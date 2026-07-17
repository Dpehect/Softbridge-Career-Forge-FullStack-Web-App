"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Circle, Clock, Award, BookOpen, Flame } from "lucide-react";
import { toast } from "sonner";
import { getPath } from "@/data/paths";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/forge/i18n";

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const path = getPath(id);
  if (!path) notFound();

  const { enrolledPathIds, completedModuleIds, enrollPath, toggleModule } = useCareerStore();
  const { lang } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin border-purple-600" />
      </div>
    );
  }

  const enrolled = enrolledPathIds.includes(path.id);
  const doneCount = path.modules.filter((m) => completedModuleIds.includes(m.id)).length;
  const progress = path.modules.length > 0 ? Math.round((doneCount / path.modules.length) * 100) : 0;

  // SVG circle calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-4xl mx-auto space-y-6 text-left">
        
        {/* Back Link */}
        <Link
          href="/paths"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "tr" ? "Tüm Kariyer Yolları" : "All paths"}
        </Link>

        {/* Path Sheet Header */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-6 text-slate-800 dark:text-slate-200 relative overflow-hidden space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="soft">{path.track}</Badge>
                <Badge>{path.difficulty}</Badge>
                {enrolled && <Badge variant="accent">{lang === "tr" ? "Kayıtlı Rota" : "Enrolled"}</Badge>}
              </div>
              
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {path.title}
              </h1>
              
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-2xl">
                {path.summary}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {path.durationWeeks} hafta süresince
                </span>
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {path.modules.length} öğrenme modülü
                </span>
                {enrolled && (
                  <span className="text-purple-600 dark:text-[#C084FC] font-bold">
                    %{progress} tamamlandı
                  </span>
                )}
              </div>
            </div>

            {/* Circular completion gauge */}
            {enrolled && (
              <div className="w-20 h-20 relative flex items-center justify-center shrink-0 mx-auto md:mx-0 bg-slate-50 dark:bg-white/[0.01] rounded-full border dark:border-white/5 shadow-sm">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-white/5 fill-transparent"
                    strokeWidth="5.5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-purple-600 fill-transparent transition-all duration-500"
                    strokeWidth="5.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-900 dark:text-white">
                  {progress}%
                </span>
              </div>
            )}
          </div>

          {enrolled && (
            <div className="h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1">
            {path.skills.map((s) => (
              <Badge key={s} variant="soft" className="text-slate-600 dark:text-slate-400">
                {s}
              </Badge>
            ))}
          </div>

          <div className="pt-5 border-t dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
            {!enrolled ? (
              <Button
                variant="primary"
                onClick={() => {
                  enrollPath(path.id);
                  toast.success("Kariyer yoluna kaydınız yapıldı!");
                }}
              >
                Bu Kariyer Yoluna Başla
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Flame className="w-4 h-4 text-purple-600" />
                <span>Bu yoldaki modülleri tamamladıkça soldaki kutulardan işaretleyin.</span>
              </div>
            )}
          </div>
        </div>

        {/* Path Outcomes */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Kazanılacak Yetkinlikler
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {path.outcomes.map((o) => (
              <li key={o} className="glass-panel rounded-2xl p-4 text-xs leading-normal text-slate-500">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                </div>
                {o}
              </li>
            ))}
          </ul>
        </div>

        {/* Modules Roadmap */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-slate-900 dark:text-white text-lg">
            Öğrenim Modülleri
          </h2>
          <div className="space-y-3">
            {path.modules.map((mod, i) => {
              const done = completedModuleIds.includes(mod.id);
              return (
                <div
                  key={mod.id}
                  className={cn(
                    "glass-panel rounded-2xl p-5 flex gap-4 items-start transition-all duration-200 border",
                    done ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-slate-200 dark:border-white/5"
                  )}
                >
                  <button
                    disabled={!enrolled}
                    onClick={() => {
                      toggleModule(mod.id);
                      toast.success(
                        done ? "Modül tamamlanmadı olarak işaretlendi." : "Modül tamamlandı!"
                      );
                    }}
                    className={cn(
                      "mt-0.5 shrink-0 rounded-full p-0.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                      done ? "text-emerald-500" : "text-slate-400 dark:text-slate-600 hover:text-purple-600"
                    )}
                    aria-label={done ? "Mark incomplete" : "Mark complete"}
                  >
                    {done ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        MODÜL {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {mod.title}
                      </h3>
                      <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {mod.durationHours} saat
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mod.topics.map((t) => (
                        <Badge key={t} variant="soft" className="text-[9px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
