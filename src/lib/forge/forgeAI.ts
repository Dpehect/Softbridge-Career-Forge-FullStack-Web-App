import { useState } from "react";
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
  const lastJob = cv.experience[0];
  const lastTitle = lastJob ? lastJob.position : title;
  const lastCompany = lastJob ? lastJob.company : (lang === "tr" ? "hedef şirketiniz" : "target company");
  const skillsList = cv.skills.length > 0 ? cv.skills.slice(0, 4).join(", ") : "React, TypeScript, Next.js, Node.js";

  if (lang === "tr") {
    if (msg.includes("merhaba") || msg.includes("selam") || msg.includes("hello") || msg.includes("hi")) {
      return {
        category: "Kariyer Stratejisi",
        response: `Merhaba **${name}**! Ben senin CareerForge kariyer koçunum. CV'ndeki **${lastTitle} @ ${lastCompany}** deneyimlerini inceledim. Bugün hedeflerin doğrultusunda ne üzerine çalışalım?`,
        actionableTips: [
          "CV özeti (summary) ve başarı maddelerini optimize et",
          "Kritik mülakat sorularına hazırlık yap (STAR metodu)",
          "Maaş pazarlığı ve teklif değerlendirme stratejileri"
        ],
        nextStep: "Yukarıdaki konulardan birini yazabilir veya sorunuzu detaylandırabilirsiniz."
      };
    }

    if (msg.includes("deneyim") || msg.includes("bullet") || msg.includes("yazım|madd") || msg.includes("refactor")) {
      const oldBullet = lastJob && lastJob.description && lastJob.description[0] 
        ? lastJob.description[0] 
        : "Proje kodladım ve hataları çözdüm.";
      return {
        category: "CV Madde İyileştirme",
        response: [
          `Özgeçmişindeki **${lastTitle}** pozisyonuna ait başarı maddelerini inceledim.`,
          `Mevcut maddelerin görev listesi gibi kalıyor. Bunları etki-odaklı hale getirmeliyiz.`,
          `\n**Örnek STAR Revizyonu:**`,
          `- ❌ **Eski Hali:** *"${oldBullet}"*`,
          `-  **Yeni Hali:** *"**${lastCompany}** bünyesinde, **${skillsList}** mimarisiyle performans optimizasyonu yaptım; sayfa yüklenme sürelerini **%35 düşürerek** kullanıcı dönüşüm oranını **%14 artırdım**."*`
        ].join("\n"),
        actionableTips: [
          "Deneyim maddelerine ölçülebilir yüzdeler veya süreler ekle",
          "Her maddeye güçlü bir yönetim/tasarım fiiliyle başla",
          "Teknik stack isimlerini cümle içinde doğal kullan"
        ],
        nextStep: "Analiz etmemi istediğin bir başarı maddeni yapıştırabilirsin."
      };
    }

    if (msg.includes("mülakat") || msg.includes("interview") || msg.includes("soru") || msg.includes("görüşme")) {
      const skill = cv.skills[0] || "TypeScript";
      return {
        category: "Mülakat Hazırlığı",
        response: [
          `**${name}**, bir **${title}** adayı olarak mülakatlarda karşına çıkabilecek en önemli sorulardan birini ve STAR formatında cevap planını çıkardım.`,
          `\n**Örnek Soru:** *"**${lastCompany}** bünyesinde **${skill}** kullanarak aldığınız en zor teknik karar neydi?"*`,
          `- **Situation (Durum):** Yüksek yük altında çalışan modülümüz bellek sızıntıları yaşıyordu.`,
          `- **Task (Görev):** Kod bloklarını optimize edip verimli bir state mimarisi kurmam gerekiyordu.`,
          `- **Action (Aksiyon):** **${skill}** kütüphaneleriyle bellek profili çıkarıp gereksiz render'ları engelledim.`,
          `- **Result (Sonuç):** CPU tüketimini **%25 düşürdüm** ve kod okunabilirliğini artırdım.`
        ].join("\n"),
        actionableTips: [
          "Teknik mülakatlarda aldığın kararların trade-off'larını açıkla",
          "STAR (Situation-Task-Action-Result) formatını kullan",
          "Başarısızlık hikayelerini suçlama yapmadan, öğrenim odaklı anlat"
        ],
        nextStep: "Bu mülakat sorusuna kendi cevabını yaz, hemen değerlendirelim."
      };
    }

    if (msg.includes("ats") || msg.includes("uyum") || msg.includes("keywords") || msg.includes("anahtar")) {
      return {
        category: "ATS Geçiş Filtresi",
        response: [
          `Mevcut profilini hedef **${title}** ilanlarıyla eşleştirdiğimde kritik anahtar kelimelerin eksik olduğunu görüyorum.`,
          `\n**Eksik Olan Kritik Kelimeler:** Docker, AWS Cloud, CI/CD pipelines, Unit testing (Jest).`,
          `ATS tarayıcılarından geçmek için başlıkları sade (Deneyim, Beceriler, Eğitim) tutmalı, tablolar ve iki sütunlu tasarımlardan kaçınmalısın.`
        ].join("\n"),
        actionableTips: [
          "Beceriler bölümünü virgülle ayrılmış sade metin olarak listele",
          "İlandaki eylem kelimelerini deneyim maddelerine entegre et",
          "Özgeçmişini PDF olarak dışa aktarırken yazıları seçilebilir formatta tut"
        ],
        nextStep: "CV'nin en son ATS skorunu görmek için ATS sekmesine tıklayabilirsin."
      };
    }

    // Fallback TR
    return {
      category: "Kariyer Stratejisi",
      response: `Anlıyorum **${name}**. Bir **${title}** olarak, özgeçmişinde listelediğin **${cv.skills.length} beceri** ve **${cv.experience.length} iş deneyimini** en iyi şekilde pazarlamak için buradayım. Sorunu detaylandırabilir misin?`,
      actionableTips: [
        "Özgeçmişimin özet kısmını yeniden yazmama yardım et",
        "Kariyer hedeflerime göre iş eşleşmesi önerisi yap",
        "Maaş pazarlığı stratejileri ver"
      ],
      nextStep: "Sorunuzu detaylandırın veya hazır yönlendirmelerden birini yazın."
    };
  }

  // ----------------------------------------------------
  // ENGLISH RESPONSES
  // ----------------------------------------------------
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("merhaba")) {
    return {
      category: "Career Strategy",
      response: `Hello **${name}**! I'm your CareerForge AI Career Coach. I've reviewed your experience as **${lastTitle} @ ${lastCompany}**. What career goals should we work on today?`,
      actionableTips: [
        "Optimize summary and resume bullet points",
        "Prepare mock interview questions (STAR method)",
        "Salary negotiation scripts and strategies"
      ],
      nextStep: "Choose an action or type your question below."
    };
  }

  if (msg.includes("experience") || msg.includes("bullet") || msg.includes("refactor") || msg.includes("rewrite")) {
    const oldBullet = lastJob && lastJob.description && lastJob.description[0] 
      ? lastJob.description[0] 
      : "Developed features and fixed application bugs.";
    return {
      category: "Bullet Point Optimization",
      response: [
        `Let's analyze the experience bullets for your **${lastTitle}** role.`,
        `Your points currently describe daily duties. We want to convert them into business outcomes.`,
        `\n**STAR Refactoring Example:**`,
        `- ❌ **Before:** *"${oldBullet}"*`,
        `-  **After:** *"Optimized core application modules at **${lastCompany}** using **${skillsList}**, reducing page load latency by **35%** and increasing user conversion rates by **14%**."*`
      ].join("\n"),
      actionableTips: [
        "Add quantitative metrics (%, ms, team size, budget) to bullets",
        "Open every bullet with a strong action verb",
        "Directly align tool stacks with your target job description"
      ],
      nextStep: "Paste one of your current bullet points below and let's rewrite it."
    };
  }

  if (msg.includes("interview") || msg.includes("question") || msg.includes("mock") || msg.includes("STAR")) {
    const skill = cv.skills[0] || "TypeScript";
    return {
      category: "Interview Prep",
      response: [
        `**${name}**, here is a key interview question tailored for a **${title}** role, along with a STAR response plan:`,
        `\n**Question:** *"Describe a complex technical challenge you solved using ${skill} at ${lastCompany}."*`,
        `- **Situation:** Our primary data tables were experiencing rendering lags under heavy data loads.`,
        `- **Task:** Identify memory leak origins and reconstruct client-side state handling.`,
        `- **Action:** Profiling with **${skill}** memory tools, optimizing lifecycle cycles, and refactoring selectors.`,
        `- **Result:** Lowered memory usage by **25%** and stabilized LCP metrics.`
      ].join("\n"),
      actionableTips: [
        "Explain tech decisions using clear engineering trade-offs",
        "Leverage the STAR (Situation-Task-Action-Result) format",
        "Present failure examples focused on systemic learning outcomes"
      ],
      nextStep: "Type your draft answer to this question, and I'll review it for you!"
    };
  }

  // Fallback English
  return {
    category: "Career Strategy",
    response: `I hear you, **${name}**. As a **${title}**, leveraging your **${cv.skills.length} skills** and **${cv.experience.length} experiences** is key to landing interviews. Let's dig deeper into your question.`,
    actionableTips: [
      "Optimize my professional summary statement",
      "Check my ATS keyword alignment score",
      "Salary negotiation templates"
    ],
    nextStep: "Let me know what you want to work on next."
  };
}

