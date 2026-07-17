import { useState, useMemo } from "react";
import { useCareerStore } from "@/store/useCareerStore";
import { generateCoachReply } from "@/lib/coach";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReadyQuestion {
  id: string;
  label: string;      // Short button label shown in sidebar
  prompt: string;     // Full prompt sent to the coach
  tag: "resume" | "interview" | "ats" | "salary" | "growth" | "gap";
  priority: "high" | "medium" | "low";
}

export interface CvInsight {
  type: "warning" | "tip" | "success";
  message: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hasMetrics(bullets: string[]): boolean {
  return bullets.some((b) => /\d+\s*%|\$\d|\d+\s*(ms|s\b|hours?|days?|users?|req|rpm)|x\d|\d{2,}\+/i.test(b));
}

function slugId(prefix: string, i: number) {
  return `${prefix}-${i}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Main Hook ────────────────────────────────────────────────────────────────

export function useCoachAI() {
  const { resume, lang, addCoachMessage, coachMessages, clearCoach, forgeParsedCv } =
    useCareerStore();
  const [loading, setLoading] = useState(false);

  // ── Derived CV context ─────────────────────────────────────────────────────
  const cvContext = useMemo(() => {
    // Prefer forge-parsed CV over manual resume store
    const forgeFirst = !!forgeParsedCv?.name;
    const name = (forgeFirst ? forgeParsedCv!.name : resume.fullName).split(" ")[0] || (lang === "tr" ? "Aday" : "Candidate");
    const title = (forgeFirst ? forgeParsedCv!.title : resume.headline) || (lang === "tr" ? "Yazılım Profesyoneli" : "Software Professional");
    const lastJobForge = forgeParsedCv?.experience?.[0];
    const lastJob = forgeFirst ? null : (resume.experience[0] ?? null);
    const lastTitle = lastJobForge?.position ?? lastJob?.role ?? title;
    const lastCompany = lastJobForge?.company ?? lastJob?.company ?? (lang === "tr" ? "hedef şirket" : "target company");
    const allBullets = forgeFirst
      ? (forgeParsedCv?.experience ?? []).flatMap((e) => e.description ?? [])
      : resume.experience.flatMap((e) => e.highlights ?? []);
    const topSkills = (forgeFirst ? forgeParsedCv?.skills ?? [] : resume.skills).slice(0, 5);
    const firstSkill = topSkills[0] ?? (lang === "tr" ? "teknik beceri" : "technical skill");
    const skillCount = forgeFirst ? (forgeParsedCv?.skills?.length ?? 0) : resume.skills.length;
    const expCount = forgeFirst ? (forgeParsedCv?.experience?.length ?? 0) : resume.experience.length;
    const hasSummary = forgeFirst
      ? (forgeParsedCv?.summary?.trim().length ?? 0) > 40
      : (resume.summary?.trim().length ?? 0) > 40;
    const metricsPresent = hasMetrics(allBullets);
    const bulletsPresent = allBullets.length > 0;

    return {
      name, title, lastJob, lastTitle, lastCompany,
      allBullets, topSkills, firstSkill, skillCount,
      expCount, hasSummary, metricsPresent, bulletsPresent,
    };
  }, [resume, lang, forgeParsedCv]);

  // ── CV Health Insights ─────────────────────────────────────────────────────
  const cvInsights = useMemo((): CvInsight[] => {
    const insights: CvInsight[] = [];
    const { hasSummary, metricsPresent, bulletsPresent, skillCount, expCount } = cvContext;

    if (!hasSummary) {
      insights.push({
        type: "warning",
        message: lang === "tr"
          ? "Profil özeti eksik veya çok kısa; rol ve değer önerisi ilk taramada görünmüyor."
          : "The profile summary is missing or too short, so role and value signals are not visible in an initial scan.",
      });
    }
    if (bulletsPresent && !metricsPresent) {
      insights.push({
        type: "warning",
        message: lang === "tr"
          ? "Deneyim maddelerinde doğrulanabilir sonuç sinyali bulunamadı; gerçek bir etki varsa ekleyin."
          : "No verifiable outcome signal was found in experience bullets; add one only when a real result exists.",
      });
    }
    if (skillCount < 5) {
      insights.push({
        type: "warning",
        message: lang === "tr"
          ? `${skillCount} beceri listelendi. Hedef ilanla karşılaştırarak eksik ve gerçekten sahip olduğunuz becerileri doğrulayın.`
          : `${skillCount} skills are listed. Compare them with a target listing and verify any missing skills you genuinely have.`,
      });
    }
    if (expCount === 0) {
      insights.push({
        type: "tip",
        message: lang === "tr"
          ? "İş deneyimi bölümü boş. Projeleri veya stajları deneyim olarak ekleyebilirsin."
          : "No experience added. Consider adding projects or internships as structured experience.",
      });
    }
    if (hasSummary && metricsPresent && skillCount >= 6) {
      insights.push({
        type: "success",
        message: lang === "tr"
          ? "CV'nin temel bölümleri güçlü görünüyor. Şimdi özel optimizasyona odaklanabiliriz."
          : "Core CV sections look solid. Ready to focus on targeted optimizations.",
      });
    }
    return insights;
  }, [cvContext, lang]);

  // ── Dynamic Ready Questions (personalized to CV) ───────────────────────────
  const readyQuestions = useMemo((): ReadyQuestion[] => {
    const {
      name, title, lastTitle, lastCompany, firstSkill,
      skillCount, expCount, hasSummary, metricsPresent, bulletsPresent,
    } = cvContext;

    const questions: ReadyQuestion[] = [];
    let i = 0;

    if (lang === "tr") {
      // HIGH PRIORITY — based on detected gaps
      if (!hasSummary) {
        questions.push({
          id: slugId("q", i++),
          label: "Profil özeti yaz",
          prompt: `"${title}" rolünü hedefleyen, ATS dostu, güçlü bir 3 satırlık profil özeti (professional summary) yazar mısın? Adım ${name}, şu ana kadarki son rolüm ${lastTitle} @ ${lastCompany} ve güçlü olduğum beceriler: ${firstSkill}.`,
          tag: "resume",
          priority: "high",
        });
      }
      if (bulletsPresent && !metricsPresent) {
        questions.push({
          id: slugId("q", i++),
          label: "Başarı maddelerime metrik ekle",
          prompt: `"${lastTitle} @ ${lastCompany}" rolümdeki deneyim maddelerine nasıl sayısal metrikler ekleyebilirim? Somut örnekler ve STAR formatıyla göster.`,
          tag: "resume",
          priority: "high",
        });
      }
      if (skillCount < 6) {
        questions.push({
          id: slugId("q", i++),
          label: "Eksik becerilerimi tamamla",
          prompt: `Bir "${title}" olarak hangi 5-6 teknik beceriyi öğrensem ilanlarla uyumumu en çok artırır? Mevcut becerilerim: ${firstSkill}. Gerçekçi bir öncelik sırası ver.`,
          tag: "gap",
          priority: "high",
        });
      }
      if (expCount <= 1) {
        questions.push({
          id: slugId("q", i++),
          label: "Proje deneyimini yapılandır",
          prompt: `Özgeçmişimde az iş deneyimi var. Kişisel projelerimi veya stajlarımı nasıl yapılandırarak güçlü bir iş deneyimi bölümü oluşturabilirim? "${title}" pozisyonunu hedefliyorum.`,
          tag: "resume",
          priority: "high",
        });
      }

      questions.unshift({
        id: slugId("q", i++),
        label: "En zor mülakat sorusu + 3 STAR",
        prompt: `Bu CV ile bir mülakata girsem en zorlanacağım soru hangisi olabilir? Özellikle “Neden önceki projeniz başarısız oldu?” tipinde bir soru için STAR metoduna uygun 3 farklı cevap şablonu yaz. Hedef rol: ${title}. CV bağlamı: ${firstSkill}, ${lastCompany}.`,
        tag: "interview",
        priority: "high",
      });

      // MEDIUM PRIORITY — always useful
      questions.push({
        id: slugId("q", i++),
        label: `"${firstSkill}" mülakat soruları`,
        prompt: `"${firstSkill}" konusunda mülakatlarda karşılaşabileceğim 3 zor teknik soruyu STAR formatında cevap taslağıyla birlikte yaz. Hedef rolüm: ${title}.`,
        tag: "interview",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "ATS uyumumu artır",
        prompt: `CV'mde ATS (Applicant Tracking System) puanımı düşüren en yaygın 3 sorunu ve nasıl düzeltebileceğimi açıklar mısın? Hedef rol: "${title}". Becerilerim: ${firstSkill}.`,
        tag: "ats",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "Maaş pazarlığı stratejisi",
        prompt: `"${title}" pozisyonu için teklif aşamasında nasıl güçlü bir maaş pazarlığı yapabilirim? ${lastCompany} gibi şirketlerdeki tecrübemi nasıl kullanırım? Adım adım bir script ver.`,
        tag: "salary",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "İlk 30-60-90 gün planı",
        prompt: `"${title}" olarak yeni bir işe başladığımda ilk 90 günde değer katmak için nasıl bir plan yapmalıyım? Mülakatta bu soruya nasıl cevap vermeliyim?`,
        tag: "interview",
        priority: "medium",
      });

      // LOW PRIORITY
      questions.push({
        id: slugId("q", i++),
        label: "LinkedIn profilimi optimize et",
        prompt: `LinkedIn profilimi "${title}" rolüne göre nasıl optimize edebilirim? Hangi bölümlere dikkat etmeliyim ve About bölümüne ne yazmalıyım?`,
        tag: "growth",
        priority: "low",
      });
      questions.push({
        id: slugId("q", i++),
        label: "Başvuru stratejimi değerlendir",
        prompt: `"${title}" pozisyonu için başvuru stratejimi hangi doğrulanabilir sinyallerle değerlendirmeliyim? Olası sorunları kesinlik iddiası olmadan sırala.`,
        tag: "growth",
        priority: "low",
      });

    } else {
      // ENGLISH — same logic, English copy

      if (!hasSummary) {
        questions.push({
          id: slugId("q", i++),
          label: "Write my summary",
          prompt: `Write a compelling, ATS-optimized 3-line professional summary for a "${title}" role. My name is ${name}, my latest role was ${lastTitle} at ${lastCompany}, and my strongest skill is ${firstSkill}.`,
          tag: "resume",
          priority: "high",
        });
      }
      if (bulletsPresent && !metricsPresent) {
        questions.push({
          id: slugId("q", i++),
          label: "Add metrics to my bullets",
          prompt: `How can I add quantitative metrics to my experience bullets for my "${lastTitle} @ ${lastCompany}" role? Show me concrete before/after rewrites using the STAR method.`,
          tag: "resume",
          priority: "high",
        });
      }
      if (skillCount < 6) {
        questions.push({
          id: slugId("q", i++),
          label: "Close my skill gaps",
          prompt: `As a "${title}", which 5-6 technical skills would most improve my alignment with competitive job listings? I currently know ${firstSkill}. Give me a realistic priority order.`,
          tag: "gap",
          priority: "high",
        });
      }
      if (expCount <= 1) {
        questions.push({
          id: slugId("q", i++),
          label: "Frame my projects as experience",
          prompt: `I have limited work experience on my CV. How do I structure personal projects or bootcamp work into a strong Experience section targeting "${title}" roles?`,
          tag: "resume",
          priority: "high",
        });
      }

      questions.unshift({
        id: slugId("q", i++),
        label: "Hardest interview Q + 3 STAR",
        prompt: `If I interview with this CV, what is the hardest question I might face? Especially for “Why did a previous project fail?”, give 3 different STAR-method answer templates. Target role: ${title}. Context: ${firstSkill}, ${lastCompany}.`,
        tag: "interview",
        priority: "high",
      });
      questions.push({
        id: slugId("q", i++),
        label: `Interview questions for "${firstSkill}"`,
        prompt: `Give me 3 hard technical interview questions related to "${firstSkill}" with STAR-format answer outlines. My target role is ${title}.`,
        tag: "interview",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "Boost my ATS score",
        prompt: `What are the top 3 ATS (Applicant Tracking System) mistakes on my CV and how do I fix them? Target role: "${title}", current skills: ${firstSkill}.`,
        tag: "ats",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "Salary negotiation script",
        prompt: `Give me a step-by-step salary negotiation playbook for a "${title}" offer. How do I leverage my experience at ${lastCompany} to negotiate a higher base? Include exact scripts to say.`,
        tag: "salary",
        priority: "medium",
      });
      questions.push({
        id: slugId("q", i++),
        label: "First 30-60-90 day plan",
        prompt: `How do I build a strong 30-60-90 day plan for a new "${title}" role, and how do I answer this question in an interview to stand out?`,
        tag: "interview",
        priority: "medium",
      });

      questions.push({
        id: slugId("q", i++),
        label: "Optimize LinkedIn profile",
        prompt: `How should I optimize my LinkedIn profile for a "${title}" role? Which sections matter most and what should I write in my About section?`,
        tag: "growth",
        priority: "low",
      });
      questions.push({
        id: slugId("q", i++),
        label: "Review my application strategy",
        prompt: `Which verifiable signals should I use to review my application strategy for "${title}" roles? Rank possible issues without claiming certainty.`,
        tag: "growth",
        priority: "low",
      });
    }

    return questions;
  }, [cvContext, lang]);

  // ── Ask Coach ─────────────────────────────────────────────────────────────
  const askCoach = async (text: string) => {
    const query = text.trim();
    if (!query || loading) return;

    addCoachMessage({ role: "user", content: query });
    setLoading(true);

    // Simulate network latency — feels real
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const reply = generateCoachReply(query);
    addCoachMessage({ role: "assistant", content: reply });

    setLoading(false);
  };

  // ── CV is loaded? ─────────────────────────────────────────────────────────
  const hasCv = Boolean(
    forgeParsedCv?.name ||
    resume.fullName.trim() ||
    resume.experience.length > 0 ||
    resume.skills.length > 0
  );

  return {
    readyQuestions,
    cvInsights,
    cvContext,
    loading,
    askCoach,
    clearCoach,
    coachMessages,
    hasCv,
  };
}
