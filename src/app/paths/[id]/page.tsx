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

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const path = getPath(id);
  if (!path) notFound();

  const { enrolledPathIds, completedModuleIds, enrollPath, toggleModule } = useCareerStore();
  const enrolled = enrolledPathIds.includes(path.id);
  const doneCount = path.modules.filter((m) => completedModuleIds.includes(m.id)).length;
  const progress = Math.round((doneCount / path.modules.length) * 100);

  return (
    <div className="px-4 md:px-8 pb-20 pt-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/paths"
          className="inline-flex items-center gap-1.5 text-sm text-muted-steel hover:text-cosmic-teal mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All paths
        </Link>

        <div className="glass-panel rounded-3xl p-6 md:p-8 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="soft">{path.track}</Badge>
            <Badge>{path.difficulty}</Badge>
            {enrolled && <Badge variant="accent">Enrolled</Badge>}
          </div>
          <h1 className="font-display text-3xl font-semibold mb-3">{path.title}</h1>
          <p className="text-muted-steel leading-relaxed max-w-2xl">{path.summary}</p>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-muted-steel">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {path.durationWeeks} weeks
            </span>
            <span>{path.modules.length} modules</span>
            {enrolled && <span className="text-cosmic-teal font-semibold">{progress}% complete</span>}
          </div>

          {enrolled && (
            <div className="mt-4 h-2 rounded-full bg-black/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cosmic-teal transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5 mt-6">
            {path.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>

          <div className="mt-8">
            {!enrolled ? (
              <Button
                variant="accent"
                onClick={() => {
                  enrollPath(path.id);
                  toast.success("Enrolled — modules unlocked on your dashboard");
                }}
              >
                Enroll in this path
              </Button>
            ) : (
              <p className="text-sm text-muted-steel">
                You&apos;re enrolled. Check off modules as you complete them.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-display font-semibold text-xl mb-3">Outcomes</h2>
          <ul className="grid sm:grid-cols-3 gap-3">
            {path.outcomes.map((o) => (
              <li key={o} className="glass-panel rounded-2xl p-4 text-sm leading-relaxed">
                {o}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="font-display font-semibold text-xl mb-3">Modules</h2>
        <div className="space-y-3">
          {path.modules.map((mod, i) => {
            const done = completedModuleIds.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={cn(
                  "glass-panel rounded-2xl p-5 flex gap-4 items-start transition-colors",
                  done && "border-cosmic-teal/20"
                )}
              >
                <button
                  disabled={!enrolled}
                  onClick={() => {
                    toggleModule(mod.id);
                    toast.message(done ? "Marked incomplete" : "Module complete");
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
                    <h3 className="font-semibold">{mod.title}</h3>
                    <span className="text-xs text-muted-steel">{mod.durationHours}h</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {mod.topics.map((t) => (
                      <Badge key={t} variant="soft">
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
