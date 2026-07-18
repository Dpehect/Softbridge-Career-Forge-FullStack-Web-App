"use client";

import { useState } from "react";
import { AlertCircle, RotateCcw, ThumbsDown, ThumbsUp, WandSparkles } from "lucide-react";
import type { ActionableRecommendation, RecommendationAction } from "@/features/analysis/recommendations";
import { Button } from "@/components/ui/button";
import { useMessages } from "@/i18n/useMessages";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ActionableRecommendationsProps {
  items: ActionableRecommendation[];
  onAction?: (item: ActionableRecommendation, action: RecommendationAction) => void;
}

type Vote = "up" | "down";

export function ActionableRecommendations({ items, onAction }: ActionableRecommendationsProps) {
  const { locale, messages } = useMessages();
  const isTr = locale === "tr";
  const [votes, setVotes] = useState<Record<string, Vote>>({});

  if (!items.length) return null;

  const vote = (id: string, value: Vote) => {
    setVotes((prev) => ({ ...prev, [id]: value }));
    try {
      const key = "cf_suggestion_votes_v1";
      const existing = JSON.parse(localStorage.getItem(key) || "{}") as Record<string, Vote>;
      existing[id] = value;
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {
      /* ignore */
    }
    toast.success(
      value === "up"
        ? isTr
          ? "Teşekkürler — bu öneriyi faydalı buldunuz."
          : "Thanks — marked as helpful."
        : isTr
          ? "Not aldık — önerileri iyileştireceğiz."
          : "Noted — we'll improve suggestions."
    );
  };

  return (
    <section aria-labelledby="recommendations-title">
      <div className="flex items-end justify-between border-b border-line pb-5">
        <div>
          <p className="section-label">{isTr ? "Eylem planı" : "Action plan"}</p>
          <h2 id="recommendations-title" className="mt-2 text-xl font-bold text-ink">
            {isTr ? "Doğrudan CV'ye bağlı öneriler" : "Recommendations connected to your resume"}
          </h2>
        </div>
        <WandSparkles className="h-4 w-4 text-info" />
      </div>

      <div>
        {items.map((item, index) => (
          <article key={item.id} className="border-b border-line py-7">
            <div className="grid gap-5 lg:grid-cols-[2.5rem_minmax(0,1fr)]">
              <span className="font-mono text-xs font-semibold text-ink-3">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-base font-bold text-ink">{item.problem}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.why}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink">
                  <strong>{isTr ? "Düzeltme:" : "Correction:"}</strong> {item.correction}
                </p>

                <div className="mt-5 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-2">
                  <div className="bg-surface-2 p-5">
                    <p className="section-label">{isTr ? "Önce" : "Before"}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.before}</p>
                  </div>
                  <div className="bg-[var(--positive-wash)] p-5">
                    <p className="section-label text-positive">{isTr ? "Önerilen" : "Suggested"}</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink">{item.after}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-ink-3">
                    {item.requiresConfirmation && <AlertCircle className="h-3.5 w-3.5 text-caution" />}
                    <span>
                      {item.requiresConfirmation
                        ? isTr
                          ? "Örnek, gerçek verinizle doğrulanmalıdır."
                          : "Confirm this example with your real data."
                        : item.impact}
                    </span>
                  </div>
                  {onAction && (
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="primary" onClick={() => onAction(item, "apply")}>
                        {messages.common.apply}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onAction(item, "alternative")}>
                        {messages.common.regenerate}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "shorter")}>
                        {messages.common.shorter}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "technical")}>
                        {messages.common.technical}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => onAction(item, "undo")}>
                        <RotateCcw className="h-3.5 w-3.5" /> {messages.common.undo}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Helpful vote */}
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <span className="text-xs font-semibold text-ink-3">
                    {isTr ? "Bu öneri faydalı mı?" : "Was this suggestion helpful?"}
                  </span>
                  <button
                    type="button"
                    onClick={() => vote(item.id, "up")}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                      votes[item.id] === "up"
                        ? "border-positive/40 bg-[var(--positive-wash)] text-positive"
                        : "border-line bg-surface text-ink-2 hover:border-positive/30 hover:text-positive"
                    )}
                    aria-pressed={votes[item.id] === "up"}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {isTr ? "Evet" : "Yes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => vote(item.id, "down")}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors",
                      votes[item.id] === "down"
                        ? "border-negative/40 bg-[var(--negative-wash)] text-negative"
                        : "border-line bg-surface text-ink-2 hover:border-negative/30 hover:text-negative"
                    )}
                    aria-pressed={votes[item.id] === "down"}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {isTr ? "Hayır" : "No"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
