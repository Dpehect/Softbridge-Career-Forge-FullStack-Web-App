import { useCareerStore } from "@/store/useCareerStore";
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
 * Detects the active language (TR/EN) and generates detailed, context-aware advice.
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

  const lang = useCareerStore.getState().lang;

  switch (type) {
    case "feedback": {
      const feedback = generateCvFeedback(cv, extra.jd || "");
      if (lang === "en") {
        // Map feedback to English
        return {
          ...feedback,
          summaryLine: feedback.overallScore >= 75 
            ? "Solid professional base — tighten metrics and keyword alignment to compete for top roles."
            : feedback.overallScore >= 55 
            ? "Promising foundation — focused rewrites on summary and bullets will make this interview-ready."
            : "Early-stage CV structure — prioritize contact completeness, 3 strong bullets, and a clear title first.",
          strengths: feedback.strengths.map(s => translateSentence(s, "en")),
          weaknesses: feedback.weaknesses.map(w => translateSentence(w, "en")),
          improvements: feedback.improvements.map(i => translateSentence(i, "en")),
          careerAdvice: feedback.careerAdvice.map(c => translateSentence(c, "en")),
        };
      }
      return feedback;
    }
    case "match": {
      if (!extra.jd) throw new Error(lang === "tr" ? "İş ilanı (JD) metni gereklidir." : "Job Description text is required.");
      const match = analyzeMatch(cv, extra.jd);
      if (lang === "en") {
        return {
          ...match,
          strengths: match.strengths.map(s => translateSentence(s, "en")),
          gaps: match.gaps.map(g => translateSentence(g, "en")),
          suggestions: match.suggestions.map(s => translateSentence(s, "en")),
        };
      }
      return match;
    }
    case "optimize": {
      const match = extra.jd ? analyzeMatch(cv, extra.jd) : null;
      const result = optimizeCV(cv, match, extra.jd || "");
      if (lang === "en") {
        return {
          ...result,
          optimizedSummary: result.optimizedSummary.replace(/Geliştirilmiş|Odaklanmış/g, "Focused on"),
          generalSuggestions: result.generalSuggestions.map(s => translateSentence(s, "en")),
        };
      }
      return result;
    }
    case "coverletter": {
      if (!extra.jd) throw new Error(lang === "tr" ? "Ön yazı için iş ilanı metni gereklidir." : "Job Description text is required.");
      const match = analyzeMatch(cv, extra.jd);
      const result = generateCoverLetter(cv, extra.jd, extra.tone || "Profesyonel", match);
      if (lang === "en") {
        return translateCoverLetterToEn(result, cv.name);
      }
      return result;
    }
    case "interview": {
      const result = generateInterview(cv, extra.jd || "");
      if (lang === "en") {
        return translateInterviewToEn(result);
      }
      return result;
    }
    case "chat": {
      return simulateChatCoach(extra.message || "", cv, extra.jd || "", lang);
    }
    default:
      throw new Error(`Unsupported AI operation: ${type}`);
  }
}

/**
 * Fallback translation helper for simulated AI recommendations
 */
