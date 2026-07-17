import { z } from "zod";
import type { Locale } from "@/i18n/messages";
import { calculateAtsScore, getAtsStatusLabel, getAtsSummary } from "@/features/analysis/atsScore";
import { buildActionableRecommendations } from "@/features/analysis/recommendations";
import { resumeToParsed, useCareerStore } from "@/store/useCareerStore";

export const CoachResponseSchema = z.object({
  summary: z.string().min(1),
  strengths: z.array(z.string()).max(4),
  weaknesses: z.array(z.string()).max(4),
  recommendations: z.array(z.string()).min(1).max(5),
  nextSteps: z.array(z.string()).min(1).max(4),
  uncertainty: z.string().nullable(),
});

export type CoachResponse = z.infer<typeof CoachResponseSchema>;

export function getAiLanguageInstruction(locale: Locale) {
  return locale === "tr"
    ? "The active application language is Turkish. Return every user-facing field exclusively in natural professional Turkish. Do not mix English and Turkish. Preserve internationally established technical abbreviations such as ATS, PDF, API and CV where appropriate."
    : "The active application language is English. Return every user-facing field exclusively in English.";
}
function getContext() {
  const state = useCareerStore.getState();
  const cv = state.forgeParsedCv ?? resumeToParsed(state.resume);
  const hasResume = Boolean(
    state.forgeParsedCv || state.resume.fullName || state.resume.skills.length || state.resume.experience.length
  );
  const locale = state.lang;
  const name = cv.name && !["Candidate", "Aday"].includes(cv.name)
    ? cv.name.split(" ")[0]
    : locale === "tr" ? "Aday" : "Candidate";
  const title = cv.title || (locale === "tr" ? "hedef rol" : "target role");
  const lastRole = cv.experience[0]?.position || title;
  const lastCompany = cv.experience[0]?.company || (locale === "tr" ? "son şirket" : "latest company");
  const topSkills = cv.skills.slice(0, 4);
  return { state, cv, hasResume, locale, name, title, lastRole, lastCompany, topSkills };
}

function categoryFor(text: string) {
  const value = text.toLocaleLowerCase("tr-TR");
  if (/ats|anahtar|keyword|tarama|parser|uyum/.test(value)) return "ats";
  if (/mülakat|interview|star|davranış|behavior|soru/.test(value)) return "interview";
  if (/maaş|salary|teklif|offer|pazarlık|negotiation/.test(value)) return "salary";
  if (/plan|roadmap|kariyer|career|90 gün|90 day/.test(value)) return "roadmap";
  if (/cv|özgeçmiş|resume|özet|summary|deneyim|experience|beceri|skill/.test(value)) return "resume";
  return "general";
}

function withoutResume(locale: Locale): CoachResponse {
  return locale === "tr" ? {
    summary: "Kişisel öneri üretmek için henüz doğrulanabilir bir CV bağlamı yok.",
    strengths: [],
    weaknesses: ["Deneyim, beceri ve hedef rol bilgileri bulunmuyor."],
    recommendations: ["CV'nizi yükleyin veya demo profili açarak koçun nasıl çalıştığını inceleyin."],
    nextSteps: ["CV Yükle", "Demo Profille İncele"],
    uncertainty: "CV olmadan verilen öneriler genel kalır.",
  } : {
    summary: "There is no verifiable resume context for personalized guidance yet.",
    strengths: [],
    weaknesses: ["Experience, skills, and target-role information are missing."],
    recommendations: ["Upload your resume or open the demo profile to see how the coach works."],
    nextSteps: ["Upload Resume", "Explore Demo Profile"],
    uncertainty: "Without a resume, guidance remains general.",
  };
}

