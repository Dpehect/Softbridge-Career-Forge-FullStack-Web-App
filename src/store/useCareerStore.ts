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
});

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
      updateResume: (patch) => set({ resume: { ...get().resume, ...patch } }),
      setResume: (resume) => set({ resume }),
      resetResume: () => set({ resume: emptyResume() }),
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
      setForgeParsedCv: (cv) => set({ forgeParsedCv: cv }),
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
