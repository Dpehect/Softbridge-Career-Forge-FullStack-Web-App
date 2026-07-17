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
  weight: string;
  evidence: string[];
  missing: string[];
  correction: string;
}

export interface AtsScoreResult {
  total: number;
  status: "critical" | "needsWork" | "good" | "veryGood" | "strong";
  categories: AtsCategoryScore[];
}

const METRIC_PATTERN = /\d+\s*%|\d+[kKmM]?\+?\s*(users?|kullanıcı|ms|seconds?|saniye|hours?|saat|days?|gün|requests?|istek)|[$€£₺]\s*\d+|\b\d{2,}\+?\b/i;
const ACTION_VERB_PATTERN = /(?:^|\s)(built|led|created|improved|reduced|increased|developed|designed|geliştirdi|yönetti|oluşturdu|iyileştirdi|azalttı|artırdı|başlattı|launched|implemented|engineered|managed)(?:\s|[.,;:]|$)/i;

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

export function calculateAtsScore(cv: ParsedCV, locale: Locale = "en"): AtsScoreResult {
  const isTr = locale === "tr";
  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const bullets = experience.flatMap((item) => item.description ?? []).filter(Boolean);
  const metricCount = bullets.filter((bullet) => METRIC_PATTERN.test(bullet)).length;

  // --- 1. Contact Category ---
  const contactEvidence: string[] = [];
  const contactMissing: string[] = [];
  let contactScore = 0;

  if (cv.name && !["Candidate", "Aday"].includes(cv.name)) {
    contactScore += 2;
    contactEvidence.push(isTr ? "Ad girildi" : "Name present");
  } else {
    contactMissing.push(isTr ? "Aday ismi eksik veya geçersiz" : "Candidate name missing or default");
  }

  if (cv.email) {
    contactScore += 3;
    contactEvidence.push(isTr ? "E-posta girildi" : "Email present");
  } else {
    contactMissing.push(isTr ? "E-posta bilgisi eksik" : "Email missing");
  }

  if (cv.phone) {
    contactScore += 2;
    contactEvidence.push(isTr ? "Telefon numarası girildi" : "Phone number present");
  } else {
    contactMissing.push(isTr ? "Telefon numarası eksik" : "Phone number missing");
  }

  if (cv.location) {
    contactScore += 2;
    contactEvidence.push(isTr ? "Konum girildi" : "Location present");
  } else {
    contactMissing.push(isTr ? "Konum bilgisi eksik" : "Location missing");
  }

  // Check for portfolio/linkedin links in profile summary or website
  const hasLinks = Boolean(cv.photoDataUrl || cv.email?.includes("@") || cv.summary?.toLowerCase().includes("linkedin.com") || cv.summary?.toLowerCase().includes("github.com"));
  if (hasLinks) {
    contactScore += 1;
    contactEvidence.push(isTr ? "Profesyonel ağ/portfolyo bağlantısı algılandı" : "Professional link detected");
  } else {
    contactMissing.push(isTr ? "LinkedIn/GitHub veya portfolyo bağlantısı bulunamadı" : "No portfolio or LinkedIn/GitHub links found");
  }
  
  const contactCat: AtsCategoryScore = {
    id: "contact",
    score: clamp(contactScore, 10),
    maxScore: 10,
    weight: "10%",
    evidence: contactEvidence,
    missing: contactMissing,
    correction: isTr
      ? "İletişim bilgilerini (özellikle telefon, e-posta) ve LinkedIn/GitHub bağlantılarınızı eksiksiz sağlayın."
      : "Provide your phone number, location, and professional URLs (LinkedIn/GitHub) to maximize contact relevance."
  };

  // --- 2. Structure Category ---
  const structEvidence: string[] = [];
  const structMissing: string[] = [];
  let structScore = 5;

  if (cv.rawLength > 200 && cv.rawLength < 7000) {
    structScore += 5;
    structEvidence.push(isTr ? "Optimal karakter uzunluğu (tek veya iki sayfa sığabilir)" : "Optimal character length");
  } else {
    structMissing.push(isTr ? "Belge boyutu çok kısa veya çok uzun" : "Document length is suboptimal");
  }

  const longBullets = bullets.filter((bullet) => bullet.length > 220);
  if (longBullets.length === 0) {
    structScore += 5;
    structEvidence.push(isTr ? "Maddeler kısa ve net (okunabilirlik yüksek)" : "Concise bullet points");
  } else {
    structMissing.push(isTr ? `${longBullets.length} madde çok uzun (220+ karakter)` : `${longBullets.length} bullets are too long (220+ chars)`);
  }

  const missingExpDetails = experience.some((item) => !item.company || !item.position || !item.duration);
  if (!missingExpDetails) {
    structScore += 5;
    structEvidence.push(isTr ? "Tüm deneyimlerde şirket, ünvan ve tarih bilgisi tam" : "Complete experience metadata");
  } else {
    structMissing.push(isTr ? "Bazı deneyimlerde şirket, ünvan veya tarih eksik" : "Missing company, title, or dates in some experience entries");
  }

  const structCat: AtsCategoryScore = {
    id: "structure",
    score: clamp(structScore, 20),
    maxScore: 20,
    weight: "20%",
    evidence: structEvidence,
    missing: structMissing,
    correction: isTr
      ? "Tüm iş deneyimlerinizi 'Pozisyon - Şirket - Tarih aralığı' formatında sunun. Maddeleri 200 karakter altında tutun."
      : "Structure all experience records with exact titles, companies, and dates. Keep bullets under 200 characters for high readability."
  };

  // --- 3. Completeness Category ---
  const compEvidence: string[] = [];
  const compMissing: string[] = [];
  let compScore = 0;

  if (cv.summary && cv.summary.length >= 60) {
    compScore += 4;
    compEvidence.push(isTr ? "Profesyonel özet bölümü tamamlanmış" : "Professional summary completed");
  } else {
    compMissing.push(isTr ? "Profesyonel özet eksik veya 60 karakterden kısa" : "Summary missing or too short");
  }

  if (experience.length > 0) {
    compScore += 4;
    compEvidence.push(isTr ? "İş deneyimi bölümü mevcut" : "Experience section present");
  } else {
    compMissing.push(isTr ? "Hiç iş deneyimi girilmemiş" : "No work experience listed");
  }

  if (skills.length >= 5) {
    compScore += 4;
    compEvidence.push(isTr ? `Beceriler girildi (${skills.length} adet)` : `Skills populated (${skills.length} items)`);
  } else {
    compMissing.push(isTr ? "En az 5 beceri listelenmeli" : "Less than 5 skills listed");
  }

  if (education.length > 0) {
    compScore += 3;
    compEvidence.push(isTr ? "Eğitim bilgisi mevcut" : "Education section present");
  } else {
    compMissing.push(isTr ? "Eğitim bilgisi girilmemiş" : "No education listed");
  }

  const compCat: AtsCategoryScore = {
    id: "completeness",
    score: clamp(compScore, 15),
    maxScore: 15,
    weight: "15%",
    evidence: compEvidence,
    missing: compMissing,
    correction: isTr
      ? "Özgeçmişinizin temel yapı taşlarını tamamlayın: 2-3 cümlelik bir Özet, en az 5 beceri ve eğitim bilgilerinizi ekleyin."
      : "Complete all sections. Draft a concise summary, list at least 5 key skills, and add education details."
  };

  // --- 4. Experience Quality Category ---
  const expEvidence: string[] = [];
  const expMissing: string[] = [];
  let expScore = 0;

  if (experience.length > 0) {
    expScore += 7;
    expEvidence.push(isTr ? "En az bir deneyim kaydı bulundu" : "Work history entries present");
  } else {
    expMissing.push(isTr ? "Deneyim bulunamadı" : "No experience listed");
  }

  const verbBullets = bullets.filter((b) => ACTION_VERB_PATTERN.test(b));
  if (verbBullets.length > 0) {
    expScore += 5;
    expEvidence.push(isTr ? "Etken eylem fiilleri (geliştirdi, yönetti vb.) kullanıldı" : "Active action verbs detected");
  } else {
    expMissing.push(isTr ? "Deneyim maddelerinde etken eylem fiili bulunamadı" : "Lack of active action verbs");
  }

  if (bullets.length >= 4) {
    expScore += 8;
    expEvidence.push(isTr ? "Yeterli açıklama maddesi detayı" : "Sufficient experience details");
  } else {
    expMissing.push(isTr ? "Açıklama maddeleri çok yetersiz" : "Suboptimal experience detail");
  }

  if (experience.length >= 2) {
    expScore += 5;
    expEvidence.push(isTr ? "Çoklu pozisyon geçmişi kanıtlandı" : "Multiple positions listed");
  } else {
    expMissing.push(isTr ? "Tek bir deneyim listelenmiş, kariyer gelişimi az" : "Only one position listed");
  }

  const expCat: AtsCategoryScore = {
    id: "experience",
    score: clamp(expScore, 25),
    maxScore: 25,
    weight: "25%",
    evidence: expEvidence,
    missing: expMissing,
    correction: isTr
      ? "Deneyimlerinizi tanımlarken pasif ifadeler yerine 'Tasarladı', 'Entegre etti', 'Yönetti' gibi aktif fiiller kullanın."
      : "Describe your roles with active action verbs (e.g. 'Engineered', 'Launched', 'Spearheaded') and add depth to your bullets."
  };

  // --- 5. Keywords Category ---
  const kwEvidence: string[] = [];
  const kwMissing: string[] = [];
  let kwScore = clamp(skills.length * 2, 20);

  if (skills.length >= 8) {
    kwEvidence.push(isTr ? "Güçlü anahtar kelime ve araç yelpazesi" : "Rich variety of tools and keywords");
  } else {
    kwMissing.push(isTr ? "Kısıtlı anahtar kelime kapsamı" : "Limited keyword range");
  }

  const kwCat: AtsCategoryScore = {
    id: "keywords",
    score: clamp(kwScore, 20),
    maxScore: 20,
    weight: "20%",
    evidence: kwEvidence,
    missing: kwMissing,
    correction: isTr
      ? "İş ilanlarında en çok aranan teknik araç, kütüphane ve metodolojileri listeye ekleyin."
      : "Include 8-15 technical skills, tools, and methodologies relevant to your target career role."
  };

  // --- 6. Impact Category ---
  const impactEvidence: string[] = [];
  const impactMissing: string[] = [];
  let impactScore = clamp(metricCount * 4 + (metricCount > 0 ? 2 : 0), 10);

  if (metricCount > 0) {
    impactEvidence.push(isTr ? `${metricCount} maddede ölçülebilir sonuç/metrik algılandı` : `${metricCount} metrics/percentages detected`);
  } else {
    impactMissing.push(isTr ? "Hiçbir maddede ölçülebilir veri (sayı, yüzde) bulunamadı" : "No measurable figures or percentages found");
  }

  const impactCat: AtsCategoryScore = {
    id: "impact",
    score: clamp(impactScore, 10),
    maxScore: 10,
    weight: "10%",
    evidence: impactEvidence,
    missing: impactMissing,
    correction: isTr
      ? "Deneyimlerinize ölçülebilir etki ekleyin: örn. '%30 hız kazandırdı', '5 kişilik ekibe liderlik etti', '$10k bütçe yönetti'."
      : "Include quantifiable achievements in your bullets (e.g. 'reduced latency by 30%', 'managed $5k budget', 'led 3 developers')."
  };

  const categories = [structCat, compCat, expCat, kwCat, impactCat, contactCat];
  const total = categories.reduce((sum, category) => sum + category.score, 0);

  return { total, status: getAtsStatus(total), categories };
}