function buildResponse(text: string): CoachResponse {
  const context = getContext();
  const { cv, hasResume, locale, name, title, lastRole, lastCompany, topSkills } = context;
  if (!hasResume) return withoutResume(locale);

  const category = categoryFor(text);
  const ats = calculateAtsScore(cv);
  const recommendations = buildActionableRecommendations(cv, locale);
  const hasMetrics = cv.experience.some((item) => item.description.some((bullet) => /\d+%|\b\d{2,}\+?\b/.test(bullet)));
  const roleEvidence = `${lastRole} · ${lastCompany}`;

  if (locale === "tr") {
    if (category === "ats") {
      return {
        summary: `${name}, genel ATS puanınız ${ats.total}/100 ve durumunuz “${getAtsStatusLabel(ats.status, locale)}”. ${getAtsSummary(ats.total, locale)}`,
        strengths: [
          cv.email ? "İletişim e-postası taranabilir biçimde mevcut." : "",
          cv.skills.length >= 6 ? `${cv.skills.length} gerçek beceri anahtar kelime yüzeyi sağlıyor.` : "",
          hasMetrics ? "En az bir deneyim maddesi ölçülebilir sonuç içeriyor." : "",
        ].filter(Boolean),
        weaknesses: recommendations.map((item) => item.problem),
        recommendations: recommendations.map((item) => `${item.correction} Beklenen etki: ${item.impact}.`),
        nextSteps: [
          "En düşük alt puanı ATS dökümünde açın.",
          "İlk öneriyi CV Düzenleyici'de doğrulayarak uygulayın.",
          "Hedef iş ilanıyla rol uyumunu ayrı olarak yeniden ölçün.",
        ],
        uncertainty: "Hedef iş ilanı seçilmediyse bu puan genel ATS yapısını ölçer; rol uyumunu ölçmez.",
      };
    }

    if (category === "interview") {
      return {
        summary: `${roleEvidence} deneyiminizden hareketle en güçlü prova konusu, teknik kararınızı ve doğrulanmış sonucu aynı hikâyede anlatmaktır.`,
        strengths: [
          topSkills.length ? `${topSkills.join(", ")} becerileri teknik derinlik için kullanılabilir.` : "",
          hasMetrics ? "CV'nizde doğrulanabilir bir sayısal sonuç bulunuyor." : "",
        ].filter(Boolean),
        weaknesses: [
          !hasMetrics ? "CV'nizde mülakatta kullanılabilecek doğrulanmış bir ölçüm görünmüyor." : "",
          "Karar bağlamı, alternatifler ve öğrenim açıkça hazırlanmalı.",
        ].filter(Boolean),
        recommendations: [
          `Soru: “${lastRole} rolünde verdiğiniz en zor teknik karar neydi ve sonucu nasıl ölçtünüz?”`,
          "Yanıtı Durum, Görev, Eylem ve Sonuç sırasıyla; yalnızca gerçek bilgilerle kurun.",
          "Bilmiyorsanız rakam uydurmayın; kullandığınız ölçüm yöntemini ve gözlemlenen yönü açıklayın.",
        ],
        nextSteps: ["90 saniyelik ilk yanıtı yazın.", "Yanıttaki doğrulanamayan iddiaları işaretleyin.", "Daha kısa bir ikinci versiyon hazırlayın."],
        uncertainty: "Proje ayrıntıları CV'de yer almıyorsa koç yalnızca soru iskeleti önerebilir.",
      };
    }

    if (category === "salary") {
      return {
        summary: `${title} teklifinde pazarlık zemininiz, ${roleEvidence} deneyimindeki doğrulanabilir kapsam ve sonuçlardır.`,
        strengths: [hasMetrics ? "CV'nizde pazarlıkta kullanılabilecek ölçülebilir sonuç bulunuyor." : "Rol ve şirket bağlamınız mevcut."],
        weaknesses: ["Piyasa aralığı ve teklif bileşenleri verilmediği için kesin bir rakam önerilemez."],
        recommendations: [
          "Önce taban ücret, prim, yan haklar ve çalışma modelini ayrı ayrı netleştirin.",
          "Talebinizi tek bir CV kanıtına bağlayın; genel özgüven ifadeleri yerine kapsamı anlatın.",
          "Örnek ifade: 'Rolün kapsamı ve son görevimdeki doğrulanabilir ürün etkisi dikkate alındığında taban ücret aralığını yeniden değerlendirebilir miyiz?'",
        ],
        nextSteps: ["Teklif bileşenlerini yazın.", "Alt sınırınızı belirleyin.", "Kanıt cümlenizi prova edin."],
        uncertainty: "Konum, şirket seviyesi ve teklif ayrıntıları olmadan piyasa karşılaştırması yapılmadı.",
      };
    }

    if (category === "roadmap") {
      return {
        summary: `${title} hedefi için planınız, kanıt üretme ve başvuruda kullanma döngüsüne dayanmalı.`,
        strengths: [topSkills.length ? `Mevcut temel: ${topSkills.join(", ")}.` : "Hedef rol bilgisi mevcut."],
        weaknesses: recommendations.map((item) => item.problem).slice(0, 2),
        recommendations: [
          "İlk 30 gün: en kritik beceri açığı için küçük ama yayımlanabilir bir kanıt üretin.",
          "31–60 gün: kanıtı CV maddesine ve portföy anlatısına dönüştürün.",
          "61–90 gün: hedefli başvurular ve iki prova mülakatıyla anlatıyı test edin.",
        ],
        nextSteps: ["Kariyer Planı'nda tek bir rota seçin.", "Bu haftanın teslim edilebilir çıktısını belirleyin."],
        uncertainty: "Haftalık zaman kapasiteniz bilinmediği için süreler öneri niteliğindedir.",
      };
    }

    return {
      summary: `${name}, ${title} hedefiniz için en yüksek kaldıraç CV kanıtlarını daha açık ve doğrulanabilir hale getirmektir.`,
      strengths: [roleEvidence, topSkills.length ? topSkills.join(", ") : ""].filter(Boolean),
      weaknesses: recommendations.map((item) => item.problem),
      recommendations: recommendations.map((item) => item.correction),
      nextSteps: ["İlk öneriyi açın.", "Örneği gerçek bilgilerinizle doğrulayın.", "Değişiklikten sonra ATS puanını yeniden hesaplayın."],
      uncertainty: "Koç, CV'de bulunmayan başarı veya ölçümleri gerçek olarak kabul etmez.",
    };
  }

  if (category === "ats") {
    return {
      summary: `${name}, your general ATS score is ${ats.total}/100 with a status of “${getAtsStatusLabel(ats.status, locale)}”. ${getAtsSummary(ats.total, locale)}`,
      strengths: [cv.email ? "A readable contact email is present." : "", cv.skills.length >= 6 ? `${cv.skills.length} real skills provide keyword coverage.` : "", hasMetrics ? "At least one experience bullet includes a measurable outcome." : ""].filter(Boolean),
      weaknesses: recommendations.map((item) => item.problem),
      recommendations: recommendations.map((item) => `${item.correction} Expected impact: ${item.impact}.`),
      nextSteps: ["Open the lowest category in the ATS breakdown.", "Verify and apply the first suggestion in Resume Editor.", "Measure target-role match separately with a job description."],
      uncertainty: "Without a selected job description, this score measures general ATS structure rather than role match.",
    };
  }

  if (category === "interview") {
    return {
      summary: `Using your ${roleEvidence} experience, the strongest practice topic is explaining a technical decision and its verified outcome in one story.`,
      strengths: [topSkills.length ? `${topSkills.join(", ")} can support technical depth.` : "", hasMetrics ? "Your resume includes a verifiable numeric result." : ""].filter(Boolean),
      weaknesses: [!hasMetrics ? "No verified measurement is visible for an interview story." : "", "Decision context, alternatives, and learning should be prepared explicitly."].filter(Boolean),
      recommendations: [`Question: “What was the hardest technical decision you made as a ${lastRole}, and how did you measure the result?”`, "Structure the answer as Situation, Task, Action, and Result using only real information.", "If no metric exists, do not invent one; explain the measurement method and observed direction."],
      nextSteps: ["Write a 90-second first answer.", "Mark claims that cannot be verified.", "Prepare a shorter second version."],
      uncertainty: "When project details are not present in the resume, the coach can only suggest a question framework.",
    };
  }

  if (category === "salary") {
    return {
      summary: `Your negotiation case for a ${title} offer should rely on verifiable scope and outcomes from ${roleEvidence}.`,
      strengths: [hasMetrics ? "Your resume includes a measurable result that can support negotiation." : "Your role and company context are available."],
      weaknesses: ["A precise number cannot be suggested without market range and offer components."],
      recommendations: ["Clarify base pay, bonus, benefits, and work model separately.", "Tie your request to one resume proof point rather than general confidence.", "Example: 'Considering the role scope and the verifiable product impact from my latest position, could we revisit the base salary range?'"],
      nextSteps: ["Write down every offer component.", "Set your minimum acceptable range.", "Practice the evidence sentence."],
      uncertainty: "No market comparison was made without location, company level, and offer details.",
    };
  }

  if (category === "roadmap") {
    return {
      summary: `Your ${title} roadmap should connect skill development, evidence creation, and application use.`,
      strengths: [topSkills.length ? `Current foundation: ${topSkills.join(", ")}.` : "A target role is present."],
      weaknesses: recommendations.map((item) => item.problem).slice(0, 2),
      recommendations: ["Days 1–30: create a small, publishable proof for the most important skill gap.", "Days 31–60: turn that proof into a resume bullet and portfolio narrative.", "Days 61–90: test the narrative through targeted applications and two mock interviews."],
      nextSteps: ["Select one roadmap.", "Define this week's deliverable."],
      uncertainty: "Timelines are directional because weekly availability is unknown.",
    };
  }

  return {
    summary: `${name}, the highest-leverage move for your ${title} target is making resume evidence clearer and verifiable.`,
    strengths: [roleEvidence, topSkills.length ? topSkills.join(", ") : ""].filter(Boolean),
    weaknesses: recommendations.map((item) => item.problem),
    recommendations: recommendations.map((item) => item.correction),
    nextSteps: ["Open the first recommendation.", "Verify the example against real facts.", "Recalculate the ATS score after editing."],
    uncertainty: "The coach never treats achievements or metrics absent from your resume as facts.",
  };
}

