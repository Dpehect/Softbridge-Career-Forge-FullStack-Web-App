"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoachMessage, ResumeProfile } from "@/types";

const defaultResume: ResumeProfile = {
  fullName: "Alex Rivera",
  headline: "Product-minded frontend engineer",
  email: "alex@example.com",
  location: "Lisbon, Portugal",
  summary:
    "I build calm, high-craft web products. Recently focused on career tooling, design systems, and motion that earns its keep.",
  skills: ["TypeScript", "React", "Next.js", "System Design", "Product Sense"],
  experience: [
    {
      id: "exp-1",
      role: "Frontend Engineer",
      company: "Northlane Labs",
      start: "2023",
      end: "Present",
      highlights: [
        "Shipped evaluation dashboard used by 40+ enterprise teams",
        "Cut interaction latency 28% through selective hydration",
      ],
    },
    {
      id: "exp-2",
      role: "UI Engineer",
      company: "Harbor Commerce",
      start: "2021",
      end: "2023",
      highlights: [
        "Owned merchant onboarding redesign; activation +14%",
        "Led design system migration across 3 product surfaces",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      school: "University of Porto",
      degree: "BSc Computer Science",
      year: "2021",
    },
  ],
};

interface CareerState {
  savedJobIds: string[];
  appliedJobIds: string[];
  enrolledPathIds: string[];
  completedModuleIds: string[];
  resume: ResumeProfile;
  coachMessages: CoachMessage[];
  toggleSaveJob: (id: string) => void;
  applyToJob: (id: string) => void;
  enrollPath: (id: string) => void;
  toggleModule: (id: string) => void;
  updateResume: (patch: Partial<ResumeProfile>) => void;
  setResume: (resume: ResumeProfile) => void;
  addCoachMessage: (message: Omit<CoachMessage, "id" | "createdAt">) => void;
  clearCoach: () => void;
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
            "Welcome to CareerForge Coach. Tell me your target role, timeline, and what feels stuck — I’ll map a practical next step.",
          createdAt: new Date().toISOString(),
        },
      ],
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
                "Session reset. What’s the career outcome you want in the next 90 days?",
              createdAt: new Date().toISOString(),
            },
          ],
        }),
    }),
    { name: "softbridge-careerforge" }
  )
);
