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
  const extras = jd.match(/\b[A-Z][a-zA-Z.+#]{1,20}\b/g) ?? [];
  for (const e of extras) {
    if (["The", "And", "With", "Our", "You", "We", "This", "Job", "Role"].includes(e)) continue;
    if (e.length > 2 && found.length < 25 && !found.includes(e)) {
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
  const isTr = locale === "tr";
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

  // 1. Required vs Preferred Skills Separation
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];
  const jdLower = jd.toLowerCase();

  jdSkills.forEach((skill) => {
    const idx = jdLower.indexOf(skill.toLowerCase());
    if (idx !== -1) {
      const surrounding = jdLower.substring(Math.max(0, idx - 80), Math.min(jdLower.length, idx + 80));
      if (/require|must|need|essential|experience in|strong command|şart|zorunlu|gereklidir/i.test(surrounding)) {
        requiredSkills.push(skill);
      } else {
        preferredSkills.push(skill);
      }
    } else {
      requiredSkills.push(skill);
    }
  });

  if (requiredSkills.length === 0) {
    const mid = Math.ceil(jdSkills.length * 0.6);
    requiredSkills.push(...jdSkills.slice(0, mid));
    preferredSkills.push(...jdSkills.slice(mid));
  }

  const matchedRequired = requiredSkills.filter((s) => {
    const n = normalizeSkill(s);
    return cvSkills.some((c) => c.includes(n) || n.includes(c)) || cvBlob.includes(n);
  });
  const matchedPreferred = preferredSkills.filter((s) => {
    const n = normalizeSkill(s);
    return cvSkills.some((c) => c.includes(n) || n.includes(c)) || cvBlob.includes(n);
  });

  const requiredSkillsCoverage = requiredSkills.length ? Math.round((matchedRequired.length / requiredSkills.length) * 100) : 0;
  const preferredSkillsCoverage = preferredSkills.length ? Math.round((matchedPreferred.length / preferredSkills.length) * 100) : 0;

  // 2. Experience Alignment
  const jdYearsMatch = jd.match(/(\d+)\+?\s*(?:years?|yıl)\b/i);
  const jdYearsTarget = jdYearsMatch ? parseInt(jdYearsMatch[1], 10) : null;
  
  let cvYearsTotal = 0;
  cv.experience.forEach((exp) => {
    const dur = exp.duration;
    const years = dur.match(/\b(20\d{2})\b/g);
    if (years && years.length >= 2) {
      cvYearsTotal += Math.max(1, parseInt(years[1], 10) - parseInt(years[0], 10));
    } else {
      cvYearsTotal += 1.5;
    }
  });
  const experienceAlignment = jdYearsTarget
    ? Math.min(100, Math.round((cvYearsTotal / jdYearsTarget) * 100))
    : 0;

  // 3. Location Compatibility
  let locationCompatibility = 0;
  const isJdRemote = /remote|uzaktan|evden/i.test(jd);
  const isJdOnsite = /on-site|onsite|ofiste|ofisten/i.test(jd);
  
  if (isJdRemote && !isJdOnsite) {
    locationCompatibility = 100;
  } else if (isJdOnsite && cv.location) {
    const cvLocs = cv.location.toLowerCase().split(/[\s,]+/);
    const jdLocs = jd.toLowerCase().split(/[\s,]+/);
    const match = cvLocs.some((l) => l.length > 3 && jdLocs.includes(l));
    locationCompatibility = match ? 100 : 50;
  }

  // 4. Language Compatibility
  let languageCompatibility = 0;
  const requiresEnglish = /english|ingilizce/i.test(jd);
  const requiresTurkish = /turkish|türkçe/i.test(jd);
  const cvTextLower = cvBlob;
  
  if (requiresEnglish || requiresTurkish) {
    languageCompatibility = 100;
    if (requiresEnglish && !cvTextLower.includes("english") && !cvTextLower.includes("ingilizce")) languageCompatibility -= 40;
    if (requiresTurkish && !cvTextLower.includes("turkish") && !cvTextLower.includes("türkçe")) languageCompatibility -= 30;
  }

  // 5. Evidence Strength
  let evidenceHits = 0;
  matchedSkills.forEach((skill) => {
    const sNorm = normalizeSkill(skill);
    const inExperienceDetails = cv.experience.some((exp) => 
      exp.description.some((bullet) => bullet.toLowerCase().includes(sNorm))
    );
    if (inExperienceDetails) {
      evidenceHits++;
    }
  });
  const evidenceStrength = matchedSkills.length ? Math.round((evidenceHits / matchedSkills.length) * 100) : 0;

  // 6. Overall Weighted Match Score
  const dimensions = [
    requiredSkills.length > 0 && { score: requiredSkillsCoverage, weight: 35 },
    preferredSkills.length > 0 && { score: preferredSkillsCoverage, weight: 15 },
    jdYearsTarget !== null && cvYearsTotal > 0 && { score: experienceAlignment, weight: 25 },
    (isJdRemote || isJdOnsite) && { score: locationCompatibility, weight: 10 },
    (requiresEnglish || requiresTurkish) && { score: languageCompatibility, weight: 10 },
    matchedSkills.length > 0 && { score: evidenceStrength, weight: 5 },
  ].filter((value): value is { score: number; weight: number } => Boolean(value));
  const totalWeight = dimensions.reduce((sum, item) => sum + item.weight, 0);
  const rawMatchScore = totalWeight
    ? Math.min(96, Math.round(dimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight))
    : 0;
  const scoreConfidence = totalWeight >= 80 && jdSkills.length >= 4 && jd.trim().length >= 180
    ? "high"
    : totalWeight >= 45 && jdSkills.length >= 2
      ? "medium"
      : "low";
  const confidenceCap = scoreConfidence === "high" ? 93 : scoreConfidence === "medium" ? 82 : 65;
  const matchScore = Math.min(confidenceCap, rawMatchScore);
  const margin = scoreConfidence === "high" ? 4 : scoreConfidence === "medium" ? 8 : 12;
  const scoreRange = {
    min: Math.max(0, matchScore - margin),
    max: Math.min(confidenceCap, matchScore + margin),
  };
  const evaluatedDimensions: NonNullable<MatchAnalysis["evaluatedDimensions"]> = [
    requiredSkills.length > 0 && "requiredSkills",
    preferredSkills.length > 0 && "preferredSkills",
    jdYearsTarget !== null && cvYearsTotal > 0 && "experience",
    (isJdRemote || isJdOnsite) && "location",
    (requiresEnglish || requiresTurkish) && "language",
    matchedSkills.length > 0 && "evidence",
  ].filter((value): value is NonNullable<MatchAnalysis["evaluatedDimensions"]>[number] => Boolean(value));
  const missingInputs = [
    jdSkills.length === 0 && (isTr ? "İlandan güvenilir beceri çıkarılamadı" : "No reliable skills could be extracted from the listing"),
    jdYearsTarget === null && (isTr ? "Deneyim yılı belirtilmemiş" : "Required years of experience were not specified"),
    !(isJdRemote || isJdOnsite) && (isTr ? "Çalışma modeli belirtilmemiş" : "Work model was not specified"),
    !(requiresEnglish || requiresTurkish) && (isTr ? "Dil gereksinimi belirtilmemiş" : "Language requirement was not specified"),
  ].filter((value): value is string => Boolean(value));

  // 7. Explanations
  const scoreExplanations: string[] = [];
  if (requiredSkills.length > 0 && requiredSkillsCoverage >= 80) {
    scoreExplanations.push(isTr 
      ? `+ İlandaki zorunlu becerilerin çoğuna (%${requiredSkillsCoverage}) sahipsiniz.` 
      : `+ You match most of the required skills (%${requiredSkillsCoverage}).`);
  } else if (requiredSkills.length > 0) {
    scoreExplanations.push(isTr 
      ? `- Zorunlu becerilerin %${100 - requiredSkillsCoverage}'si özgeçmişinizde eksik.` 
      : `- Missing %${100 - requiredSkillsCoverage} of the required skills.`);
  }

  if (jdYearsTarget !== null && cvYearsTotal > 0 && experienceAlignment >= 90) {
    scoreExplanations.push(isTr
      ? `+ İstenen deneyim süresini (%${experienceAlignment}) tam karşılıyorsunuz.`
      : `+ Your years of experience match the target (%${experienceAlignment}).`);
  } else if (jdYearsTarget !== null && cvYearsTotal > 0) {
    scoreExplanations.push(isTr
      ? `- İstenen deneyim süresinin (%${100 - experienceAlignment}) altındasınız.`
      : `- Your experience length is below the target (%${100 - experienceAlignment}).`);
  }

  if (matchedSkills.length > 0 && evidenceStrength >= 70) {
    scoreExplanations.push(isTr
      ? `+ Becerilerinizin çoğu (%${evidenceStrength}) iş deneyimi açıklamalarında kanıtlarla desteklenmiş.`
      : `+ Most skills (%${evidenceStrength}) are backed by evidence in experience bullets.`);
  } else if (matchedSkills.length > 0) {
    scoreExplanations.push(isTr
      ? `- Becerileriniz sadece listelenmiş; iş deneyiminde kanıt eksikliği var.`
      : `- Skills are only listed; they lack verifiable evidence in your roles.`);
  }

  if (locationCompatibility < 80) {
    scoreExplanations.push(isTr
      ? `- Konum ve çalışma şekli uyumu (%${locationCompatibility}) yetersiz.`
      : `- Location and work mode compatibility (%${locationCompatibility}) is suboptimal.`);
  }

  const strengths: string[] = [];
  if (matchedSkills.length) {
    strengths.push(isTr
      ? `İlanla örtüşen beceriler: ${matchedSkills.slice(0, 6).join(", ")}`
      : `Skills aligned with the role: ${matchedSkills.slice(0, 6).join(", ")}`);
  }
  if (cv.experience.length >= 2) {
    strengths.push(isTr ? "Birden fazla deneyim bölümü, kariyer gelişimi için güçlü bir temel sağlıyor." : "Multiple experience sections provide a strong foundation for career progression.");
  }
  if (cv.summary) {
    strengths.push(isTr ? "Profil özeti, hedef rol konumlandırması için güçlü." : "The profile summary supports target-role positioning.");
  }

  const gaps: string[] = [];
  if (missingSkills.length) {
    gaps.push(isTr ? `Eksik veya zayıf beceri sinyalleri: ${missingSkills.slice(0, 8).join(", ")}` : `Missing or weak skill signals: ${missingSkills.slice(0, 8).join(", ")}`);
  }

  const suggestions: string[] = isTr ? [
    "İlandaki zorunlu anahtar kelimeleri sadece gerçek deneyiminiz olan yerlerde dürüstçe kullanın.",
    "Her deneyim maddesini eylem, yöntem ve doğrulanmış sonuç sırasıyla zenginleştirin.",
    missingSkills[0]
      ? `"${missingSkills[0]}" için iş deneyiminizden veya bir projenizden kanıt ekleyin.`
      : "Becerilerinizi projeler ve sertifikalarla destekleyin.",
  ] : [
    "Use critical job keywords only where they are supported by real experience.",
    "Rewrite each experience bullet in the order of action, method, and verified outcome.",
    missingSkills[0]
      ? `Add verifiable evidence for "${missingSkills[0]}" from a project, course, or work experience.`
      : "Support skills with a portfolio or project link.",
  ];

  const atsScore = calculateAtsScore(cv, locale).total;

  return {
    matchScore,
    strengths,
    gaps,
    suggestions,
    atsScore,
    matchedSkills,
    missingSkills,
    requiredSkillsCoverage,
    preferredSkillsCoverage,
    experienceAlignment,
    locationCompatibility,
    languageCompatibility,
    evidenceStrength,
    scoreExplanations,
    scoreConfidence,
    rubricVersion: "match-v2",
    missingInputs,
    scoreRange,
    evaluatedDimensions,
  };
}

export function analyzeAts(cv: ParsedCV, jd = "", locale: Locale = "tr") {
  const analysis = jd.trim() ? analyzeMatch(cv, jd, locale) : null;
  const score = calculateAtsScore(cv, locale);
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
  if (analysis && analysis.missingSkills.length > 5) {
    issues.push(locale === "tr" ? "Hedef ilan terminolojisiyle düşük örtüşme var." : "Alignment with target-job terminology is low.");
    fixes.push(locale === "tr" ? "Eksik terimleri yalnızca gerçek deneyimle eşleştiğinde ekleyin; deneyim uydurmayın." : "Add missing terms only when supported by real experience; never invent evidence.");
  }
  if (!issues.length) {
    issues.push(locale === "tr" ? "Kritik yapısal sorun görünmüyor." : "No critical structural issue was detected.");
    fixes.push(locale === "tr" ? "Hedef rol terminolojisini ve ölçülebilir sonuçları geliştirin." : "Refine target-role terminology and measurable outcomes.");
  }

  const keywordCategory = score.categories.find((category) => category.id === "keywords");
  const keywordCoverage = analysis && analysis.matchedSkills.length + analysis.missingSkills.length
    ? Math.round(
        (analysis.matchedSkills.length /
          Math.max(1, analysis.matchedSkills.length + analysis.missingSkills.length)) *
          100
      )
    : keywordCategory
      ? Math.round((keywordCategory.score / keywordCategory.maxScore) * 100)
      : 0;

  return {
    atsScore: score.total,
    issues,
    fixes,
    keywordCoverage,
    status: score.status,
    summary: getAtsSummary(score.total, locale),
    breakdown: score.categories,
    confidence: score.confidence,
    rubricVersion: score.rubricVersion,
    missingInputs: score.missingInputs,
    scoreRange: score.scoreRange,
  };
}
