import type { InterviewQuestion, InterviewResult, ParsedCV } from "./types";

export function generateInterview(cv: ParsedCV, jd = ""): InterviewResult {
  const role = cv.title || "Software Engineer";
  const skill = cv.skills[0] || "TypeScript";
  const company = cv.experience[0]?.company || "önceki ekibiniz";
  const isFrontend = /frontend|react|next/i.test(`${role} ${cv.skills.join(" ")} ${jd}`);
  const isBackend = /backend|api|node|java|go|python/i.test(`${role} ${cv.skills.join(" ")} ${jd}`);
  const isData = /data|sql|analyst|ml/i.test(`${role} ${cv.skills.join(" ")} ${jd}`);

  const questions: InterviewQuestion[] = [
    {
      question: `Kendinizi ve ${role} rolüne neden uygun olduğunuzu 2 dakikada anlatır mısınız?`,
      type: "deneyim",
      exampleAnswer: `${cv.name || "Aday"} olarak ${role} odaklıyım. Son dönemde ${company} deneyimimde [problem] için [çözüm] ürettim; sonuç [metrik]. Bu rolde de benzer şekilde ölçülebilir etki yaratmak istiyorum.`,
    },
    {
      question: `${skill} ile production’da aldığınız en zor teknik kararı anlatın.`,
      type: "teknik",
      exampleAnswer: `Durumu netleştiririm, alternatifleri trade-off ile karşılaştırırım (performans, karmaşıklık, bakım). Seçtiğim yaklaşımı ${skill} örneğiyle anlatır, ölçüm ve rollback planını eklerim.`,
    },
    {
      question: isFrontend
        ? "React/Next.js uygulamasında performansı nasıl iyileştirirsiniz?"
        : isBackend
          ? "Yavaş bir API endpoint’ini nasıl debug edip optimize edersiniz?"
          : isData
            ? "Güvenilir bir metrik tanımını nasıl kurgularsınız?"
            : "Production’da bir regresyonu nasıl izler ve çözersiniz?",
      type: "teknik",
      exampleAnswer: isFrontend
        ? "Önce ölçerim (LCP, bundle, waterfall). Sonra code-split, memoization, image/font stratejisi ve gereksiz re-render temizliği uygularım; before/after metrik paylaşırım."
        : isBackend
          ? "APM/tracing + slow query log ile kök nedeni bulurum. Index, N+1, cache veya timeout politikası ile düzeltir, load test ile doğrularım."
          : "Tanımı stakeholder ile netleştirir, edge case’leri yazıp doğrulama sorgusu ve dashboard eklerim.",
    },
    {
      question: "Takım içinde teknik anlaşmazlığı nasıl yönetirsiniz?",
      type: "davranışsal",
      exampleAnswer: "Kriterleri yazarım (maliyet, risk, hız). Kısa spike ile veri toplar, ADR ile kararı kayıt altına alırız. Ego değil kullanıcı ve operasyon etkisi önceliklidir.",
    },
    {
      question: "Deadline baskısında scope’u nasıl yönetirsiniz?",
      type: "davranışsal",
      exampleAnswer: "MVP’yi ayırır, riskli parçaları erken flag’lerim. Stakeholder’a trade-off sunar, kaliteyi düşürmek yerine kapsamı daraltırım. STAR ile somut örnek veririm.",
    },
    {
      question: `${cv.experience[0]?.position || role} rolünüzde bir başarısızlığı ve öğreniminizi anlatın.`,
      type: "deneyim",
      exampleAnswer: "Ne olduğunu, benim sorumluluğumu, neyi değiştirdiğimi ve sonraki projede hangi kontrolü eklediğimi anlatırım. Suçlama değil sistem iyileştirmesi vurgusu yaparım.",
    },
    {
      question: "Authentication ve authorization tasarımında nelere dikkat edersiniz?",
      type: "teknik",
      exampleAnswer: "Authn/authz ayrımı, short-lived token, least privilege, server-side kontroller, audit log ve secret yönetimi. Her endpoint’te yetki doğrulaması şart.",
    },
    {
      question: "Kod kalitesini ekip ölçeğinde nasıl korursunuz?",
      type: "teknik",
      exampleAnswer: "Lint/test CI, anlamlı code review checklist, feature flag, observability ve küçük PR’lar. Standartları dokümante edip örneklerle yayarım.",
    },
    {
      question: "Bu pozisyonda ilk 90 günde nasıl değer üretirsiniz?",
      type: "deneyim",
      exampleAnswer: "0-30: sistem ve metrikleri öğren, küçük fix. 30-60: orta özellik sahiplen. 60-90: DX veya güvenilirlik kaldıraçlı iyileştirme. Başarıyı delivery + reliability ile ölç.",
    },
    {
      question: jd
        ? "İlandaki en kritik gereksinim sizin için hangisi ve nasıl kanıtlarsınız?"
        : "Neden bizim ekip / bu rol?",
      type: "davranışsal",
      exampleAnswer: jd
        ? "İlandan 1-2 must-have seçer, CV’mdeki somut projeyle eşleştiririm. Eksikse öğrenme planımı ve benzer transfer edilebilir deneyimi gösteririm."
        : "Ürün, ekip ritmi ve teknik derinlik uyumunu bağlarım; ne öğreneceğimi ve ne katacağımı net söylerim.",
    },
  ];

  return {
    questions,
    tips: [
      "Cevapları 60–120 saniyede tut; STAR kullan (Durum-Görev-Aksiyon-Sonuç).",
      "Teknik sorularda trade-off ve ölçüm konuş; ezber API listesi değil.",
      "CV’ndeki her iş için 1 derin hikaye hazırla.",
      "Soru sor: başarı metriği, ekip yapısı, ilk 90 gün beklentisi.",
    ],
    roleHint: role,
  };
}