export function generateCoachResponse(userText: string): CoachResponse {
  const candidate = buildResponse(userText);
  const parsed = CoachResponseSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;
  return withoutResume(useCareerStore.getState().lang);
}

function toMarkdown(response: CoachResponse, locale: Locale) {
  const labels = locale === "tr"
    ? { strengths: "Güçlü sinyaller", weaknesses: "Geliştirilmesi gerekenler", recommendations: "Öneriler", next: "Sıradaki adımlar", uncertainty: "Belirsizlik notu" }
    : { strengths: "Strong signals", weaknesses: "Areas to improve", recommendations: "Recommendations", next: "Next steps", uncertainty: "Uncertainty note" };
  const sections = [response.summary];
  if (response.strengths.length) sections.push(`### ${labels.strengths}\n${response.strengths.map((item) => `- ${item}`).join("\n")}`);
  if (response.weaknesses.length) sections.push(`### ${labels.weaknesses}\n${response.weaknesses.map((item) => `- ${item}`).join("\n")}`);
  sections.push(`### ${labels.recommendations}\n${response.recommendations.map((item) => `- ${item}`).join("\n")}`);
  sections.push(`### ${labels.next}\n${response.nextSteps.map((item, index) => `${index + 1}. ${item}`).join("\n")}`);
  if (response.uncertainty) sections.push(`### ${labels.uncertainty}\n${response.uncertainty}`);
  return sections.join("\n\n");
}

export function generateCoachReply(userText: string) {
  const response = generateCoachResponse(userText);
  return toMarkdown(response, useCareerStore.getState().lang);
}