function translateSentence(text: string, to: "tr" | "en"): string {
  const dictionary: Record<string, string> = {
    "İlanla örtüşen beceriler:": "Skills matching the job ad:",
    "Birden fazla deneyim bloğu mevcut — hikaye anlatımı için iyi zemin.": "Multiple experience blocks present — great foundation for storytelling.",
    "Özet/profil metni var; konumlandırma için kullanılabilir.": "Summary/profile text is present; useful for initial positioning.",
    "Başlık net görünüyor:": "Headline looks clear:",
    "CV içeriği yüklendi; hedefe göre şekillendirilebilir bir temel var.": "CV content loaded; flexible foundation ready for targeting.",
    "Eksik veya zayıf görünen beceriler:": "Missing or weak skill indicators:",
    "Güçlü bir profesyonel özet eksik.": "Strong professional summary is missing.",
    "Deneyim maddeleri ölçülebilir başarıdan yoksun görünüyor.": "Experience bullet points lack measurable outcomes.",
    "İletişim e-postası tespit edilemedi (ATS için kritik).": "Contact email not detected (critical for ATS checks).",
    "Genel uyum orta-altı; ilan diline daha fazla hizalama gerekli.": "Overall alignment is low-medium; more target keyword alignment needed.",
    "İlandaki en kritik 5 anahtar kelimeyi özet ve ilk 2 deneyim maddesine doğal şekilde ekle.": "Integrate the 5 most critical keywords from the JD into your summary and top experience bullets.",
    "Her deneyim maddesini Etki + Metrik + Yöntem formatına çevir (ör. %X iyileşme, N kullanıcı).": "Format each experience bullet as Action + Metric + Method (e.g., %X improvement, N users).",
    "ATS için başlıkları sade tut: Deneyim, Beceriler, Eğitim — tablo/ikon kullanma.": "Keep section titles simple for ATS filters: Experience, Skills, Education — avoid tables/icons.",
    "Her maddede en az bir sonuç veya metrik olsun (%, süre, kullanıcı, gelir, hata oranı).": "Ensure every bullet includes at least one result metric (%, time saved, users, revenue).",
    "İlanla birebir aynı jargon uydurma; gerçek işini ilanın diliyle yeniden ifade et.": "Don't fabricate jargon; describe your actual outcomes using the job description's terminology.",
    "Beceriler bölümünü 2 satırda tut: önce must-have, sonra nice-to-have.": "Limit the skills section: list must-have skills first, then nice-to-have tools.",
    "PDF’te sütun/tablo kullanma; tek sütun ATS parse oranını yükseltir.": "Avoid multi-column formats in PDFs; single column layout boosts ATS parsability.",
    "JD’deki fiilleri (design, own, scale, partner) deneyim maddelerine yansıt.": "Mirror verbs from the JD (design, own, scale, partner) in your experience descriptions."
  };

  for (const [key, value] of Object.entries(dictionary)) {
    if (text.includes(key)) {
      return text.replace(key, value);
    }
  }
  return text;
}

function translateCoverLetterToEn(result: CoverLetterResult, name: string): CoverLetterResult {
  let body = result.coverLetter;
  // Replace Turkish templates with clean English paragraphs
  if (result.tone === "Profesyonel") {
    body = `Dear Hiring Team,\n\nI have reviewed the job listing for the position. I believe my profile fits the requirements and challenges of the role, and I would love to summarize my potential contributions here.\n\nSincerely,\n${name}`;
  } else if (result.tone === "Girişimci") {
    body = `Hello,\n\nI wanted to reach out directly regarding the open position. I am a fast learner, self-motivated, and metric-driven professional who thrives in high-growth environments.\n\nBest regards,\n${name}`;
  } else {
    body = `Hello,\n\nThis is my cover letter for the engineering role. My technical stack aligns closely with your team's stack, and my hands-on delivery track record is summarized below.\n\nWarm regards,\n${name}`;
  }

  return {
    ...result,
    coverLetter: body,
    keyPoints: [
      "Direct response to job listing",
      "Highlighted core skills",
      "Evidence from past roles",
      "Clear call to action"
    ]
  };
}

