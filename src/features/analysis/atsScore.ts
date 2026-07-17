import type { ParsedCV } from "@/lib/forge/types";
import type { Locale } from "@/i18n/messages";

export type AtsCategoryId =
  | "structure"
  | "completeness"
  | "experience"
  | "keywords"
  | "impact"
  | "contact";

export interface AtsCategoryScore {
  id: AtsCategoryId;
  score: number;
  maxScore: number;
}

export interface AtsScoreResult {
  total: number;
  status: "critical" | "needsWork" | "good" | "veryGood" | "strong";
  categories: AtsCategoryScore[];
}

const METRIC_PATTERN = /\d+\s*%|\d+[kKmM]?\+?\s*(users?|kullanıcı|ms|seconds?|saniye|hours?|saat|days?|gün|requests?|istek)|[$€£₺]\s*\d+|\b\d{2,}\+?\b/i;

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)));
}

export function getAtsStatus(score: number): AtsScoreResult["status"] {
  if (score < 50) return "critical";
  if (score < 70) return "needsWork";
  if (score < 85) return "good";
  if (score < 95) return "veryGood";
  return "strong";
}

export function getAtsStatusLabel(status: AtsScoreResult["status"], locale: Locale) {
  const labels = {
    tr: {
      critical: "Kritik iyileştirme gerekli",
      needsWork: "Geliştirilmeli",
      good: "İyi",
      veryGood: "Çok iyi",
      strong: "Güçlü ATS uyumu",
    },
    en: {
      critical: "Critical improvement required",
      needsWork: "Needs improvement",
      good: "Good",
      veryGood: "Very good",
      strong: "Strong ATS alignment",
    },
  } as const;
  return labels[locale][status];
}

export function getAtsSummary(score: number, locale: Locale) {
  if (locale === "tr") {
    if (score >= 85) return "CV'niz genel olarak güçlü bir ATS yapısına sahip. Ölçülebilir sonuçlar ve hedef ilan terminolojisiyle skor daha da yükseltilebilir.";
    if (score >= 70) return "CV yapısı okunabilir durumda. Deneyim kanıtı ve rol odaklı anahtar kelimeler güçlendirildiğinde daha rekabetçi olacaktır.";
    if (score >= 50) return "Temel bölümler mevcut ancak deneyim anlatımı, ölçülebilir etki ve profil bütünlüğü geliştirilmelidir.";
    return "Önce iletişim bilgilerini, temel bölümleri ve yapılandırılmış deneyim maddelerini tamamlayın.";
  }
  if (score >= 85) return "Your resume has a strong ATS structure. Measurable outcomes and target-role terminology can raise it further.";
  if (score >= 70) return "The resume is readable. Stronger evidence and role-specific keywords will make it more competitive.";
  if (score >= 50) return "The foundation is present, but experience quality, measurable impact, and profile completeness need work.";
  return "Complete contact details, essential sections, and structured experience bullets first.";
}

export function calculateAtsScore(cv: ParsedCV): AtsScoreResult {
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const bullets = experience.flatMap((item) => item.description ?? []).filter(Boolean);
  const metricCount = bullets.filter((bullet) => METRIC_PATTERN.test(bullet)).length;

  const structure = clamp(
    5 +
      (cv.rawLength > 200 && cv.rawLength < 7000 ? 5 : 0) +
      (bullets.every((bullet) => bullet.length <= 220) ? 5 : 1) +
      (experience.every((item) => item.company && item.position && item.duration) ? 5 : 2),
    20
  );
  const completeness = clamp(
    (cv.summary && cv.summary.length >= 60 ? 4 : cv.summary ? 2 : 0) +
      (experience.length ? 4 : 0) +
      (skills.length >= 5 ? 4 : skills.length ? 2 : 0) +
      (education.length ? 3 : 0),
    15
  );
  const experienceQuality = clamp(
    (experience.length ? 7 : 0) +
      Math.min(8, bullets.length * 2) +
      (bullets.some((bullet) => /(?:^|\s)(built|led|created|improved|reduced|increased|developed|designed|geliştirdi|yönetti|oluşturdu|iyileştirdi|azalttı|artırdı)(?:\s|[.,;:]|$)/i.test(bullet)) ? 5 : 0) +
      (experience.length >= 2 ? 5 : 2),
    25
  );
  const keywords = clamp(skills.length * 2, 20);
  const impact = clamp(metricCount * 4 + (metricCount > 0 ? 2 : 0), 10);
  const contact = clamp(
    (cv.name && !["Candidate", "Aday"].includes(cv.name) ? 2 : 0) +
      (cv.email ? 3 : 0) +
      (cv.phone ? 2 : 0) +
      (cv.location ? 2 : 0) +
      (cv.title ? 1 : 0),
    10
  );

  const categories: AtsCategoryScore[] = [
    { id: "structure", score: structure, maxScore: 20 },
    { id: "completeness", score: completeness, maxScore: 15 },
    { id: "experience", score: experienceQuality, maxScore: 25 },
    { id: "keywords", score: keywords, maxScore: 20 },
    { id: "impact", score: impact, maxScore: 10 },
    { id: "contact", score: contact, maxScore: 10 },
  ];
  const total = categories.reduce((sum, category) => sum + category.score, 0);
  return { total, status: getAtsStatus(total), categories };
}
