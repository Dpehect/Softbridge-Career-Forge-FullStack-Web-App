"use client";

import { AlertCircle, RotateCcw, WandSparkles } from "lucide-react";
import type { ActionableRecommendation, RecommendationAction } from "@/features/analysis/recommendations";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/useMessages";

interface ActionableRecommendationsProps {
  items: ActionableRecommendation[];
  onAction?: (item: ActionableRecommendation, action: RecommendationAction) => void;
}

export function ActionableRecommendations({ items, onAction }: ActionableRecommendationsProps) {
  const { locale, messages } = useMessages();
  if (!items.length) return null;

  return (
    <section aria-labelledby="recommendations-title">
      <div className="flex items-end justify-between border-b border-line pb-4">
        <div>
          <p className="section-label">{locale === "tr" ? "Eylem planı" : "Action plan"}</p>
          <h2 id="recommendations-title" className="mt-2 text-xl font-semibold text-ink">{locale === "tr" ? "Doğrudan CV'ye bağlı öneriler" : "Recommendations connected to your resume"}</h2>
        </div>
        <WandSparkles className="h-4 w-4 text-info" />
      </div>

      <div>
        {items.map((item, index) => (
          <article key={item.id} className="border-b border-line py-6">
            <div className="grid gap-5 lg:grid-cols-[2rem_minmax(0,1fr)]">
              <span className="font-mono text-xs text-ink-3">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{item.problem}</h3>
                <p className="mt-2 text-xs leading-5 text-ink-2">{item.why}</p>
                <p className="mt-3 text-xs leading-5 text-ink"><strong>{locale === "tr" ? "Düzeltme:" : "Correction:"}</strong> {item.correction}</p>

                <div className="mt-4 grid gap-px bg-line sm:grid-cols-2">
                  <div className="bg-surface-2 p-4">
                    <p className="section-label">{locale === "tr" ? "Önce" : "Before"}</p>
                    <p className="mt-2 text-xs leading-5 text-ink-2">{item.before}</p>
                  </div>
                  <div className="bg-[var(--positive-wash)] p-4">
                    <p className="section-label text-positive">{locale === "tr" ? "Önerilen" : "Suggested"}</p>
                    <p className="mt-2 text-xs leading-5 text-ink">{item.after}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-[0.6875rem] text-ink-3">
                    {item.requiresConfirmation && <AlertCircle className="h-3.5 w-3.5 text-caution" />}
                    <span>{item.requiresConfirmation
                      ? locale === "tr" ? "Örnek, gerçek verinizle doğrulanmalıdır." : "Confirm this example with your real data."
                      : item.impact}</span>
                  </div>
                  {onAction && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="primary" onClick={() => onAction(item, "apply")}>{messages.common.apply}</Button>
                      <Button size="sm" variant="outline" onClick={() => onAction(item, "alternative")}>{messages.common.regenerate}</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "shorter")}>{messages.common.shorter}</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "technical")}>{messages.common.technical}</Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "undo")}><RotateCcw className="h-3.5 w-3.5" /> {messages.common.undo}</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
