"use client";

import { Badge } from "@/components/ui/badge";
import { StatPill } from "@/components/StatPill";
import type { CvDeepFeedback } from "@/lib/forge/cvFeedback";

export function CvFeedbackPanel({ feedback }: { feedback: CvDeepFeedback }) {
  return (
    <div className="glass-panel rounded-2xl p-5 md:p-6 space-y-5 border border-cosmic-teal/15">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant="accent" className="mb-2">
            Professional review
          </Badge>
          <h3 className="font-display text-lg font-semibold">CV feedback</h3>
          <p className="text-sm text-muted-steel mt-1 max-w-xl">{feedback.summaryLine}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill label="Overall" value={`%${feedback.overallScore}`} />
          <StatPill label="ATS" value={`%${feedback.atsScore}`} />
        </div>
      </div>

      <Section title="Strong points" items={feedback.strengths} tone="good" />
      <Section title="Weak points" items={feedback.weaknesses} tone="warn" />
      <Section title="Specific improvements" items={feedback.improvements} tone="action" />
      <Section title="Career advice" items={feedback.careerAdvice} tone="advice" />
    </div>
  );
}

function Section({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "warn" | "action" | "advice";
}) {
  if (!items.length) return null;
  const bullet =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-800" : "text-cosmic-teal";
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-steel mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-ink-soft flex gap-2">
            <span className={`${bullet} mt-0.5 shrink-0`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
