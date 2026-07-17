"use client";

import { CheckCircle2, CircleAlert } from "lucide-react";
import type { AtsScoreResult } from "@/features/analysis/atsScore";
import { getAtsStatusLabel, getAtsSummary } from "@/features/analysis/atsScore";
import { useMessages } from "@/i18n/useMessages";

interface AtsScoreBreakdownProps {
  result: AtsScoreResult;
  compact?: boolean;
}
export function AtsScoreBreakdown({ result, compact = false }: AtsScoreBreakdownProps) {
  const { locale, messages } = useMessages();
  const categoryLabels = messages.ats;
  const positive = result.total >= 70;

  return (
    <section className="surface-panel overflow-hidden" aria-labelledby="ats-breakdown-title">
      <div className="grid gap-5 border-b border-line p-5 sm:grid-cols-[auto_1fr] sm:items-center sm:p-6">
        <div>
          <p className="section-label">{messages.ats.generalScore}</p>
          <div className="mt-2 flex items-end gap-2">
            <strong className="metric-number text-4xl font-semibold text-brand-strong">{result.total}</strong>
            <span className="pb-1 text-xs text-ink-3">/100</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            {positive ? <CheckCircle2 className="h-4 w-4 text-positive" /> : <CircleAlert className="h-4 w-4 text-caution" />}
            <h2 id="ats-breakdown-title" className="text-sm font-semibold text-ink">{getAtsStatusLabel(result.status, locale)}</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-ink-2">{getAtsSummary(result.total, locale)}</p>
        </div>
      </div>

      <div className={compact ? "p-5" : "p-5 sm:p-6"}>
        {!compact && <p className="mb-5 text-[0.6875rem] leading-5 text-ink-3">{messages.ats.explanation}</p>}
        <dl className={compact ? "space-y-3" : "grid gap-x-8 gap-y-4 sm:grid-cols-2"}>
          {result.categories.map((category) => {
            const percentage = Math.round((category.score / category.maxScore) * 100);
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-4 text-[0.6875rem]">
                  <dt className="font-medium text-ink-2">{categoryLabels[category.id]}</dt>
                  <dd className="font-mono text-ink-3">{category.score}/{category.maxScore}</dd>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3"
                  role="progressbar"
                  aria-label={categoryLabels[category.id]}
                  aria-valuenow={category.score}
                  aria-valuemin={0}
                  aria-valuemax={category.maxScore}
                >
                  <div className="h-full rounded-full bg-brand" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
