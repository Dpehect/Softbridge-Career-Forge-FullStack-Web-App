"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoachMessage, ResumeProfile } from "@/types";
import type { Locale } from "@/i18n/messages";
import type {
  CoverLetterTone,
  CvBackup,
  ForgeHistoryItem,
  MatchAnalysis,
  ParsedCV,
} from "@/lib/forge/types";

const emptyResume = (): ResumeProfile => ({
  fullName: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: [],
  experience: [],
  education: [],
  photoDataUrl: null,
});

export function parsedToResume(cv: ParsedCV): ResumeProfile {
  return {
    fullName: cv.name === "Candidate" || cv.name === "Aday" ? "" : cv.name,
    headline: cv.title || "",
    email: cv.email || "",
    phone: cv.phone || "",
    location: cv.location || "",
    summary: cv.summary || "",
    skills: cv.skills || [],
    photoDataUrl: cv.photoDataUrl || null,
    experience: (cv.experience || []).map((e, i) => ({
      id: `exp-${Date.now()}-${i}`,
      role: e.position,
      company: e.company,
      start: e.duration.split(/[–-]/)[0]?.trim() || "",
      end: e.duration.split(/[–-]/)[1]?.trim() || "",
      highlights: e.description,
    })),
    education: (cv.education || []).map((e, i) => ({
      id: `edu-${Date.now()}-${i}`,
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
  };
}

export function resumeToParsed(resume: ResumeProfile): ParsedCV {
  const rawText = [
    resume.fullName,
    resume.headline,
    resume.email,
    resume.phone,
    resume.location,
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap((item) => [
      item.role,
      item.company,
      item.start,
      item.end,
      ...item.highlights,
    ]),
    ...resume.education.flatMap((item) => [item.school, item.degree, item.year]),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    name: resume.fullName || "Candidate",
    title: resume.headline || "Professional",
    email: resume.email,
    phone: resume.phone || null,
    location: resume.location || null,
    summary: resume.summary || null,
    skills: resume.skills,
    photoDataUrl: resume.photoDataUrl || null,
    experience: resume.experience.map((e) => ({
      company: e.company,
      position: e.role,
      duration: [e.start, e.end].filter(Boolean).join(" – ") || "—",
      description: e.highlights,
    })),
    education: resume.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      year: e.year,
    })),
    rawLength: rawText.length,
  };
}

const defaultResume: ResumeProfile = emptyResume();

export type ResumeSectionId = "profile" | "experience" | "skills" | "education";

function coachWelcome(lang: Locale, reset = false): CoachMessage {
  return {
    id: reset ? `welcome-${Date.now()}` : "welcome",
    role: "assistant",
    content: lang === "tr"
      ? reset
        ? "Oturum sıfırlandı. Önümüzdeki 90 günde neyi başarmak istiyorsunuz?"
        : "Merhaba. CV'nizdeki gerçek deneyimlere dayanarak mülakat hazırlığı, kariyer planı ve başvuru stratejisi üzerinde çalışabiliriz. Hedef rolünüz nedir?"
      : reset
        ? "Session reset. What would you like to achieve in the next 90 days?"
        : "Hello. We can work on interview preparation, career planning, and application strategy using evidence from your resume. What is your target role?",
    createdAt: new Date().toISOString(),
  };
}

