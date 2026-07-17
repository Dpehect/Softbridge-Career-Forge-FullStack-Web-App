"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Check, Circle, Clock, Route } from "lucide-react";
import { toast } from "sonner";
import { getPath } from "@/data/paths";
import { Button } from "@/components/ui/button";
import { useCareerStore } from "@/store/useCareerStore";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";

export default function PathDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const path = getPath(id);
  if (!path) notFound();
  const mounted = useHydrated();
  const { enrolledPathIds, completedModuleIds, enrollPath, toggleModule } = useCareerStore();

  if (!mounted) {
    return <div className="grid min-h-[60vh] place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" /></div>;
  }

  const enrolled = enrolledPathIds.includes(path.id);
  const completed = path.modules.filter((module) => completedModuleIds.includes(module.id)).length;
  const progress = Math.round((completed / path.modules.length) * 100);

  return (
    <main className="product-page">
      <Link href="/paths" className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Tüm yollara dön
      </Link>

      <header className="mt-7 grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="page-kicker"><Route className="h-3.5 w-3.5" /> {path.track} · {path.difficulty}</p>
          <h1 className="page-title-compact mt-4 max-w-3xl">{path.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-ink-2">{path.summary}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-3">
            <span>{path.durationWeeks} hafta</span>
            <span>{path.modules.length} modül</span>
            <span>{path.modules.reduce((sum, module) => sum + module.durationHours, 0)} saat</span>
          </div>
        </div>
        {enrolled ? (
          <div className="min-w-44">
            <div className="flex items-end justify-between"><span className="section-label">İlerleme</span><strong className="metric-number text-3xl font-semibold text-brand-strong">{progress}%</strong></div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-3"><div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} /></div>
          </div>
        ) : (
          <Button variant="primary" onClick={() => { enrollPath(path.id); toast.success("Yol çalışma alanınıza eklendi."); }}>Bu yola başla</Button>
        )}
      </header>

      <div className="grid gap-12 pt-10 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <section>
          <div className="flex items-end justify-between border-b border-line pb-4">
            <div>
              <p className="section-label">Müfredat</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">Öğrenme ve kanıt üretimi</h2>
            </div>
            <span className="font-mono text-xs text-ink-3">{completed}/{path.modules.length}</span>
          </div>

          <ol>
            {path.modules.map((module, index) => {
              const done = completedModuleIds.includes(module.id);
              return (
                <li key={module.id} className={cn("grid gap-4 border-b border-line py-6 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start", done && "bg-[var(--positive-wash)]/30")}>
                  <button
                    type="button"
                    disabled={!enrolled}
                    onClick={() => {
                      toggleModule(module.id);
                      toast.success(done ? "Modül yeniden açıldı." : "Modül tamamlandı.");
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full border border-line-strong text-ink-3 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label={done ? "Modülü tamamlanmadı olarak işaretle" : "Modülü tamamlandı olarak işaretle"}
                  >
                    {done ? <Check className="h-4 w-4 text-positive" /> : <Circle className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[0.6875rem] text-ink-3">MODÜL {String(index + 1).padStart(2, "0")}</span>
                      {done && <span className="text-[0.6875rem] font-semibold text-positive">Tamamlandı</span>}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-ink">{module.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {module.topics.map((topic) => <span key={topic} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[0.625rem] text-ink-3">{topic}</span>)}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-3"><Clock className="h-3.5 w-3.5" /> {module.durationHours} saat</span>
                </li>
              );
            })}
          </ol>
          {!enrolled && <p className="mt-4 text-xs text-caution">Modülleri işaretlemek için önce bu yola kaydolun.</p>}
        </section>

        <aside className="xl:sticky xl:top-32 xl:self-start">
          <div className="surface-subtle p-6">
            <p className="section-label">Yol sonunda</p>
            <div className="mt-5 space-y-5">
              {path.outcomes.map((outcome, index) => (
                <div key={outcome} className="grid grid-cols-[1.75rem_1fr] gap-3 border-b border-line pb-5 last:border-b-0 last:pb-0">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--accent-wash)] font-mono text-[0.625rem] text-brand-strong">{index + 1}</span>
                  <p className="text-sm leading-6 text-ink-2">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 border-t border-line pt-6">
            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-signal" /><p className="text-xs font-semibold text-ink">Özgeçmiş çıktısı</p></div>
            <p className="mt-2 text-xs leading-5 text-ink-3">Yol tamamlandığında elde ettiğiniz projeyi, metriği ve yöntemleri tek bir kanıt maddesi olarak özgeçmişinize taşıyın.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
