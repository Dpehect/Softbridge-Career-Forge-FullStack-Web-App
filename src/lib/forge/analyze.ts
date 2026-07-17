import type { MatchAnalysis, ParsedCV } from "./types";
import { SKILL_LEXICON } from "./parse";
import type { Locale } from "@/i18n/messages";
import { calculateAtsScore, getAtsSummary } from "@/features/analysis/atsScore";

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

export function analyzeMatch(cv: ParsedCV, jd: string, locale: Locale = "tr"): MatchAnalysis {
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

  const atsScore = calculateAtsScore(cv).total;

  const strengths: string[] = [];
  if (matchedSkills.length) {
    strengths.push(locale === "tr"
      ? `İlanla örtüşen beceriler: ${matchedSkills.slice(0, 6).join(", ")}`
      : `Skills aligned with the role: ${matchedSkills.slice(0, 6).join(", ")}`);
  }
  if (cv.experience.length >= 2) {
    strengths.push(locale === "tr" ? "Birden fazla deneyim bölümü, kariyer gelişimini anlatmak için güçlü bir temel sağlıyor." : "Multiple experience sections provide a strong foundation for a clear career narrative.");
  }
  if (cv.summary) {
    strengths.push(locale === "tr" ? "Profil özeti, hedef rol konumlandırması için kullanılabilir." : "The profile summary can support target-role positioning.");
  }
  if (cv.title) {
    strengths.push(locale === "tr" ? `Profesyonel başlık net: ${cv.title}` : `The professional headline is clear: ${cv.title}`);
  }
  if (!strengths.length) {
    strengths.push(locale === "tr" ? "CV içeriği, hedef role göre geliştirilebilecek bir temel sunuyor." : "The resume provides a foundation that can be developed for the target role.");
  }

  const gaps: string[] = [];
  if (missingSkills.length) {
    gaps.push(locale === "tr" ? `Eksik veya zayıf görünen beceriler: ${missingSkills.slice(0, 8).join(", ")}` : `Missing or weak skill signals: ${missingSkills.slice(0, 8).join(", ")}`);
  }
  if (!cv.summary) gaps.push(locale === "tr" ? "Profesyonel profil özeti eksik." : "A professional profile summary is missing.");
  if (cv.experience.every((e) => e.description.length < 2)) {
    gaps.push(locale === "tr" ? "Deneyim maddeleri ölçülebilir sonuçları yeterince göstermiyor." : "Experience bullets do not show enough measurable outcomes.");
  }
  if (!cv.email) gaps.push(locale === "tr" ? "İletişim e-postası tespit edilemedi." : "A contact email could not be detected.");
  if (matchScore < 55) gaps.push(locale === "tr" ? "Hedef rol uyumu düşük; ilan terminolojisiyle dürüst eşleşme güçlendirilmeli." : "Target-role alignment is low; honest alignment with job terminology should be strengthened.");

  const suggestions: string[] = locale === "tr" ? [
    "İlandaki en kritik beş anahtar kelimeyi yalnızca gerçek deneyiminizle destekleyebildiğiniz yerlerde kullanın.",
    "Her deneyim maddesini eylem, yöntem ve doğrulanmış sonuç sırasıyla yeniden yazın.",
    missingSkills[0]
      ? `"${missingSkills[0]}" için proje, eğitim veya iş deneyiminden doğrulanabilir bir kanıt ekleyin.`
      : "Güçlü eşleşen becerileri portföy veya proje bağlantısıyla kanıtlayın.",
    "ATS için bölüm başlıklarını sade tutun: Deneyim, Beceriler ve Eğitim.",
  ] : [
    "Use the five most important job keywords only where they are supported by real experience.",
    "Rewrite each experience bullet in the order of action, method, and verified outcome.",
    missingSkills[0]
      ? `Add verifiable evidence for "${missingSkills[0]}" from a project, course, or work experience.`
      : "Support strongly aligned skills with a portfolio or project link.",
    "Keep ATS section headings simple: Experience, Skills, and Education.",
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

export function analyzeAts(cv: ParsedCV, jd = "", locale: Locale = "tr") {
  const analysis = analyzeMatch(cv, jd || cv.skills.join(" "), locale);
  const score = calculateAtsScore(cv);
  const issues: string[] = [];
  const fixes: string[] = [];

  if (!cv.email) {
    issues.push(locale === "tr" ? "E-posta alanı eksik veya algılanamadı." : "The email field is missing or could not be detected.");
    fixes.push(locale === "tr" ? "CV'nin üst bölümüne ad, e-posta, telefon ve şehir bilgisi ekleyin." : "Add name, email, phone, and location to the resume header.");
  }
  if (cv.skills.length < 5) {
    issues.push(locale === "tr" ? "Beceri listesi hedef rol için dar kalıyor." : "The skills list is narrow for the target role.");
    fixes.push(locale === "tr" ? "Yalnızca doğrulayabildiğiniz 6–10 rol becerisini ekleyin." : "Add 6–10 role skills that you can verify with real experience.");
  }
  if (cv.experience.some((e) => e.description.some((d) => d.length > 220))) {
    issues.push(locale === "tr" ? "Bazı deneyim maddeleri taranamayacak kadar uzun." : "Some experience bullets are too long to scan efficiently.");
    fixes.push(locale === "tr" ? "Her maddeyi bir veya iki satırda eylem ve sonuç yapısıyla kısaltın." : "Shorten each bullet to one or two lines using action and outcome.");
  }
  if (!cv.experience.length) {
    issues.push(locale === "tr" ? "Deneyim bölümü bulunamadı veya yapılandırılmadı." : "The experience section is missing or unstructured.");
    fixes.push(locale === "tr" ? "Şirket, pozisyon, tarih ve 3–5 sonuç maddesi ekleyin." : "Add company, role, dates, and 3–5 outcome bullets.");
  }
  if (analysis.missingSkills.length > 5) {
    issues.push(locale === "tr" ? "Hedef ilan terminolojisiyle düşük örtüşme var." : "Alignment with target-job terminology is low.");
    fixes.push(locale === "tr" ? "Eksik terimleri yalnızca gerçek deneyimle eşleştiğinde ekleyin; deneyim uydurmayın." : "Add missing terms only when supported by real experience; never invent evidence.");
  }
  if (!issues.length) {
    issues.push(locale === "tr" ? "Kritik yapısal sorun görünmüyor." : "No critical structural issue was detected.");
    fixes.push(locale === "tr" ? "Hedef rol terminolojisini ve ölçülebilir sonuçları geliştirin." : "Refine target-role terminology and measurable outcomes.");
  }

  const keywordCoverage = analysis.matchedSkills.length + analysis.missingSkills.length
    ? Math.round(
        (analysis.matchedSkills.length /
          Math.max(1, analysis.matchedSkills.length + analysis.missingSkills.length)) *
          100
      )
    : 50;

  return {
    atsScore: score.total,
    issues,
    fixes,
    keywordCoverage,
    status: score.status,
    summary: getAtsSummary(score.total, locale),
    breakdown: score.categories,
  };
}
