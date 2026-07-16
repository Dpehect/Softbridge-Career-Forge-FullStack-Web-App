import type { ParsedCV, MatchAnalysis, OptimizedCV, CoverLetterResult, CoverLetterTone, InterviewResult } from "./types";
import { generateCvFeedback } from "./cvFeedback";
import { analyzeMatch } from "./analyze";
import { optimizeCV } from "./optimize";
import { generateCoverLetter } from "./coverLetter";
import { generateInterview } from "./interview";

export interface ChatCoachResponse {
  category: string;
  response: string;
  actionableTips: string[];
  nextStep: string;
}

/**
 * Unified Generative AI Simulator for CareerForge.
 * Mimics actual cloud LLM behaviors locally using CV data, Job Descriptions, and user messages.
 */
export async function simulateAIResponse(
  type: "feedback" | "match" | "optimize" | "coverletter" | "interview" | "chat",
  cv: ParsedCV | null,
  extra: { jd?: string; tone?: CoverLetterTone; message?: string } = {}
): Promise<any> {
  // Simulate network/inference latency of a cloud LLM (800ms - 1300ms)
  await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));

  if (!cv) {
    throw new Error("No CV loaded yet. Please upload or build a profile first.");
  }

  switch (type) {
    case "feedback": {
      return generateCvFeedback(cv, extra.jd || "");
    }
    case "match": {
      if (!extra.jd) throw new Error("Job Description text is required for matching.");
      return analyzeMatch(cv, extra.jd);
    }
    case "optimize": {
      const match = extra.jd ? analyzeMatch(cv, extra.jd) : null;
      return optimizeCV(cv, match, extra.jd || "");
    }
    case "coverletter": {
      if (!extra.jd) throw new Error("Job Description text is required to write a cover letter.");
      const match = analyzeMatch(cv, extra.jd);
      return generateCoverLetter(cv, extra.jd, extra.tone || "Profesyonel", match);
    }
    case "interview": {
      return generateInterview(cv, extra.jd || "");
    }
    case "chat": {
      return simulateChatCoach(extra.message || "", cv, extra.jd || "");
    }
    default:
      throw new Error(`Unsupported AI operation: ${type}`);
  }
}

function simulateChatCoach(message: string, cv: ParsedCV, jd = ""): ChatCoachResponse {
  const msg = message.toLowerCase();
  const name = cv.name.split(" ")[0] || "Aday";
  const title = cv.title || "Yazılım Uzmanı";
  
  if (msg.includes("merhaba") || msg.includes("selam") || msg.includes("hello") || msg.includes("hi")) {
    return {
      category: "Kariyer Stratejisi",
      response: `Merhaba ${name}! Ben senin CareerForge yapay zeka kariyer koçunum. CV'ni inceledim ve ${title} hedefin doğrultusunda sana rehberlik etmek için sabırsızlanıyorum. Bugün ne üzerine çalışalım?`,
      actionableTips: [
        "1. Son iş deneyimimi güçlendirmeme yardım et",
        "2. Bu özgeçmiş ile mülakat soruları hazırlayalım",
        "3. CV'mi bir iş ilanına (JD) göre optimize et"
      ],
      nextStep: "Ne yapmak istediğini yaz veya yukarıdaki önerilerden birini seç."
    };
  }

  if (msg.includes("deneyim") || msg.includes("maddi") || msg.includes("bullet") || msg.includes("tecrübe")) {
    const latestJob = cv.experience[0];
    const jobTitle = latestJob ? latestJob.position : title;
    const company = latestJob ? latestJob.company : "son şirketiniz";
    return {
      category: "Deneyim Güçlendirme",
      response: `Deneyim maddelerini güçlendirelim ${name}. Özgeçmişinde "${jobTitle} - ${company}" olarak listelediğin görevleri basit bir liste gibi değil, etki-odaklı yazmalısın. Her madde: güçlü bir fiil + ne yaptın + hangi teknolojiyi kullandın + ulaştığın sayısal metrik formatında olmalıdır.`,
      actionableTips: [
        `Kötü: "${jobTitle} olarak kod yazdım."`,
        `İyi: "TypeScript ve Next.js kullanarak web arayüz performansını iyileştirdim; sayfa yüklenme sürelerini %35 kısaltarak dönüşüm oranını %8 artırdım."`,
        "Her iş deneyimi maddesine en az bir adet sayısal metrik (%, MS, TL, Adet) ekle."
      ],
      nextStep: "Son rolündeki maddelerden birini buraya yaz, birlikte güçlendirelim!"
    };
  }

  if (msg.includes("mülakat") || msg.includes("interview") || msg.includes("soru") || msg.includes("görüşme")) {
    const topSkill = cv.skills[0] || "teknik becerilerin";
    return {
      category: "Mülakat Hazırlığı",
      response: `${title} pozisyonu için mülakatlarda en sık sorulan 3 soru tipini senin için hazırladım. Özellikle ${topSkill} konusundaki kararlarını ve STAR metodunu (Durum-Görev-Aksiyon-Sonuç) kullanarak hikayelendirme pratiği yapmalıyız.`,
      actionableTips: [
        `1. "Kendinizi tanıtın ve neden bu rol?" (Deneyimlerini doğrudan ilan hedefleriyle bağdaştır)`,
        `2. "${topSkill} ile üretim (production) ortamında aldığınız en zor teknik karar neydi?" (Trade-off'ları belirt)`,
        `3. "Takım içinde yaşadığınız bir fikir ayrılığını nasıl yönettiniz?" (Ego yerine veri/metrik odaklılığı vurgula)`
      ],
      nextStep: "Bu sorulardan birine vereceğin cevabı yaz, hemen koçluk yorumu yapayım."
    };
  }

  if (msg.includes("ats") || msg.includes("uyum") || msg.includes("keywords") || msg.includes("anahtar")) {
    const skillsList = cv.skills.slice(0, 4).join(", ");
    return {
      category: "ATS İyileştirme",
      response: `ATS (Aday Takip Sistemleri) filtrelerini aşmak için özgeçmiş taslağının sade ve taranabilir olması gerekir. İlanda geçen anahtar kelimelerin (örneğin: ${skillsList || "hedef teknolojiler"}) CV metninde doğal bir şekilde yer aldığından emin olmalısın.`,
      actionableTips: [
        "İkonlar, tablolar veya görsel grafikler kullanmaktan kaçın (ATS okuyucusunu bozar)",
        "Tarihleri ve bölüm başlıklarını standart ve tutarlı yaz (deneyim, eğitim, beceriler)",
        "Beceriler bölümünü virgülle ayrılmış sade metin yap"
      ],
      nextStep: "CV'nin en son ATS skorunu görmek için ATS sekmesine tıklayabilirsin."
    };
  }

  // Fallback
  return {
    category: "Kariyer Stratejisi",
    response: `Anlıyorum ${name}. ${title} hedefin doğrultusunda, özgeçmişinde listelediğin ${cv.skills.length} beceri ve ${cv.experience.length} iş deneyimini en iyi şekilde pazarlamak için buradayım. Sorunu detaylandırabilir misin?`,
    actionableTips: [
      "Özgeçmişimin özet kısmını yeniden yazmamıza yardım et",
      "Kariyer tavsiyeleri ver",
      "İş görüşmesi için teknik soru hazırlığı yap"
    ],
    nextStep: "Sorunuzu detaylandırın veya hazır yönlendirmelerden birini yazın."
  };
}
