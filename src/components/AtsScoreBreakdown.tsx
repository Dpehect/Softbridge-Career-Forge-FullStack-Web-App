"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, ChevronDown, ChevronUp, ShieldAlert, Sparkles } from "lucide-react";
import type { AtsScoreResult } from "@/features/analysis/atsScore";
import { getAtsStatusLabel, getAtsSummary } from "@/features/analysis/atsScore";
import { useMessages } from "@/i18n/useMessages";

interface AtsScoreBreakdownProps {
  result: AtsScoreResult;
  compact?: boolean;
}
export function AtsScoreBreakdown({ result, compact = false }: AtsScoreBreakdownProps) {
  const { locale, messages } = useMessages();
  const [expanded, setExpanded] = useState(false);
  const categoryLabels = messages.ats;
  const positive = result.total >= 70;
  const isTr = locale === "tr";

  const getCategoryDetails = (id: string, score: number, max: number) => {
    if (isTr) {
      switch (id) {
        case "structure":
          return score === max
            ? "Format ve şablon kriterleri eksiksiz. Standart tek sütun düzeni korunuyor."
            : "Bazı maddeler çok uzun veya iş deneyiminde eksik şirket/rol/tarih alanları var.";
        case "completeness":
          return score === max
            ? "Özet, Beceriler, Deneyim ve Eğitim bölümlerinin tümü mevcut."
            : "Özet yazısı veya temel alanlarda eksiklikler tespit edildi.";
        case "experience":
          return score >= 20
            ? "Deneyimlerinizde güçlü eylem fiilleri (geliştirdi, yönetti vb.) kullanılmış."
            : "Deneyimleri edilgen yerine etken/aksiyon odaklı eylem fiilleriyle tanımlayın.";
        case "keywords":
          return score >= 15
            ? "Rol ile örtüşen anahtar kelime çeşitliliği yeterli düzeyde."
            : "Hedef role ait daha fazla temel beceri ve araç adı ekleyin.";
        case "impact":
          return score >= 6
            ? "Deneyim maddelerinizde ölçülebilir metrikler (oranlar, sayılar) yer alıyor."
            : "Deneyimlerinize somut sonuçlar (örn. %20 tasarruf, 100+ kullanıcı) ekleyin.";
        case "contact":
          return score >= 8
            ? "Ad, e-posta, telefon ve konum gibi iletişim bilgileri eksiksiz."
            : "İletişim bilgilerinizin (özellikle e-posta ve telefon) eksiksiz olduğundan emin olun.";
        default:
          return "";
      }
    } else {
      switch (id) {
        case "structure":
          return score === max
            ? "Formatting and layout criteria are fully met. Single-column format preserved."
            : "Some lines are too long, or experience entries have missing details.";
        case "completeness":
          return score === max
            ? "Summary, Skills, Experience, and Education sections are all present."
            : "Essential sections like summary or skills list are missing or thin.";
        case "experience":
          return score >= 20
            ? "Strong action verbs (built, managed, designed) are used to describe experience."
            : "Describe your experience using active verbs to emphasize ownership.";
        case "keywords":
          return score >= 15
            ? "A good variety of role-relevant keywords is present."
            : "Add more core skills and tools matching your target role.";
        case "impact":
          return score >= 6
            ? "Includes quantifiable business outcomes (percentages, numbers)."
            : "Add measurable results (e.g. saved 20% time, served 500+ users) to experience.";
        case "contact":
          return score >= 8
            ? "Name, email, phone, and location details are fully visible."
            : "Ensure essential contact info (especially email and phone) is included.";
        default:
          return "";
      }
    }
  };

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

        <div className="mt-6 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-brand-strong hover:underline"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isTr ? "Neden bu puan?" : "Why this score?"}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {expanded && (
            <div className="mt-4 space-y-3 rounded-[var(--radius-control)] bg-surface-2 p-4 border border-line">
              {result.categories.map((cat) => (
                <div key={cat.id} className="text-xs">
                  <div className="flex items-center justify-between font-semibold text-ink">
                    <span>{categoryLabels[cat.id]}</span>
                    <span className="font-mono text-ink-3">{cat.score}/{cat.maxScore}</span>
                  </div>
                  <p className="mt-1 text-[0.6875rem] text-ink-3 leading-relaxed">
                    {getCategoryDetails(cat.id, cat.score, cat.maxScore)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2 border-t border-line pt-4 text-[0.625rem] text-ink-3 leading-normal items-start">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-caution mt-0.5" />
          <p>
            {isTr
              ? "Açıklama: Bu puanlar, ATS sistemlerinin genel kriterlerine göre hesaplanmış kural tabanlı tahminlerdir. Gerçek bir ATS yazılımını veya işe alım kararını garanti etmez."
              : "Disclaimer: These scores are rule-based estimates calibrated against common ATS guidelines. They do not guarantee performance in any specific ATS vendor or hiring selection outcome."}
          </p>
        </div>
      </div>
    </section>
  );
}