function translateInterviewToEn(result: InterviewResult): InterviewResult {
  const mappedQuestions = result.questions.map(q => {
    let questionText = q.question;
    let answerText = q.exampleAnswer;
    if (q.question.includes("Kendinizi")) {
      questionText = "Could you walk me through your background and why you are a fit for this role?";
      answerText = "I focus on engineering high-fit applications. In my latest role, I solved [problem] using [solution] resulting in [metric]. I look forward to contributing similar value.";
    } else if (q.question.includes("zor teknik karar")) {
      questionText = "Describe a difficult technical decision you made recently.";
      answerText = "I align requirements, compare options with trade-offs (performance, cost, readability), and document ADRs before rollout.";
    } else if (q.question.includes("anlaşmazlığı")) {
      questionText = "How do you resolve technical disagreements in a team?";
      answerText = "I write comparison criteria, gather spike data, and align on a decision. Team ego is set aside for product metrics.";
    } else if (q.question.includes("baskısında")) {
      questionText = "How do you manage deadlines and scope creep?";
      answerText = "I define the MVP scope, raise flags early to stakeholders, and discuss scope adjustments rather than cutting quality.";
    }

    return {
      ...q,
      question: questionText,
      exampleAnswer: answerText
    };
  });

  return {
    ...result,
    questions: mappedQuestions,
    tips: [
      "Keep answers under 2 minutes; use the STAR method (Situation, Task, Action, Result).",
      "Focus on technical trade-offs, metrics, and facts rather than generic advice.",
      "Prepare one deep story for every major project listed in your CV."
    ]
  };
}

function simulateChatCoach(
  message: string,
  cv: ParsedCV,
  jd = "",
  lang: "tr" | "en"
): ChatCoachResponse {
  const msg = message.toLowerCase();
  const name = cv.name.split(" ")[0] || "Candidate";
  const title = cv.title || "Software Professional";
  
  if (lang === "en") {
    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("merhaba")) {
      return {
        category: "Career Strategy",
        response: `Hello ${name}! I'm your CareerForge AI Career Coach. I've reviewed your CV and would love to help you build towards your ${title} goals. What should we optimize today?`,
        actionableTips: [
          "1. Help me rewrite my latest experience bullets",
          "2. Prepare mock interview questions for my stack",
          "3. Optimize my summary for a job description (JD)"
        ],
        nextStep: "Choose an action or type your question details."
      };
    }

    if (msg.includes("experience") || msg.includes("bullet") || msg.includes("job") || msg.includes("deneyim")) {
      const latestJob = cv.experience[0];
      return {
        category: "Bullet Point Refactoring",
        response: `Let's work on your experience descriptions, ${name}. Bullet points should describe business outcomes and metrics, not just duties. Use the format: strong action verb + what you built + technologies used + measurable impact.`,
        actionableTips: [
          `Weak: "Worked as a ${latestJob?.position || title} doing frontend tasks."`,
          `Strong: "Architected modern frontend interfaces using React & TypeScript, resulting in a 40% page load improvement and 15% increase in user retention."`,
          "Ensure every bullet point includes at least one quantitative metric (%, ms, saved hours)."
        ],
        nextStep: "Paste one of your current bullet points below and let's rewrite it."
      };
    }

    if (msg.includes("interview") || msg.includes("question") || msg.includes("mülakat")) {
      const topSkill = cv.skills[0] || "core skills";
      return {
        category: "Interview Prep",
        response: `I've prepared 3 common interview questions tailored to your ${title} background. Focus on sharing STAR stories, especially concerning your work with ${topSkill}.`,
        actionableTips: [
          "1. 'Walk me through your CV.' (Highlight transition points and metric achievements)",
          `2. 'What is the most challenging technical project you built with ${topSkill}?' (Describe trade-offs)`,
          "3. 'How do you handle scope creep and deadlines?' (Explain MVP prioritizations)"
        ],
        nextStep: "Type your draft answer to one of these questions, and I'll review it for you!"
      };
    }

    // Fallback English
    return {
      category: "Career Strategy",
      response: `I hear you, ${name}. As a ${title}, leveraging your ${cv.skills.length} skills and ${cv.experience.length} experiences is key to landing interviews. Let's dig deeper into your question.`,
      actionableTips: [
        "Optimize my professional summary",
        "Explain how to bypass ATS keyword checks",
        "Give me salary negotiation tips"
      ],
      nextStep: "Let me know what you want to work on next."
    };
  }

  // Fallback Turkish (Predefined)
  const latestJob = cv.experience[0];
  const jobTitle = latestJob ? latestJob.position : title;
  const company = latestJob ? latestJob.company : "son şirketiniz";
  
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
