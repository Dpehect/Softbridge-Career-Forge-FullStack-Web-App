import type { Locale } from "@/i18n/messages";
import type { ParsedCV } from "@/lib/forge/types";

export type RecommendationAction = "apply" | "alternative" | "shorter" | "technical" | "undo";

export interface ActionableRecommendation {
  id: string;
  problem: string;
  why: string;
  correction: string;
  before: string;
  after: string;
  impact: string;
  requiresConfirmation: boolean;
}
const METRIC_PATTERN = /\d+\s*%|[$€£₺]\s*\d+|\b\d{2,}\+?\b/i;

export function buildActionableRecommendations(cv: ParsedCV, locale: Locale): ActionableRecommendation[] {
  const bullets = cv.experience.flatMap((item) => item.description ?? []).filter(Boolean);
  const firstBullet = bullets[0] ?? (locale === "tr" ? "React projelerinde çalıştım ve arayüz geliştirdim." : "Worked on React projects and built interfaces.");
  const recommendations: ActionableRecommendation[] = [];

  if (!bullets.some((bullet) => METRIC_PATTERN.test(bullet))) {
    recommendations.push(locale === "tr" ? {
      id: "measurable-impact",
      problem: "Deneyim maddeleri ölçülebilir sonuç içermiyor.",
      why: "ATS ve işe alım uzmanları sorumluluktan çok iş veya ürün etkisini görmek ister.",
      correction: "Gerçek bir başlangıç değeri, yaptığınız çalışma ve doğrulanmış sonucu aynı cümlede birleştirin.",
      before: firstBullet,
      after: `${firstBullet.replace(/[.]$/, "")} ve [doğrulanmış ölçülebilir sonuç] elde ettim.`,
      impact: "+4 ila +10 ATS puanı",
      requiresConfirmation: true,
    } : {
      id: "measurable-impact",
      problem: "Experience bullets do not include measurable outcomes.",
      why: "ATS systems and recruiters look for business or product impact, not only responsibilities.",
      correction: "Combine a real baseline, the work you performed, and a verified outcome in one sentence.",
      before: firstBullet,
      after: `${firstBullet.replace(/[.]$/, "")} and achieved [verified measurable outcome].`,
      impact: "+4 to +10 ATS points",
      requiresConfirmation: true,
    });
  }

  if (!cv.summary || cv.summary.length < 60) {
    recommendations.push(locale === "tr" ? {
      id: "summary-positioning",
      problem: "Profil özeti eksik veya hedef rolü yeterince açıklamıyor.",
      why: "İlk taramada rol, uzmanlık ve kanıtın birlikte görünmesi doğru eşleşmeyi hızlandırır.",
      correction: "Hedef rolünüzü, doğrulanabilir uzmanlığınızı ve yönünüzü üç kısa cümlede anlatın.",
      before: cv.summary || "Profil özeti bulunmuyor.",
      after: `${cv.title || "Hedef rol"} odağında çalışan, ${cv.skills.slice(0, 2).join(" ve ") || "alan uzmanlığı"} deneyimine sahip profesyonel. Doğrulanabilir ürün sonuçları ve sürdürülebilir uygulama kalitesi üretir.`,
      impact: "+4 ila +8 ATS puanı",
      requiresConfirmation: false,
    } : {
      id: "summary-positioning",
      problem: "The profile summary is missing or does not clearly state the target role.",
      why: "Showing role, expertise, and evidence together improves the first screening pass.",
      correction: "Describe your target role, verifiable expertise, and direction in three concise sentences.",
      before: cv.summary || "No profile summary found.",
      after: `${cv.title || "Target-role"} professional with experience in ${cv.skills.slice(0, 2).join(" and ") || "relevant domain skills"}. Builds reliable products and communicates verifiable outcomes.`,
      impact: "+4 to +8 ATS points",
      requiresConfirmation: false,
    });
  }

  if (cv.skills.length < 8) {
    recommendations.push(locale === "tr" ? {
      id: "keyword-coverage",
      problem: "Beceri bölümü hedef rol için dar kalıyor.",
      why: "İlan terminolojisiyle dürüst eşleşen beceriler, doğru ATS sorgularında görünürlüğü artırır.",
      correction: "Yalnızca gerçek deneyimle savunabildiğiniz araçları ve yöntemleri ekleyin.",
      before: cv.skills.join(", ") || "Beceri listesi boş.",
      after: `${cv.skills.join(", ")}${cv.skills.length ? ", " : ""}[hedef ilandan doğrulanmış 3 beceri]`,
      impact: "+2 ila +8 ATS puanı",
      requiresConfirmation: true,
    } : {
      id: "keyword-coverage",
      problem: "The skills section is narrow for the target role.",
      why: "Honest matches with job terminology improve visibility in relevant ATS searches.",
      correction: "Add only tools and methods you can defend with real experience.",
      before: cv.skills.join(", ") || "Skills section is empty.",
      after: `${cv.skills.join(", ")}${cv.skills.length ? ", " : ""}[3 verified skills from target listing]`,
      impact: "+2 to +8 ATS points",
      requiresConfirmation: true,
    });
  }

  return recommendations.slice(0, 3);
}
