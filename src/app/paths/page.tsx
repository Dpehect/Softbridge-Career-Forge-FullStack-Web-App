"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Route, Target } from "lucide-react";
import { careerPaths } from "@/data/paths";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

const difficulties = ["All", "Foundational", "Intermediate", "Advanced"] as const;
const difficultyLabel: Record<string, string> = {
  All: "Tümü",
  Foundational: "Temel",
  Intermediate: "Orta",
  Advanced: "İleri",
};

export default function PathsPage() {
  const mounted = useHydrated();
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>("All");
  const { enrolledPathIds, completedModuleIds, enrollPath } = useCareerStore();

  const filtered = useMemo(
    () => difficulty === "All" ? careerPaths : careerPaths.filter((path) => path.difficulty === difficulty),
    [difficulty]
  );
  const activePath = careerPaths.find((path) => enrolledPathIds.includes(path.id));
  const activeDone = activePath?.modules.filter((module) => completedModuleIds.includes(module.id)).length ?? 0;
  const activeProgress = activePath ? Math.round((activeDone / activePath.modules.length) * 100) : 0;

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  return (
    <main className="product-page">
      <header className="grid gap-8 border-b border-line pb-9 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div>
          <p className="page-kicker"><Route className="h-3.5 w-3.5" /> Gelişim yolları</p>
          <h1 className="page-title-compact mt-4 max-w-2xl">Eksik beceriyi bitirilecek bir plana dönüştürün.</h1>
        </div>
        <p className="text-sm leading-6 text-ink-2">Her yol, özgeçmişte görünür bir çıktı ve mülakatta anlatılabilir bir kanıt üretmek üzere tasarlandı.</p>
      </header>

      {activePath && (
        <section className="mt-8 grid overflow-hidden border border-line bg-surface lg:grid-cols-[1fr_auto]">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-positive" /><p className="section-label">Devam eden yol</p></div>
            <h2 className="mt-4 text-2xl font-semibold text-ink">{activePath.title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-2">{activePath.summary}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-ink-3">
              <span>{activeDone}/{activePath.modules.length} modül tamamlandı</span>
              <span>{activePath.durationWeeks} hafta</span>
              <span>{activePath.skills.slice(0, 3).join(" · ")}</span>
            </div>
          </div>
          <div className="flex min-w-56 flex-col justify-between border-t border-line bg-surface-2 p-6 lg:border-l lg:border-t-0">
            <strong className="metric-number text-4xl font-semibold text-brand-strong">{activeProgress}%</strong>
            <Link href={`/paths/${activePath.id}`} className="mt-6 inline-flex"><Button variant="primary">Devam et <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-col gap-5 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label">Yol kataloğu</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">{filtered.length} yapılandırılmış rota</h2>
        </div>
        <div className="flex overflow-x-auto rounded-[var(--radius-control)] border border-line bg-surface p-0.5" role="tablist" aria-label="Zorluk filtresi">
          {difficulties.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDifficulty(item)}
              className={cn(
                "h-8 whitespace-nowrap rounded-[calc(var(--radius-control)-2px)] px-3 text-[0.6875rem] font-medium transition-colors",
                difficulty === item ? "bg-ink text-background" : "text-ink-3 hover:text-ink"
              )}
              role="tab"
              aria-selected={difficulty === item}
            >
              {difficultyLabel[item]}
            </button>
          ))}
        </div>
      </div>

      <div>
        {filtered.map((path, index) => {
          const enrolled = enrolledPathIds.includes(path.id);
          const completed = path.modules.filter((module) => completedModuleIds.includes(module.id)).length;
          const progress = Math.round((completed / path.modules.length) * 100);
          return (
            <article key={path.id} className="grid gap-5 border-b border-line py-7 lg:grid-cols-[3rem_minmax(15rem,0.8fr)_minmax(18rem,1fr)_auto] lg:items-center">
              <span className="font-mono text-xs text-ink-3">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.6875rem] font-semibold text-brand-strong">{path.track}</span>
                  <span className="text-[0.6875rem] text-ink-3">{difficultyLabel[path.difficulty]}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-ink">{path.title}</h3>
                <p className="mt-2 text-xs leading-5 text-ink-3">{path.durationWeeks} hafta · {path.modules.length} modül</p>
              </div>
              <div>
                <p className="text-sm leading-6 text-ink-2">{path.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {path.skills.slice(0, 4).map((skill) => <span key={skill} className="rounded-full border border-line px-2 py-0.5 text-[0.625rem] text-ink-3">{skill}</span>)}
                </div>
                {enrolled && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></div>
                    <span className="font-mono text-[0.6875rem] text-ink-3">{progress}%</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 lg:justify-end">
                {!enrolled && (
                  <Button variant="outline" size="sm" onClick={() => enrollPath(path.id)}>
                    <PlusIcon /> Kaydol
                  </Button>
                )}
                <Link href={`/paths/${path.id}`} className="relative z-10"><Button variant={enrolled ? "primary" : "ghost"} size="sm">{enrolled ? "Devam et" : "İncele"} <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-14 grid gap-px border border-line bg-line sm:grid-cols-3">
        {[
          { icon: Target, label: "Çıktı", text: "Her yol bir portföy kanıtıyla tamamlanır." },
          { icon: BookOpen, label: "Ritim", text: "Kısa modüller sıradaki somut işi görünür tutar." },
          { icon: Clock, label: "Süre", text: "Tahminler haftalık 4–6 saatlik odağa göre yapılır." },
        ].map(({ icon: Icon, label, text }) => (
          <div key={label} className="bg-surface p-5">
            <Icon className="h-4 w-4 text-ink-3" />
            <p className="mt-4 text-xs font-semibold text-ink">{label}</p>
            <p className="mt-2 text-xs leading-5 text-ink-3">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

function PlusIcon() {
  return <span className="grid h-4 w-4 place-items-center rounded-full border border-current text-[0.6875rem] leading-none">+</span>;
}
