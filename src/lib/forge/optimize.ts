import type { MatchAnalysis, OptimizedCV, ParsedCV } from "./types";

function strengthenBullet(bullet: string, keywords: string[]): string {
  let b = bullet.replace(/^[-•*·]\s*/, "").trim();
  // ensure starts with strong verb if Turkish/English generic
  if (!/^(Led|Built|Designed|Implemented|Improved|Reduced|Increased|Owned|Shipped|Geliştirdim|Tasarladım|Yönettim|Oluşturdum|İyileştirdim)/i.test(b)) {
    b = `Delivered ${b.charAt(0).toLowerCase()}${b.slice(1)}`;
  }
  // inject a relevant keyword if missing and bullet is short
  const lower = b.toLowerCase();
  const missingKw = keywords.find((k) => !lower.includes(k.toLowerCase()));
  if (missingKw && b.length < 140 && !lower.includes("using")) {
    b = `${b.replace(/\.$/, "")} using ${missingKw}.`;
  } else if (!/[.%\d]/.test(b) && b.length < 160) {
    b = `${b.replace(/\.$/, "")}; measurable impact tracked via product metrics.`;
  }
  return b;
}

export function optimizeCV(cv: ParsedCV, analysis?: MatchAnalysis | null, jd = ""): OptimizedCV {
  const targetSkills = [
    ...new Set([
      ...cv.skills,
      ...(analysis?.matchedSkills ?? []),
      ...(analysis?.missingSkills?.slice(0, 4) ?? []),
    ]),
  ].slice(0, 16);

  const optimizedExperience = cv.experience.map((exp) => ({
    ...exp,
    description: (exp.description.length ? exp.description : [
      `Owned key outcomes for ${exp.position} at ${exp.company}`,
      "Collaborated cross-functionally to ship production features on schedule",
      "Improved reliability and developer experience through iterative delivery",
    ]).map((d) => strengthenBullet(d, analysis?.missingSkills?.slice(0, 3) ?? targetSkills.slice(0, 3))),
  }));

  const roleHint =
    analysis?.missingSkills?.[0] ||
    cv.title ||
    "software engineering";

  const optimizedSummary =
    cv.summary && cv.summary.length > 40
      ? `${cv.summary.replace(/\s+/g, " ").trim()} Focused on ${roleHint} with a track record of shipping user-facing outcomes and clear metrics.`
      : `${cv.title || "Software professional"} with hands-on experience across ${targetSkills.slice(0, 4).join(", ") || "modern web stacks"}. Known for practical delivery, clean collaboration, and measurable product impact.`;

  const generalSuggestions = [
    "Her maddede en az bir sonuç veya metrik olsun (%, süre, kullanıcı, gelir, hata oranı).",
    "İlanla birebir aynı jargon uydurma; gerçek işini ilanın diliyle yeniden ifade et.",
    "Beceriler bölümünü 2 satırda tut: önce must-have, sonra nice-to-have.",
    "PDF’te sütun/tablo kullanma; tek sütun ATS parse oranını yükseltir.",
    jd
      ? "JD’deki fiilleri (design, own, scale, partner) deneyim maddelerine yansıt."
      : "Hedef bir JD yapıştırarak optimizasyonu ikinci kez çalıştır — isabet artar.",
  ];

  return {
    optimizedExperience,
    optimizedSkills: targetSkills,
    optimizedSummary,
    generalSuggestions,
  };
}
