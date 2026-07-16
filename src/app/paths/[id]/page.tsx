"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Circle, Clock } from "lucide-react";
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
  const { t, lang } = useTranslation();

  const enrolled = enrolledPathIds.includes(path.id);
  const doneCount = path.modules.filter((m) => completedModuleIds.includes(m.id)).length;
  const progress = path.modules.length > 0 ? Math.round((doneCount / path.modules.length) * 100) : 0;

  // SVG circle calculations
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/paths"
          className="inline-flex items-center gap-1.5 text-sm text-muted-steel hover:text-cosmic-teal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {lang === "tr" ? "Tüm Kariyer Yolları" : "All paths"}
        </Link>

        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-6 text-star-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge variant="soft">{path.track}</Badge>
                <Badge>{path.difficulty}</Badge>
                {enrolled && <Badge variant="accent">{lang === "tr" ? "Kayıtlı" : "Enrolled"}</Badge>}
              </div>
              <h1 className="font-display text-3xl font-bold text-star-white">{path.title}</h1>
              <p className="text-muted-steel leading-relaxed max-w-2xl text-sm">{path.summary}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-steel">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {path.durationWeeks} {lang === "tr" ? "hafta" : "weeks"}
                </span>
                <span>{path.modules.length} {lang === "tr" ? "modül" : "modules"}</span>
                {enrolled && <span className="text-cosmic-teal font-semibold">{progress}% {lang === "tr" ? "tamamlandı" : "complete"}</span>}
              </div>
            </div>

            {/* Circular Gauge */}
            {enrolled && (
              <div className="w-20 h-20 relative flex items-center justify-center shrink-0 mx-auto md:mx-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-black/5 dark:stroke-white/5 fill-transparent"
                    strokeWidth="5"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    className="stroke-cosmic-teal fill-transparent transition-all duration-500"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="absolute text-xs font-extrabold">{progress}%</span>
              </div>
            )}
          </div>

          {enrolled && (
            <div className="mt-6 h-2 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cosmic-teal transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-6">
            {path.skills.map((s) => (
              <Badge key={s} variant="soft" className="text-muted-steel">{s}</Badge>
            ))}
          </div>

          <div className="mt-8 border-t border-black/5 dark:border-white/5 pt-6">
            {!enrolled ? (
              <Button
                variant="accent"
                onClick={() => {
                  enrollPath(path.id);
                  toast.success(lang === "tr" ? "Yola kaydolundu! Modüller panelinizde açıldı." : "Enrolled — modules unlocked on your dashboard");
                }}
              >
                {lang === "tr" ? "Bu Kariyer Yoluna Başla" : "Enroll in this path"}
              </Button>
            ) : (
              <p className="text-sm text-muted-steel">
                {lang === "tr" 
                  ? "Bu yola kayıtlısınız. Modülleri tamamladıkça sol taraflarındaki kutuları işaretleyin." 
                  : "You're enrolled. Check off modules as you complete them."}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 text-star-white">
          <h2 className="font-display font-semibold text-xl mb-3">{lang === "tr" ? "Kazanımlar" : "Outcomes"}</h2>
          <ul className="grid sm:grid-cols-3 gap-3">
            {path.outcomes.map((o) => (
              <li key={o} className="glass-panel rounded-2xl p-4 text-xs leading-relaxed text-muted-steel">
                {o}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="font-display font-semibold text-xl mb-3 text-star-white">{lang === "tr" ? "Eğitim Modülleri" : "Modules"}</h2>
        <div className="space-y-3 text-star-white">
          {path.modules.map((mod, i) => {
            const done = completedModuleIds.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={cn(
                  "glass-panel rounded-2xl p-5 flex gap-4 items-start transition-colors",
                  done && "border-cosmic-teal/20 bg-cosmic-teal/5"
                )}
              >
                <button
                  disabled={!enrolled}
                  onClick={() => {
                    toggleModule(mod.id);
                    toast.message(done 
                      ? (lang === "tr" ? "Tamamlanmadı olarak işaretlendi" : "Marked incomplete") 
                      : (lang === "tr" ? "Modül tamamlandı!" : "Module complete")
                    );
                  }}
                  className={cn(
                    "mt-0.5 shrink-0 rounded-full p-0.5 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40",
                    done ? "text-cosmic-teal" : "text-muted-steel"
                  )}
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-steel">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold text-sm">{mod.title}</h3>
                    <span className="text-xs text-muted-steel">{mod.durationHours}h</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mod.topics.map((t) => (
                      <Badge key={t} variant="soft" className="text-[10px]">
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
  );
}
