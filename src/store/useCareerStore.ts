"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoachMessage, ResumeProfile } from "@/types";
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
  return {
    name: resume.fullName || "Candidate",
    title: resume.headline || "Professional",
    email: resume.email,
    phone: null,
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
    rawLength: 0,
  };
}

const defaultResume: ResumeProfile = emptyResume();

interface CareerState {
  savedJobIds: string[];
  appliedJobIds: string[];
  enrolledPathIds: string[];
  completedModuleIds: string[];
  resume: ResumeProfile;
  coachMessages: CoachMessage[];
  forgeCvText: string;
  forgeJdText: string;
  forgeParsedCv: ParsedCV | null;
  forgeAnalysis: MatchAnalysis | null;
  forgeTone: CoverLetterTone;
  forgeHistory: ForgeHistoryItem[];
  forgeBackups: CvBackup[];
  lang: "tr" | "en";
  setLang: (lang: "tr" | "en") => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleSaveJob: (id: string) => void;
  applyToJob: (id: string) => void;
  enrollPath: (id: string) => void;
  toggleModule: (id: string) => void;
  updateResume: (patch: Partial<ResumeProfile>) => void;
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
}

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      lang: "tr",
      setLang: (lang) => set({ lang }),
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      savedJobIds: [],
      appliedJobIds: [],
      enrolledPathIds: ["path-frontend"],
      completedModuleIds: ["fe-1"],
      resume: defaultResume,
      coachMessages: [
        {
          id: "welcome",
          role: "assistant",
          content:
            "Merhaba, ben Forge. Hedef rolünü, zaman çizelgeni ve takıldığın noktayı yaz — somut bir sonraki adım çıkaralım.",
          createdAt: new Date().toISOString(),
        },
      ],
      forgeCvText: "",
      forgeJdText: "",
      forgeParsedCv: null,
      forgeAnalysis: null,
      forgeTone: "Profesyonel",
      forgeHistory: [],
      forgeBackups: [],
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
        const updated = { ...get().resume, ...patch };
        set({ resume: updated, forgeParsedCv: resumeToParsed(updated) });
      },
      setResume: (resume) => set({ resume, forgeParsedCv: resumeToParsed(resume) }),
      resetResume: () => set({ resume: emptyResume(), forgeParsedCv: null }),
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
      clearCoach: () =>
        set({
          coachMessages: [
            {
              id: "welcome",
              role: "assistant",
              content:
                "Oturum sıfırlandı. Önümüzdeki 90 günde neyi başarmak istiyorsun?",
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      setForgeCvText: (text) => set({ forgeCvText: text }),
      setForgeJdText: (text) => set({ forgeJdText: text }),
      setForgeParsedCv: (cv) => set({ forgeParsedCv: cv, resume: cv ? parsedToResume(cv) : emptyResume() }),
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
    }),
    { name: "softbridge-careerforge" }
  )
);
