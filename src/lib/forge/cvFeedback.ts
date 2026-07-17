import type { Locale } from "@/i18n/messages";
import { buildActionableRecommendations } from "@/features/analysis/recommendations";
import type { ParsedCV } from "./types";
import { analyzeAts } from "./analyze";

export interface CvDeepFeedback {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  careerAdvice: string[];
  summaryLine: string;
}
function hasMetrics(text: string) {
  return /\d+%|[$€£₺]\s*\d+|\d+\+|x\d|increased|reduced|grew|improved|artırdı|azalttı|iyileştirdi|\d{2,}/i.test(text);
}

export function generateCvFeedback(
  cv: ParsedCV,
  rawText = "",
  locale: Locale = "tr"
): CvDeepFeedback {
  const experience = Array.isArray(cv?.experience) ? cv.experience : [];
  const skills = Array.isArray(cv?.skills) ? cv.skills : [];
  const education = Array.isArray(cv?.education) ? cv.education : [];
  const bullets = experience.flatMap((item) => item.description ?? []).filter(Boolean);
  const metricBullets = bullets.filter(hasMetrics);
  const safeCv: ParsedCV = {
    ...cv,
    name: cv?.name || (locale === "tr" ? "Aday" : "Candidate"),
    title: cv?.title || (locale === "tr" ? "Profesyonel" : "Professional"),
    email: cv?.email || "",
    phone: cv?.phone ?? null,
    location: cv?.location ?? null,
    summary: cv?.summary ?? null,
    experience,
    skills,
    education,
    rawLength: cv?.rawLength ?? rawText.length,
  };
  const ats = analyzeAts(safeCv, rawText, locale);
  const actionable = buildActionableRecommendations(safeCv, locale);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (locale === "tr") {
    if (safeCv.title) strengths.push(`Profesyonel başlık hedefi görünür kılıyor: ${safeCv.title}.`);
    if (safeCv.email) strengths.push("İletişim e-postası taranabilir biçimde mevcut.");
    if (skills.length >= 6) strengths.push(`${skills.length} beceri, teknik kapsam için güçlü bir başlangıç sağlıyor.`);
    if (experience.length) strengths.push(`${experience.length} yapılandırılmış deneyim bölümü kariyer kanıtı sunuyor.`);
    if (metricBullets.length) strengths.push(`${metricBullets.length} deneyim maddesi ölçülebilir sonuç içeriyor.`);
    if (safeCv.summary && safeCv.summary.length >= 60) strengths.push("Profil özeti rol, uzmanlık ve yön bilgisini birlikte taşıyor.");
    if (education.length) strengths.push("Eğitim bilgileri tarama filtreleri için tamamlanmış.");

    if (!safeCv.email) weaknesses.push("İletişim e-postası eksik; işe alım akışı doğrudan etkilenebilir.");
    if (!safeCv.phone) weaknesses.push("Telefon bilgisi eksik; bazı pazarlarda iletişim bütünlüğünü azaltabilir.");
    if (!safeCv.location) weaknesses.push("Konum bilgisi eksik; hibrit ve ofis rolleriyle eşleşmeyi zorlaştırabilir.");
    if (!safeCv.summary || safeCv.summary.length < 60) weaknesses.push("Profil özeti hedef rolü ve doğrulanabilir değeri yeterince açıklamıyor.");
    if (skills.length < 6) weaknesses.push("Beceri kapsamı hedef rol terminolojisi için sınırlı.");
    if (!experience.length) weaknesses.push("Yapılandırılmış deneyim bölümü bulunmuyor.");
    if (bullets.length && !metricBullets.length) weaknesses.push("Deneyim maddelerinde ölçülebilir sonuç görünmüyor.");
  } else {
    if (safeCv.title) strengths.push(`The professional headline makes the target clear: ${safeCv.title}.`);
    if (safeCv.email) strengths.push("A readable contact email is present.");
    if (skills.length >= 6) strengths.push(`${skills.length} skills provide a strong starting point for technical coverage.`);
    if (experience.length) strengths.push(`${experience.length} structured experience section provides career evidence.`);
    if (metricBullets.length) strengths.push(`${metricBullets.length} experience bullet includes a measurable outcome.`);
    if (safeCv.summary && safeCv.summary.length >= 60) strengths.push("The profile summary connects role, expertise, and direction.");
    if (education.length) strengths.push("Education details are complete for screening filters.");

    if (!safeCv.email) weaknesses.push("Contact email is missing and may interrupt the hiring path.");
    if (!safeCv.phone) weaknesses.push("Phone details are missing and may reduce profile completeness in some markets.");
    if (!safeCv.location) weaknesses.push("Location is missing, which may limit hybrid and on-site matching.");
    if (!safeCv.summary || safeCv.summary.length < 60) weaknesses.push("The profile summary does not clearly state the target role and verifiable value.");
    if (skills.length < 6) weaknesses.push("Skill coverage is limited for target-role terminology.");
    if (!experience.length) weaknesses.push("No structured experience section was found.");
    if (bullets.length && !metricBullets.length) weaknesses.push("Experience bullets do not show measurable outcomes.");
  }

  if (!strengths.length) {
    strengths.push(locale === "tr"
      ? "CV yapısı, odaklı düzenlemelerle geliştirilebilecek bir başlangıç sunuyor."
      : "The resume provides a starting structure that can improve with focused edits.");
  }

  const overallScore = Math.round(ats.atsScore * 0.75 + Math.min(25, strengths.length * 4));
  const summaryLine = ats.summary;
  const careerAdvice = locale === "tr" ? [
    "Her hafta yüksek uyumlu 8–12 başvuru, iki hedefli iletişim ve bir prova mülakatından oluşan sürdürülebilir bir ritim kurun.",
    "Başarı, çatışma, hata, liderlik ve teknik karar konularında beş doğrulanabilir STAR hikâyesi hazırlayın.",
    "Hedef rolünüzle eşleşen tek bir portföy kanıtını güncel ve erişilebilir tutun.",
  ] : [
    "Build a sustainable weekly rhythm of 8–12 high-fit applications, two targeted outreach messages, and one mock interview.",
    "Prepare five verifiable STAR stories covering success, conflict, failure, leadership, and a technical decision.",
    "Keep one portfolio artifact aligned with your target role current and accessible.",
  ];

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    atsScore: ats.atsScore,
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    improvements: actionable.map((item) => item.correction),
    careerAdvice,
    summaryLine,
  };
}
