"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, ChevronDown, ChevronUp, ShieldAlert, ListChecks } from "lucide-react";
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

  const actionItems = result.categories
    .filter((c) => c.score < c.maxScore)
    .sort((a, b) => b.maxScore - b.score - (a.maxScore - a.score))
    .slice(0, 4);

  return (
    <section className="surface-panel overflow-hidden p-0" aria-labelledby="ats-breakdown-title">
      <div className="grid gap-6 border-b border-line p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
        <div>
          <p className="section-label">{messages.ats.generalScore}</p>
          <div className="mt-2 flex items-end gap-2">
            <strong className="metric-number text-5xl font-extrabold text-brand-strong">{result.total}</strong>
            <span className="pb-1.5 text-sm font-semibold text-ink-3">/100</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-3">
            {isTr ? "Model güveni" : "Model confidence"}: {result.confidence === "high" ? (isTr ? "yüksek" : "high") : result.confidence === "medium" ? (isTr ? "orta" : "medium") : (isTr ? "düşük" : "low")}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2">
            {positive ? <CheckCircle2 className="h-5 w-5 text-positive" /> : <CircleAlert className="h-5 w-5 text-caution" />}
            <h2 id="ats-breakdown-title" className="text-base font-bold text-ink">{getAtsStatusLabel(result.status, locale)}</h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{getAtsSummary(result.total, locale)}</p>
        </div>
      </div>

      {/* Highest-impact actions within the current rubric */}
      {!compact && actionItems.length > 0 && (
        <div className="border-b border-line bg-[var(--caution-wash)]/40 px-6 py-5 sm:px-8">
          <p className="text-xs font-bold uppercase tracking-wider text-caution">
            {isTr ? "Mevcut rubriğe göre öncelikli düzeltmeler" : "Priority corrections under the current rubric"}
          </p>
          <ol className="mt-3 space-y-2.5">
            {actionItems.map((cat, i) => {
              const missingPts = cat.maxScore - cat.score;
              const tip =
                cat.correction ||
                cat.missing[0] ||
                getCategoryDetails(cat.id, cat.score, cat.maxScore);
              return (
                <li key={cat.id} className="flex gap-3 text-sm leading-relaxed text-ink">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[11px] font-bold text-brand-strong shadow-sm">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-bold">{categoryLabels[cat.id]}</span>
                    <span className="ml-2 font-mono text-xs text-caution">+{missingPts}</span>
                    <p className="mt-0.5 text-ink-2">{tip}</p>
                    {cat.missing.length > 0 && (
                      <p className="mt-1 text-xs font-semibold text-ink-3">
                        {isTr ? "Eksik sinyaller: " : "Missing signals: "}
                        {cat.missing.slice(0, 4).join(" · ")}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className={compact ? "p-5" : "p-6 sm:p-8"}>
        {!compact && (
          <p className="mb-6 text-sm leading-relaxed text-ink-3">{messages.ats.explanation}</p>
        )}
        <dl className={compact ? "space-y-4" : "grid gap-x-10 gap-y-5 sm:grid-cols-2"}>
          {result.categories.map((category) => {
            const percentage = Math.round((category.score / category.maxScore) * 100);
            return (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <dt className="font-semibold text-ink-2">{categoryLabels[category.id]}</dt>
                  <dd className="font-mono font-semibold text-ink-3">
                    {category.score}/{category.maxScore}
                  </dd>
                </div>
                <div
                  className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-3"
                  role="progressbar"
                  aria-label={categoryLabels[category.id]}
                  aria-valuenow={category.score}
                  aria-valuemin={0}
                  aria-valuemax={category.maxScore}
                >
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </dl>

        <div className="mt-8 border-t border-line pt-5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-brand-strong hover:underline"
          >
            <ListChecks className="h-4 w-4" />
            <span>{isTr ? "Neden bu puan? Detaylı kanıtlar" : "Why this score? Full evidence"}</span>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {expanded && (
            <div className="mt-5 space-y-5 rounded-xl border border-line bg-surface-2 p-5">
              {result.categories.map((cat) => (
                <div key={cat.id} className="border-b border-line pb-5 text-sm last:border-0 last:pb-0">
                  <div className="flex items-center justify-between font-bold text-ink">
                    <span>
                      {categoryLabels[cat.id]}{" "}
                      <span className="text-[10px] font-normal text-ink-3">
                        ({isTr ? "Ağırlık" : "Weight"}: {cat.weight})
                      </span>
                    </span>
                    <span className="font-mono text-ink-3">
                      {cat.score}/{cat.maxScore}
                    </span>
                  </div>

                  {cat.evidence.length > 0 && (
                    <div className="mt-2.5 text-xs">
                      <span className="font-bold text-positive">
                        {isTr ? "✓ Tespit edilen kanıtlar:" : "✓ Detected evidence:"}
                      </span>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-ink-2">
                        {cat.evidence.map((ev, i) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {cat.missing.length > 0 && (
                    <div className="mt-2.5 text-xs">
                      <span className="font-bold text-caution">
                        {isTr ? "✗ Eksik sinyaller:" : "✗ Missing signals:"}
                      </span>
                      <ul className="mt-1 list-inside list-disc space-y-0.5 pl-1 text-ink-2">
                        {cat.missing.map((mis, i) => (
                          <li key={i}>{mis}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3 rounded-lg border border-line bg-surface p-3 text-xs">
                    <span className="font-bold text-ink">
                      {isTr ? "💡 Önerilen düzeltme:" : "💡 Recommended correction:"}
                    </span>
                    <p className="mt-1 leading-relaxed text-ink-2">{cat.correction}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-start gap-2 border-t border-line pt-5 text-xs leading-relaxed text-ink-3">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caution" />
          <p>
            {isTr
              ? "Açıklama: Kural tabanlı, şeffaf tahmin. Gerçek bir ATS satıcısını veya işe alım kararını temsil etmez — ama hangi sinyallerin eksik olduğunu gösterir."
              : "Disclaimer: Transparent, rule-based estimate. Not a real ATS vendor or hiring decision — but it shows which signals are missing."}
          </p>
        </div>
        {result.missingInputs.length > 0 && (
          <div className="mt-3 border-l-2 border-caution bg-[var(--caution-wash)]/35 px-3 py-2 text-xs leading-relaxed text-ink-2">
            <strong className="text-ink">{isTr ? "Güveni sınırlayan girdiler: " : "Inputs limiting confidence: "}</strong>
            {result.missingInputs.join(" · ")}
          </div>
        )}
      </div>
    </section>
  );
}