export function useForgeAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFeedback = async (cv: ParsedCV) => {
    setLoading(true);
    setError(null);
    try {
      return await simulateAIResponse("feedback", cv);
    } catch (err: any) {
      setError(err?.message || "Geri bildirim üretilemedi.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getJobMatch = async (cv: ParsedCV, jdText: string) => {
    setLoading(true);
    setError(null);
    try {
      return await simulateAIResponse("match", cv, { jd: jdText }) as MatchAnalysis;
    } catch (err: any) {
      setError(err?.message || "Eşleştirme analizi yapılamadı.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOptimization = async (cv: ParsedCV, jdText: string) => {
    setLoading(true);
    setError(null);
    try {
      return await simulateAIResponse("optimize", cv, { jd: jdText }) as OptimizedCV;
    } catch (err: any) {
      setError(err?.message || "CV optimizasyonu başarısız.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCoverLetter = async (cv: ParsedCV, jdText: string, tone?: CoverLetterTone) => {
    setLoading(true);
    setError(null);
    try {
      return await simulateAIResponse("coverletter", cv, { jd: jdText, tone }) as CoverLetterTone extends undefined ? any : CoverLetterResult;
    } catch (err: any) {
      setError(err?.message || "Ön yazı oluşturulamadı.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInterviewPrep = async (cv: ParsedCV, jdText: string) => {
    setLoading(true);
    setError(null);
    try {
      return await simulateAIResponse("interview", cv, { jd: jdText }) as InterviewResult;
    } catch (err: any) {
      setError(err?.message || "Mülakat soruları üretilemedi.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getFeedback,
    getJobMatch,
    getOptimization,
    getCoverLetter,
    getInterviewPrep,
  };
}
