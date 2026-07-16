import type { MatchAnalysis, ParsedCV } from "./types";
import { SKILL_LEXICON } from "./parse";

function extractJdSkills(jd: string) {
  const lower = jd.toLowerCase();
  const found: string[] = [];
  for (const skill of SKILL_LEXICON) {
    if (lower.includes(skill)) {
      const pretty =
        skill === "nextjs"
          ? "Next.js"
          : skill === "node" || skill === "node.js"
            ? "Node.js"
            : skill === "javascript"
              ? "JavaScript"
              : skill === "typescript"
                ? "TypeScript"
                : skill.charAt(0).toUpperCase() + skill.slice(1);
      if (!found.includes(pretty)) found.push(pretty);
    }
  }
  // quoted or Capitalized tokens often used as tools
  const extras = jd.match(/\b[A-Z][a-zA-Z.+#]{1,20}\b/g) ?? [];
  for (const e of extras) {
    if (["The", "And", "With", "Our", "You", "We", "This", "Job", "Role"].includes(e)) continue;
    if (e.length > 2 && found.length < 25 && !found.includes(e)) {
      // only add if appears in skill-ish context
      if (/react|node|cloud|data|design|api|sql|aws|git/i.test(jd) || SKILL_LEXICON.includes(e.toLowerCase())) {
        found.push(e);
      }
    }
  }
  return found;
}

function normalizeSkill(s: string) {
  return s.toLowerCase().replace(/\./g, "").trim();
}

export function analyzeMatch(cv: ParsedCV, jd: string): MatchAnalysis {
  const jdSkills = extractJdSkills(jd);
  const cvSkills = cv.skills.map(normalizeSkill);
  const cvBlob = [
    cv.title,
    cv.summary ?? "",
    ...cv.skills,
    ...cv.experience.flatMap((e) => [e.position, e.company, ...e.description]),
  ]
    .join(" ")
    .toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jdSkills) {
    const n = normalizeSkill(skill);
    if (cvSkills.some((c) => c.includes(n) || n.includes(c)) || cvBlob.includes(n)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillRatio = jdSkills.length ? matchedSkills.length / jdSkills.length : 0.4;
  const expBoost = Math.min(cv.experience.length * 4, 16);
  const summaryBoost = cv.summary && cv.summary.length > 60 ? 6 : 0;
  const emailBoost = cv.email ? 3 : 0;

  let matchScore = Math.round(skillRatio * 70 + expBoost + summaryBoost + emailBoost);
  matchScore = Math.max(18, Math.min(96, matchScore));

  // ATS score: structure + keywords
  let atsScore = 40;
  if (cv.email) atsScore += 8;
  if (cv.skills.length >= 5) atsScore += 12;
  if (cv.experience.length >= 1) atsScore += 12;
  if (cv.experience.some((e) => e.description.length >= 2)) atsScore += 10;
  if (matchedSkills.length >= 3) atsScore += 12;
  if (cv.rawLength > 400 && cv.rawLength < 6000) atsScore += 6;
  atsScore = Math.max(20, Math.min(98, atsScore));

  const strengths: string[] = [];
  if (matchedSkills.length) {
    strengths.push(`İlanla örtüşen beceriler: ${matchedSkills.slice(0, 6).join(", ")}`);
  }
  if (cv.experience.length >= 2) {
    strengths.push("Birden fazla deneyim bloğu mevcut — hikaye anlatımı için iyi zemin.");
  }
  if (cv.summary) {
    strengths.push("Özet/profil metni var; konumlandırma için kullanılabilir.");
  }
  if (cv.title) {
    strengths.push(`Başlık net görünüyor: ${cv.title}`);
  }
  if (!strengths.length) {
    strengths.push("CV içeriği yüklendi; hedefe göre şekillendirilebilir bir temel var.");
  }

  const gaps: string[] = [];
  if (missingSkills.length) {
    gaps.push(`Eksik veya zayıf görünen beceriler: ${missingSkills.slice(0, 8).join(", ")}`);
  }
  if (!cv.summary) gaps.push("Güçlü bir profesyonel özet eksik.");
  if (cv.experience.every((e) => e.description.length < 2)) {
    gaps.push("Deneyim maddeleri ölçülebilir başarıdan yoksun görünüyor.");
  }
  if (!cv.email) gaps.push("İletişim e-postası tespit edilemedi (ATS için kritik).");
  if (matchScore < 55) gaps.push("Genel uyum orta-altı; ilan diline daha fazla hizalama gerekli.");

  const suggestions: string[] = [
    "İlandaki en kritik 5 anahtar kelimeyi özet ve ilk 2 deneyim maddesine doğal şekilde ekle.",
    "Her deneyim maddesini Etki + Metrik + Yöntem formatına çevir (ör. %X iyileşme, N kullanıcı).",
    missingSkills[0]
      ? `"${missingSkills[0]}" için mini kanıt üret: proje, kurs veya iş maddesi.`
      : "Zaten iyi örtüşen becerileri portföy linki veya proje ile kanıtla.",
    "ATS için başlıkları sade tut: Deneyim, Beceriler, Eğitim — tablo/ikon kullanma.",
  ];

  return {
    matchScore,
    strengths,
    gaps,
    suggestions,
    atsScore,
    matchedSkills,
    missingSkills,
  };
}

export function analyzeAts(cv: ParsedCV, jd = ""): {
  atsScore: number;
  issues: string[];
  fixes: string[];
  keywordCoverage: number;
} {
  const analysis = analyzeMatch(cv, jd || cv.skills.join(" "));
  const issues: string[] = [];
  const fixes: string[] = [];

  if (!cv.email) {
    issues.push("E-posta alanı eksik veya algılanamadı");
    fixes.push("CV başına ad + e-posta + telefon + şehir satırı ekle");
  }
  if (cv.skills.length < 5) {
    issues.push("Beceri listesi zayıf (ATS anahtar kelime yoğunluğu düşük)");
    fixes.push("JD’den 6–10 teknik/araç anahtar kelimesini Beceriler bölümüne ekle");
  }
  if (cv.experience.some((e) => e.description.some((d) => d.length > 220))) {
    issues.push("Çok uzun maddeler parse edilebilirliği düşürebilir");
    fixes.push("Her maddeyi 1–2 satırda, fiil + sonuç formatında kısalt");
  }
  if (!cv.experience.length) {
    issues.push("Deneyim bölümü zayıf yapılandırılmış");
    fixes.push("Şirket | Pozisyon | Tarih + 3–5 bullet düzenine geç");
  }
  if (analysis.missingSkills.length > 5) {
    issues.push("İlan anahtar kelimeleriyle düşük örtüşme");
    fixes.push("Eksik kelimeleri gerçek deneyimle eşleştir; uydurma, yeniden ifade et");
  }
  if (!issues.length) {
    issues.push("Kritik yapısal sorun görünmüyor");
    fixes.push("PDF yerine .docx veya sade metin yüklemeyi de test et");
  }

  const keywordCoverage = analysis.matchedSkills.length + analysis.missingSkills.length
    ? Math.round(
        (analysis.matchedSkills.length /
          Math.max(1, analysis.matchedSkills.length + analysis.missingSkills.length)) *
          100
      )
    : 50;

  return {
    atsScore: analysis.atsScore,
    issues,
    fixes,
    keywordCoverage,
  };
}