interface CareerState {
  savedJobIds: string[];
  appliedJobIds: string[];
  enrolledPathIds: string[];
  completedModuleIds: string[];
  isDemoMode: boolean;
  resume: ResumeProfile;
  resumePast: ResumeProfile[];
  resumeFuture: ResumeProfile[];
  resumeSectionOrder: ResumeSectionId[];
  coachMessages: CoachMessage[];
  forgeCvText: string;
  forgeJdText: string;
  forgeParsedCv: ParsedCV | null;
  forgeAnalysis: MatchAnalysis | null;
  forgeTone: CoverLetterTone;
  forgeHistory: ForgeHistoryItem[];
  forgeBackups: CvBackup[];
  /** Solution-center: target role for progress cockpit */
  careerGoalId: string | null;
  setCareerGoalId: (id: string | null) => void;
  /** Last successful CV analysis meta for dashboard summary */
  lastAnalysisMeta: {
    at: string;
    fileName?: string;
    candidateName?: string;
    targetTitle?: string;
  } | null;
  setLastAnalysisMeta: (
    meta: {
      at: string;
      fileName?: string;
      candidateName?: string;
      targetTitle?: string;
    } | null
  ) => void;
  lang: Locale;
  setLang: (lang: Locale) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleSaveJob: (id: string) => void;
  applyToJob: (id: string) => void;
  enrollPath: (id: string) => void;
  toggleModule: (id: string) => void;
  updateResume: (patch: Partial<ResumeProfile>) => void;
  undoResume: () => void;
  redoResume: () => void;
  moveResumeSection: (id: ResumeSectionId, direction: -1 | 1) => void;
  /** Merge skills into resume + parsed CV (one-click from journey) */
  addSkills: (skills: string[]) => number;
  setResume: (resume: ResumeProfile) => void;
  resetResume: () => void;
  addCoachMessage: (message: Omit<CoachMessage, "id" | "createdAt">) => void;
  clearCoach: () => void;
  setForgeCvText: (text: string) => void;
  setForgeJdText: (text: string) => void;
  setForgeParsedCv: (cv: ParsedCV | null) => void;
  setForgeAnalysis: (analysis: MatchAnalysis | null) => void;
  setForgeTone: (tone: CoverLetterTone) => void;
  pushForgeHistory: (item: Omit<ForgeHistoryItem, "id" | "createdAt">) => void;
  clearForgeHistory: () => void;
  clearForgeCv: () => void;
  saveForgeBackup: (label?: string) => CvBackup | null;
  restoreForgeBackup: (id: string) => boolean;
  deleteForgeBackup: (id: string) => void;
  loadDemoProfile: () => void;
  exitDemoMode: () => void;
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      lang: "tr",
      setLang: (lang) => set({ lang, coachMessages: [coachWelcome(lang)] }),
      theme: "light",
      setTheme: (theme) => set({ theme }),
      savedJobIds: [],
      appliedJobIds: [],
      enrolledPathIds: [],
      completedModuleIds: [],
      isDemoMode: false,
      resume: defaultResume,
      resumePast: [],
      resumeFuture: [],
      resumeSectionOrder: ["profile", "experience", "skills", "education"],
      coachMessages: [coachWelcome("tr")],
      forgeCvText: "",
      forgeJdText: "",
      forgeParsedCv: null,
      forgeAnalysis: null,
      forgeTone: "Profesyonel",
      forgeHistory: [],
      forgeBackups: [],
      careerGoalId: "fullstack",
      setCareerGoalId: (careerGoalId) => set({ careerGoalId }),
      lastAnalysisMeta: null,
      setLastAnalysisMeta: (lastAnalysisMeta) => set({ lastAnalysisMeta }),
      toggleSaveJob: (id) => {
        const { savedJobIds } = get();
        set({
          savedJobIds: savedJobIds.includes(id)
            ? savedJobIds.filter((x) => x !== id)
            : [...savedJobIds, id],
        });
      },
      applyToJob: (id) => {
        const { appliedJobIds, savedJobIds } = get();
        if (appliedJobIds.includes(id)) return;
        set({
          appliedJobIds: [...appliedJobIds, id],
          savedJobIds: savedJobIds.includes(id) ? savedJobIds : [...savedJobIds, id],
        });
      },
      enrollPath: (id) => {
        const { enrolledPathIds } = get();
        if (enrolledPathIds.includes(id)) return;
        set({ enrolledPathIds: [...enrolledPathIds, id] });
      },
      toggleModule: (id) => {
        const { completedModuleIds } = get();
        set({
          completedModuleIds: completedModuleIds.includes(id)
            ? completedModuleIds.filter((x) => x !== id)
            : [...completedModuleIds, id],
        });
      },
      updateResume: (patch) => {
        const current = get().resume;
        const updated = { ...current, ...patch };
        set({
          resume: updated,
          forgeParsedCv: resumeToParsed(updated),
          resumePast: [...get().resumePast, current].slice(-40),
          resumeFuture: [],
          isDemoMode: false,
        });
      },
      undoResume: () => {
        const { resumePast, resume, resumeFuture } = get();
        const previous = resumePast.at(-1);
        if (!previous) return;
        set({
          resume: previous,
          forgeParsedCv: resumeToParsed(previous),
          resumePast: resumePast.slice(0, -1),
          resumeFuture: [resume, ...resumeFuture].slice(0, 40),
        });
      },
      redoResume: () => {
        const { resumePast, resume, resumeFuture } = get();
        const next = resumeFuture[0];
        if (!next) return;
        set({
          resume: next,
          forgeParsedCv: resumeToParsed(next),
          resumePast: [...resumePast, resume].slice(-40),
          resumeFuture: resumeFuture.slice(1),
        });
      },
      moveResumeSection: (id, direction) => {
        const order = [...get().resumeSectionOrder];
        const index = order.indexOf(id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= order.length) return;
        [order[index], order[target]] = [order[target], order[index]];
        set({ resumeSectionOrder: order });
      },
      addSkills: (skills) => {
        const { resume, forgeParsedCv } = get();
        const existing = new Set(
          resume.skills.map((s) => s.toLowerCase().trim())
        );
        const toAdd = skills
          .map((s) => s.trim())
          .filter((s) => s && !existing.has(s.toLowerCase()));
        if (toAdd.length === 0) return 0;
        const nextSkills = [...resume.skills, ...toAdd];
        const updated = { ...resume, skills: nextSkills };
        const nextParsed = forgeParsedCv
          ? { ...forgeParsedCv, skills: [...new Set([...forgeParsedCv.skills, ...toAdd])] }
          : resumeToParsed(updated);
        set({ resume: updated, forgeParsedCv: nextParsed, isDemoMode: false });
        return toAdd.length;
      },
      setResume: (resume) => set({
        resume,
        forgeParsedCv: resumeToParsed(resume),
        resumePast: [...get().resumePast, get().resume].slice(-40),
        resumeFuture: [],
        isDemoMode: false,
      }),
      resetResume: () => set({
        resume: emptyResume(),
        forgeParsedCv: null,
        resumePast: [],
        resumeFuture: [],
        isDemoMode: false,
      }),
      addCoachMessage: (message) =>
        set({
          coachMessages: [
            ...get().coachMessages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      clearCoach: () => set({ coachMessages: [coachWelcome(get().lang, true)] }),
      setForgeCvText: (text) => set({ forgeCvText: text }),
      setForgeJdText: (text) => set({ forgeJdText: text }),
      setForgeParsedCv: (cv) =>
        set({
          forgeParsedCv: cv,
          resume: cv ? parsedToResume(cv) : emptyResume(),
          isDemoMode: false,
          lastAnalysisMeta: cv
            ? {
                at: new Date().toISOString(),
                candidateName: cv.name,
                targetTitle: cv.title,
                fileName: get().lastAnalysisMeta?.fileName,
              }
            : get().lastAnalysisMeta,
        }),
      setForgeAnalysis: (analysis) => set({ forgeAnalysis: analysis }),
      setForgeTone: (tone) => set({ forgeTone: tone }),
      pushForgeHistory: (item) =>
        set({
          forgeHistory: [
            {
              ...item,
              id: `forge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
            ...get().forgeHistory,
          ].slice(0, 30),
        }),
      clearForgeHistory: () => set({ forgeHistory: [] }),
      clearForgeCv: () =>
        set({
          forgeCvText: "",
          forgeParsedCv: null,
          forgeAnalysis: null,
          resume: emptyResume(),
          resumePast: [],
          resumeFuture: [],
          isDemoMode: false,
        }),
      saveForgeBackup: (label) => {
        const { forgeCvText, forgeParsedCv, forgeBackups } = get();
        if (!forgeCvText.trim() && !forgeParsedCv) return null;
        const backup: CvBackup = {
          id: `bak-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          label: label?.trim() || `Backup ${new Date().toLocaleString()}`,
          createdAt: new Date().toISOString(),
          cvText: forgeCvText,
          parsed: forgeParsedCv,
        };
        set({ forgeBackups: [backup, ...forgeBackups].slice(0, 20) });
        return backup;
      },
      restoreForgeBackup: (id) => {
        const bak = get().forgeBackups.find((b) => b.id === id);
        if (!bak) return false;
        set({
          forgeCvText: bak.cvText,
          forgeParsedCv: bak.parsed,
        });
        return true;
      },
      deleteForgeBackup: (id) =>
        set({ forgeBackups: get().forgeBackups.filter((b) => b.id !== id) }),
      loadDemoProfile: () => {
        const lang = get().lang;
        const isTr = lang === "tr";
        const demoResume: ResumeProfile = {
          fullName: "Yusuf Demir",
          headline: "Senior Frontend Engineer",
          email: "yusuf@demir.dev",
          phone: "+90 555 123 4567",
          location: isTr ? "İstanbul, Türkiye" : "Istanbul, Türkiye",
          summary: isTr
            ? "Dört yıllık ürün geliştirme deneyimine sahip, Next.js ve TypeScript alanlarında uzmanlaşmış frontend mühendisi. Sayfa açılış süresini %35 azaltan ve 12 bin aylık kullanıcıya hizmet veren arayüz sistemleri geliştirdi."
            : "Frontend engineer with four years of product development experience specializing in Next.js and TypeScript. Built interface systems serving 12,000 monthly users and reduced page load time by 35%.",
          skills: ["React", "JavaScript", "CSS", "Git", "REST APIs", "TypeScript", "Next.js", "System Design"],
          photoDataUrl: null,
          experience: [
            {
              id: "exp-demo-1",
              role: "Senior Frontend Developer",
              company: "SoftBridge",
              start: "2022",
              end: isTr ? "Devam Ediyor" : "Present",
              highlights: isTr ? [
                "12 bin aylık kullanıcıya hizmet veren analitik paneli Next.js ile geliştirdi.",
                "Kod bölümleme ve görsel optimizasyonuyla sayfa açılış süresini %35 azalttı.",
                "Üç ürün ekibinin kullandığı ortak arayüz bileşen kütüphanesini yayına aldı."
              ] : [
                "Built a Next.js analytics workspace serving 12,000 monthly users.",
                "Reduced page load time by 35% through code splitting and image optimization.",
                "Launched a shared interface component library adopted by three product teams."
              ]
            }
          ],
          education: [
            {
              id: "edu-demo-1",
              school: "Boğaziçi Üniversitesi",
              degree: isTr ? "Bilgisayar Mühendisliği" : "Computer Engineering",
              year: "2018 - 2022"
            }
          ]
        };

        const demoParsedCV: ParsedCV = {
          name: "Yusuf Demir",
          title: "Senior Frontend Engineer",
          email: "yusuf@demir.dev",
          phone: "+90 555 123 4567",
          location: isTr ? "İstanbul, Türkiye" : "Istanbul, Türkiye",
          summary: demoResume.summary,
          skills: ["React", "JavaScript", "CSS", "Git", "REST APIs", "TypeScript", "Next.js", "System Design"],
          photoDataUrl: null,
          experience: [
            {
              company: "SoftBridge",
              position: "Senior Frontend Developer",
              duration: isTr ? "2022 – Devam Ediyor" : "2022 – Present",
              description: demoResume.experience[0].highlights,
            }
          ],
          education: [
            {
              school: "Boğaziçi Üniversitesi",
              degree: isTr ? "Bilgisayar Mühendisliği" : "Computer Engineering",
              year: "2022"
            }
          ],
          rawLength: 500
        };

        set({
          isDemoMode: true,
          resume: demoResume,
          resumePast: [],
          resumeFuture: [],
          forgeParsedCv: demoParsedCV,
          forgeCvText: isTr
            ? "Yusuf Demir — Senior Frontend Engineer\nİstanbul | yusuf@demir.dev\n\nÖZET\nNext.js ve TypeScript ile ölçeklenebilir ürün arayüzleri geliştiren frontend mühendisi.\n\nDENEYİM\nSoftBridge — Senior Frontend Developer (2022–Devam Ediyor)\n- 12 bin aylık kullanıcıya hizmet veren analitik paneli geliştirdi\n- Sayfa açılış süresini %35 azalttı\n\nBECERİLER\nJavaScript, React, CSS, Git, REST API, TypeScript, Next.js"
            : "Yusuf Demir — Senior Frontend Engineer\nIstanbul | yusuf@demir.dev\n\nSUMMARY\nFrontend engineer building scalable product interfaces with Next.js and TypeScript.\n\nEXPERIENCE\nSoftBridge — Senior Frontend Developer (2022–Present)\n- Built an analytics workspace serving 12,000 monthly users\n- Reduced page load time by 35%\n\nSKILLS\nJavaScript, React, CSS, Git, REST API, TypeScript, Next.js",
          forgeJdText: isTr
            ? "Senior Frontend Engineer\nGereksinimler: TypeScript, Next.js, React, test otomasyonu, CI/CD ve temel sistem tasarımı."
            : "Senior Frontend Engineer\nRequirements: TypeScript, Next.js, React, testing, CI/CD, and system design fundamentals.",
          forgeAnalysis: {
            matchScore: 78,
            atsScore: 87,
            strengths: isTr ? ["React, Next.js ve TypeScript gereksinimleriyle güçlü eşleşme."] : ["Strong alignment with React, Next.js, and TypeScript requirements."],
            gaps: isTr ? ["Test otomasyonu ve CI/CD kanıtı güçlendirilmeli."] : ["Testing and CI/CD evidence should be strengthened."],
            suggestions: isTr ? ["Son deneyime doğrulanabilir bir test otomasyonu örneği ekleyin."] : ["Add a verifiable testing automation example to the latest role."],
            matchedSkills: ["React", "Next.js", "TypeScript"],
            missingSkills: ["Testing", "CI/CD"],
          },
          careerGoalId: "frontend",
          enrolledPathIds: ["path-frontend"],
          completedModuleIds: ["fe-1", "fe-2"],
          savedJobIds: ["job-1", "job-9"],
          appliedJobIds: ["job-1"],
          coachMessages: [
            coachWelcome(lang),
            {
              id: "demo-coach",
              role: "assistant",
              content: isTr
                ? "Son provada performans iyileştirmesini STAR yapısına dönüştürdünüz. Sıradaki çalışma: test otomasyonu deneyiminizi doğrulanabilir bir örnekle anlatmak."
                : "In the latest practice, you turned the performance improvement into a STAR response. Next: describe your testing automation experience with a verifiable example.",
              createdAt: new Date().toISOString(),
            },
          ],
          forgeHistory: [
            {
              id: "demo-history-1",
              action: "ats",
              summary: isTr ? "ATS analizi tamamlandı · 87/100" : "ATS analysis completed · 87/100",
              createdAt: new Date().toISOString(),
              payload: { atsScore: 87 },
            },
          ],
          lastAnalysisMeta: {
            at: new Date().toISOString(),
            candidateName: "Yusuf Demir",
            targetTitle: "Senior Frontend Engineer",
            fileName: "yusuf_demir_cv.pdf"
          }
        });
      },
      exitDemoMode: () => set({
        isDemoMode: false,
        resume: emptyResume(),
        resumePast: [],
        resumeFuture: [],
        forgeCvText: "",
        forgeJdText: "",
        forgeParsedCv: null,
        forgeAnalysis: null,
        forgeHistory: [],
        savedJobIds: [],
        appliedJobIds: [],
        enrolledPathIds: [],
        completedModuleIds: [],
        coachMessages: [coachWelcome(get().lang)],
        lastAnalysisMeta: null,
      }),
    }),
    { name: "softbridge-careerforge" }
  )
);
