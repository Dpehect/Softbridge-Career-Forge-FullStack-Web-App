import type { CoverLetterResult, CoverLetterTone, MatchAnalysis, ParsedCV } from "./types";

function companyFromJd(jd: string) {
  const m = jd.match(/(?:at|@|şirket|company)\s+([A-Z][A-Za-z0-9&.\-\s]{2,40})/);
  if (m) return m[1].trim();
  const firstLine = jd.split("\n").map((l) => l.trim()).find(Boolean);
  return firstLine?.slice(0, 40) || "şirketiniz";
}

function roleFromJd(jd: string, fallback: string) {
  const m = jd.match(
    /(Senior|Mid|Junior|Lead|Staff)?\s*(Frontend|Backend|Full[- ]?Stack|Software|Product|Data|DevOps)?\s*(Engineer|Developer|Designer|Manager|Mühendisi)?/i
  );
  return m?.[0]?.trim() || fallback || "açık pozisyon";
}

export function generateCoverLetter(
  cv: ParsedCV,
  jd: string,
  tone: CoverLetterTone,
  analysis?: MatchAnalysis | null
): CoverLetterResult {
  const company = companyFromJd(jd);
  const role = roleFromJd(jd, cv.title);
  const skills = (analysis?.matchedSkills?.length ? analysis.matchedSkills : cv.skills)
    .slice(0, 4)
    .join(", ");
  const gapNote = analysis?.missingSkills?.[0];
  const exp = cv.experience[0];

  const toneOpen: Record<CoverLetterTone, string> = {
    Profesyonel: `Sayın İşe Alım Ekibi,\n\n${company} bünyesindeki ${role} ilanınızı inceledim. Profilim ile rolün beklentileri arasındaki örtüşme beni özellikle motive etti; bu mektupta kısa ve net şekilde katkımı özetlemek istiyorum.`,
    Girişimci: `Merhaba,\n\n${company}’in ${role} arayışını görünce doğrudan yazmak istedim. Hızlı öğrenen, sahiplenerek ilerleyen ve ölçülebilir sonuç üreten biriyim — tam da büyüyen ekiplerin ihtiyaç duyduğu türden bir enerjiyle.`,
    Teknik: `Merhaba,\n\n${role} rolü için başvuru mektubum. Teknik stack ve problem alanı açısından ${company} ile uyumum net; aşağıda kanıtlanabilir deneyimim ve yaklaşımım var.`,
  };

  const mid = [
    `${cv.name} olarak ${cv.title || "yazılım"} odaklı bir kariyer yürütüyorum.`,
    skills ? `Öne çıkan yetkinliklerim: ${skills}.` : "",
    exp
      ? `En son ${exp.company} bünyesinde ${exp.position} olarak ${exp.description[0] || "ürün odaklı özellikler geliştirdim"}.`
      : "Üretim ortamında özellik geliştirme, iş birliği ve kaliteli teslimat konusunda pratik deneyimim var.",
    analysis && analysis.matchScore
      ? `Rol ile eşleşme skorum yaklaşık %${analysis.matchScore}; güçlü yönlerimi ilan diline hizalayarak katkı vermek istiyorum.`
      : "",
    gapNote
      ? `${gapNote} tarafında da bilinçli şekilde gelişim planım var; öğrenme hızım ve pratik teslimat disiplinim bu boşluğu kısa sürede kapatmama yardımcı olur.`
      : "Karmaşık problemleri sade çözümlere indirgemeyi ve ekiple net iletişim kurmayı önemsiyorum.",
  ]
    .filter(Boolean)
    .join(" ");

  const close: Record<CoverLetterTone, string> = {
    Profesyonel: `Kısa bir görüşmede deneyimimin ${company} hedeflerine nasıl hizmet edeceğini anlatmaktan memnuniyet duyarım. Zamanınız için teşekkür ederim.\n\nSaygılarımla,\n${cv.name}${cv.email ? `\n${cv.email}` : ""}`,
    Girişimci: `İlk 90 günde net bir etki alanı tanımlayıp hızlıca değer üretmek için sabırsızlanıyorum. Uygun olduğunuz bir zamanda konuşalım.\n\nSevgiler,\n${cv.name}${cv.email ? `\n${cv.email}` : ""}`,
    Teknik: `Sistem tasarımı, kod kalitesi ve ürün metrikleri üzerinden somut örneklerle devam etmeye hazırım. Görüşmek dileğiyle.\n\nİyi çalışmalar,\n${cv.name}${cv.email ? `\n${cv.email}` : ""}`,
  };

  const coverLetter = `${toneOpen[tone]}\n\n${mid}\n\n${close[tone]}`;

  return {
    coverLetter,
    tone,
    keyPoints: [
      `${role} rolüne doğrudan hitap`,
      skills ? `Eşleşen beceriler: ${skills}` : "Profil ve teslimat odaklı anlatım",
      exp ? `${exp.company} deneyiminden kanıt` : "Somut katkı vaadi",
      "Net çağrı ile kapanış",
    ],
  };
}
