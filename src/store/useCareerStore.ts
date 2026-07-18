"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import type { CoachMessage, ResumeProfile, JobApplicationDetails } from "@/types";
import type { Locale } from "@/i18n/messages";
import { createEmptyHydrationData, createEmptyResume, type StoreHydrationData } from "@/lib/supabase/workspace-mapper";
import type {
  CoverLetterTone,
  CvBackup,
  ForgeHistoryItem,
  MatchAnalysis,
  ParsedCV,
} from "@/lib/forge/types";
import { analyzeMatch } from "@/lib/forge/analyze";

const emptyResume = createEmptyResume;

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
    website: "",
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
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    publications: [],
    socialLinks: [],
    customization: {
      template: "classic",
      fontFamily: "sans",
      primaryColor: "brand",
    },
    sectionVisibility: {
      profile: true,
      experience: true,
      skills: true,
      education: true,
      projects: true,
      certifications: true,
      languages: true,
      awards: true,
      publications: true,
      socialLinks: true,
    },
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

export type ResumeSectionId = "profile" | "experience" | "skills" | "education" | "projects" | "certifications" | "languages" | "awards" | "publications" | "socialLinks";

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

export type CloudSyncStatus = "local" | "idle" | "loading" | "saving" | "saved" | "offline" | "error" | "conflict" | "demo";

export interface CareerState {
  profileFullName: string;
  profileAvatarPath: string | null;
  savedJobIds: string[];
  appliedJobIds: string[];
  jobStages: Record<string, string>;
  jobApplicationDetails: Record<string, JobApplicationDetails>;
  updateJobApplicationDetails: (jobId: string, details: Partial<JobApplicationDetails>) => void;
  enrolledPathIds: string[];
  completedModuleIds: string[];
  isDemoMode: boolean;
  resume: ResumeProfile;
  resumePast: ResumeProfile[];
  resumeFuture: ResumeProfile[];
  resumeSectionOrder: string[];
  coachMessages: CoachMessage[];
  forgeCvText: string;
  forgeJdText: string;
  forgeParsedCv: ParsedCV | null;
  forgeAnalysis: MatchAnalysis | null;
  forgeTone: CoverLetterTone;
  forgeHistory: ForgeHistoryItem[];
  forgeBackups: CvBackup[];
  careerGoalId: string | null;
  setCareerGoalId: (id: string | null) => void;
  lastAnalysisMeta: {
    at: string;
    fileName?: string;
    candidateName?: string;
    targetTitle?: string;
  } | null;
  cloudUserId: string | null;
  cloudHydrated: boolean;
  cloudDirty: boolean;
  cloudStatus: CloudSyncStatus;
  cloudError: string | null;
  cloudLastSyncedAt: string | null;
  cloudChangeVersion: number;
  cloudReloadVersion: number;
  cloudConflictIncoming: StoreHydrationData | null;
  cloudConflictUserId: string | null;
  cloudConflictUpdatedAt: string | null;
  showMigrationDialog: boolean;
  resolveConflict: (choice: "keep" | "replace" | "merge" | "cancel") => void;
  hydrateFromCloud: (data: StoreHydrationData, userId: string, updatedAt: string | null) => void;
  setCloudLoading: () => void;
  setCloudSaving: () => void;
  markCloudSaved: (changeVersion: number, updatedAt: string) => void;
  markCloudError: (message: string, offline?: boolean) => void;
  markCloudConflict: (message: string) => void;
  requestCloudReload: () => void;
  retryCloudSync: () => void;
  clearPrivateWorkspace: () => void;
  setProfileFullName: (name: string) => void;
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
  updateJobStage: (id: string, stage: string) => void;
  enrollPath: (id: string) => void;
  toggleModule: (id: string) => void;
  updateResume: (patch: Partial<ResumeProfile>) => void;
  undoResume: () => void;
  redoResume: () => void;
  moveResumeSection: (id: string, direction: -1 | 1) => void;
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

function cloudMutation(state: CareerState) {
  if (state.isDemoMode) {
    return { isDemoMode: true as const, cloudDirty: false, cloudStatus: "demo" as const };
  }
  if (!state.cloudHydrated || !state.cloudUserId) return {};
  return {
    cloudDirty: true,
    cloudChangeVersion: state.cloudChangeVersion + 1,
    cloudStatus: "idle" as const,
    cloudError: null,
  };
}

function mergeWorkspaceSnapshots(local: StoreHydrationData, cloud: StoreHydrationData): StoreHydrationData {
  const merged: StoreHydrationData = { ...local };
  const rLocal = local.resume;
  const rCloud = cloud.resume;
  
  merged.resume = {
    ...rLocal,
    fullName: rLocal.fullName || rCloud.fullName || "",
    headline: rLocal.headline || rCloud.headline || "",
    email: rLocal.email || rCloud.email || "",
    phone: rLocal.phone || rCloud.phone || "",
    location: rLocal.location || rCloud.location || "",
    summary: rLocal.summary || rCloud.summary || "",
    photoDataUrl: rLocal.photoDataUrl || rCloud.photoDataUrl || null,
    website: rLocal.website || rCloud.website || "",
    skills: Array.from(new Set([...(rLocal.skills || []), ...(rCloud.skills || [])])),
    experience: [
      ...(rLocal.experience || []),
      ...(rCloud.experience || []).filter((ce) =>
        !(rLocal.experience || []).some((le) => le.company === ce.company && le.role === ce.role)
      )
    ],
    education: [
      ...(rLocal.education || []),
      ...(rCloud.education || []).filter((ce) =>
        !(rLocal.education || []).some((le) => le.school === ce.school && le.degree === ce.degree)
      )
    ],
    projects: [
      ...(rLocal.projects || []),
      ...(rCloud.projects || []).filter((ce) =>
        !(rLocal.projects || []).some((le) => le.title === ce.title)
      )
    ],
    certifications: [
      ...(rLocal.certifications || []),
      ...(rCloud.certifications || []).filter((ce) =>
        !(rLocal.certifications || []).some((le) => le.name === ce.name)
      )
    ],
    languages: [
      ...(rLocal.languages || []),
      ...(rCloud.languages || []).filter((ce) =>
        !(rLocal.languages || []).some((le) => le.name === ce.name)
      )
    ],
    awards: [
      ...(rLocal.awards || []),
      ...(rCloud.awards || []).filter((ce) =>
        !(rLocal.awards || []).some((le) => le.title === ce.title)
      )
    ],
    publications: [
      ...(rLocal.publications || []),
      ...(rCloud.publications || []).filter((ce) =>
        !(rLocal.publications || []).some((le) => le.title === ce.title)
      )
    ],
    socialLinks: [
      ...(rLocal.socialLinks || []),
      ...(rCloud.socialLinks || []).filter((ce) =>
        !(rLocal.socialLinks || []).some((le) => le.label === ce.label)
      )
    ],
    sectionVisibility: {
      ...(rCloud.sectionVisibility || {}),
      ...(rLocal.sectionVisibility || {})
    },
    customization: {
      template: "classic",
      fontFamily: "sans",
      primaryColor: "brand",
      ...(rCloud.customization || {}),
      ...(rLocal.customization || {})
    }
  };

  merged.savedJobIds = Array.from(new Set([...(local.savedJobIds || []), ...(cloud.savedJobIds || [])]));
  merged.appliedJobIds = Array.from(new Set([...(local.appliedJobIds || []), ...(cloud.appliedJobIds || [])]));
  merged.jobStages = {
    ...(cloud.jobStages || {}),
    ...(local.jobStages || {})
  };
  merged.jobApplicationDetails = {
    ...(cloud.jobApplicationDetails || {}),
    ...(local.jobApplicationDetails || {})
  };
  merged.enrolledPathIds = Array.from(new Set([...(local.enrolledPathIds || []), ...(cloud.enrolledPathIds || [])]));
  merged.completedModuleIds = Array.from(new Set([...(local.completedModuleIds || []), ...(cloud.completedModuleIds || [])]));

  merged.coachMessages = [
    ...(local.coachMessages || []),
    ...(cloud.coachMessages || []).filter((cm) =>
      !(local.coachMessages || []).some((lm) => lm.id === cm.id || lm.content === cm.content)
    )
  ];

  merged.forgeHistory = [
    ...(local.forgeHistory || []),
    ...(cloud.forgeHistory || []).filter((ch) =>
      !(local.forgeHistory || []).some((lh) => lh.id === ch.id)
    )
  ];
  merged.forgeBackups = [
    ...(local.forgeBackups || []),
    ...(cloud.forgeBackups || []).filter((cb) =>
      !(local.forgeBackups || []).some((lb) => lb.id === cb.id)
    )
  ];
  
  return merged;
}

export const useCareerStore = create<CareerState>()(
  subscribeWithSelector(persist(
    (set, get) => ({
      profileFullName: "",
      profileAvatarPath: null,
      lang: "tr",
      setLang: (lang) => set((state) => ({ lang, ...cloudMutation(state) })),
      theme: "light",
      setTheme: (theme) => set((state) => ({ theme, ...cloudMutation(state) })),
      savedJobIds: [],
      appliedJobIds: [],
      jobStages: {},
      jobApplicationDetails: {},
      updateJobApplicationDetails: (jobId, details) => set((state) => {
        const current = state.jobApplicationDetails?.[jobId] || {};
        return {
          jobApplicationDetails: {
            ...state.jobApplicationDetails,
            [jobId]: { ...current, ...details }
          },
          ...cloudMutation(state)
        };
      }),
      enrolledPathIds: [],
      completedModuleIds: [],
      isDemoMode: false,
      resume: defaultResume,
      resumePast: [],
      resumeFuture: [],
      resumeSectionOrder: ["profile", "experience", "skills", "education", "projects", "certifications", "languages", "awards", "publications", "socialLinks"],
      coachMessages: [coachWelcome("tr")],
      forgeCvText: "",
      forgeJdText: "",
      forgeParsedCv: null,
      forgeAnalysis: null,
      forgeTone: "Profesyonel",
      forgeHistory: [],
      forgeBackups: [],
      cloudUserId: null,
      cloudHydrated: false,
      cloudDirty: false,
      cloudStatus: "local",
      cloudError: null,
      cloudLastSyncedAt: null,
      cloudChangeVersion: 0,
      cloudReloadVersion: 0,
      cloudConflictIncoming: null,
      cloudConflictUserId: null,
      cloudConflictUpdatedAt: null,
      showMigrationDialog: false,
      resolveConflict: (choice) => {
        const { cloudConflictIncoming, cloudConflictUserId, cloudConflictUpdatedAt } = get();
        if (!cloudConflictIncoming || !cloudConflictUserId) {
          set({ showMigrationDialog: false });
          return;
        }
        if (choice === "keep") {
          set(() => ({
            showMigrationDialog: false,
            cloudConflictIncoming: null,
            cloudConflictUserId: null,
            cloudConflictUpdatedAt: null,
            cloudUserId: cloudConflictUserId,
            cloudHydrated: true,
            cloudDirty: true,
            cloudStatus: "saving",
          }));
        } else if (choice === "replace") {
          get().hydrateFromCloud(cloudConflictIncoming, cloudConflictUserId, cloudConflictUpdatedAt);
          set({
            showMigrationDialog: false,
            cloudConflictIncoming: null,
            cloudConflictUserId: null,
            cloudConflictUpdatedAt: null,
          });
        } else if (choice === "merge") {
          const localStateSnapshot = {
            profileFullName: get().profileFullName,
            profileAvatarPath: get().profileAvatarPath,
            lang: get().lang,
            theme: get().theme,
            careerGoalId: get().careerGoalId,
            resume: get().resume,
            resumeSectionOrder: get().resumeSectionOrder,
            coachMessages: get().coachMessages,
            forgeCvText: get().forgeCvText,
            forgeJdText: get().forgeJdText,
            forgeParsedCv: get().forgeParsedCv,
            forgeAnalysis: get().forgeAnalysis,
            forgeTone: get().forgeTone,
            forgeHistory: get().forgeHistory,
            forgeBackups: get().forgeBackups,
            savedJobIds: get().savedJobIds,
            appliedJobIds: get().appliedJobIds,
            jobStages: get().jobStages,
            jobApplicationDetails: get().jobApplicationDetails,
            enrolledPathIds: get().enrolledPathIds,
            completedModuleIds: get().completedModuleIds,
            lastAnalysisMeta: get().lastAnalysisMeta,
          };
          const mergedData = mergeWorkspaceSnapshots(localStateSnapshot, cloudConflictIncoming);
          get().hydrateFromCloud(mergedData, cloudConflictUserId, cloudConflictUpdatedAt);
          set({
            showMigrationDialog: false,
            cloudConflictIncoming: null,
            cloudConflictUserId: null,
            cloudConflictUpdatedAt: null,
            cloudDirty: true,
            cloudStatus: "saving",
          });
        } else if (choice === "cancel") {
          set({
            showMigrationDialog: false,
            cloudConflictIncoming: null,
            cloudConflictUserId: null,
            cloudConflictUpdatedAt: null,
            cloudStatus: "local",
            cloudUserId: null,
            cloudHydrated: false,
          });
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("careerforge:signout"));
          }
        }
      },
      hydrateFromCloud: (data, userId, updatedAt) => set({
        ...data,
        coachMessages: data.coachMessages.length ? data.coachMessages : [coachWelcome(data.lang)],
        resumePast: [],
        resumeFuture: [],
        isDemoMode: false,
        cloudUserId: userId,
        cloudHydrated: true,
        cloudDirty: false,
        cloudStatus: "saved",
        cloudError: null,
        cloudLastSyncedAt: updatedAt,
      }),
      setCloudLoading: () => set({ cloudStatus: "loading", cloudError: null }),
      setCloudSaving: () => set({ cloudStatus: "saving", cloudError: null }),
      markCloudSaved: (changeVersion, updatedAt) => set((state) => ({
        cloudDirty: state.cloudChangeVersion === changeVersion ? false : state.cloudDirty,
        cloudStatus: state.cloudChangeVersion === changeVersion ? "saved" : "idle",
        cloudError: null,
        cloudLastSyncedAt: updatedAt,
      })),
      markCloudError: (message, offline = false) => set({
        cloudStatus: offline ? "offline" : "error",
        cloudError: message,
      }),
      markCloudConflict: (message) => set({ cloudStatus: "conflict", cloudError: message }),
      requestCloudReload: () => set((state) => ({
        cloudHydrated: false,
        cloudDirty: false,
        cloudStatus: "loading",
        cloudError: null,
        cloudReloadVersion: state.cloudReloadVersion + 1,
      })),
      retryCloudSync: () => set((state) => state.cloudHydrated && state.cloudDirty
        ? {
            cloudStatus: "idle",
            cloudError: null,
            cloudChangeVersion: state.cloudChangeVersion + 1,
          }
        : {
            cloudHydrated: false,
            cloudStatus: "loading",
            cloudError: null,
            cloudReloadVersion: state.cloudReloadVersion + 1,
          }),
      clearPrivateWorkspace: () => {
        const { lang, theme, cloudReloadVersion, cloudChangeVersion } = get();
        set({
          ...createEmptyHydrationData({ lang, theme }),
          coachMessages: [coachWelcome(lang)],
          resumePast: [],
          resumeFuture: [],
          isDemoMode: false,
          cloudUserId: null,
          cloudHydrated: false,
          cloudDirty: false,
          cloudStatus: "local",
          cloudError: null,
          cloudLastSyncedAt: null,
          cloudReloadVersion: cloudReloadVersion + 1,
          cloudChangeVersion,
        });
      },
      setProfileFullName: (profileFullName) => set((state) => ({
        profileFullName,
        ...cloudMutation(state),
      })),
      careerGoalId: "fullstack",
      setCareerGoalId: (careerGoalId) => set((state) => ({ careerGoalId, ...cloudMutation(state) })),
      lastAnalysisMeta: null,
      setLastAnalysisMeta: (lastAnalysisMeta) => set((state) => ({ lastAnalysisMeta, ...cloudMutation(state) })),
      toggleSaveJob: (id) => {
        const { savedJobIds } = get();
        set((state) => ({
          savedJobIds: savedJobIds.includes(id)
            ? savedJobIds.filter((x) => x !== id)
            : [...savedJobIds, id],
          ...cloudMutation(state),
        }));
      },
      applyToJob: (id) => {
        const { appliedJobIds, savedJobIds, jobStages } = get();
        if (appliedJobIds.includes(id)) return;
        set((state) => ({
          appliedJobIds: [...appliedJobIds, id],
          savedJobIds: savedJobIds.includes(id) ? savedJobIds : [...savedJobIds, id],
          jobStages: { ...jobStages, [id]: "applied" },
          ...cloudMutation(state),
        }));
      },
      updateJobStage: (id, stage) => {
        const { jobStages } = get();
        set((state) => ({
          jobStages: { ...jobStages, [id]: stage },
          ...cloudMutation(state),
        }));
      },
      enrollPath: (id) => {
        const { enrolledPathIds } = get();
        if (enrolledPathIds.includes(id)) return;
        set((state) => ({ enrolledPathIds: [...enrolledPathIds, id], ...cloudMutation(state) }));
      },
      toggleModule: (id) => {
        const { completedModuleIds } = get();
        set((state) => ({
          completedModuleIds: completedModuleIds.includes(id)
            ? completedModuleIds.filter((x) => x !== id)
            : [...completedModuleIds, id],
          ...cloudMutation(state),
        }));
      },
      updateResume: (patch) => {
        const current = get().resume;
        const updated = { ...current, ...patch };
        set((state) => ({
          resume: updated,
          forgeParsedCv: resumeToParsed(updated),
          resumePast: [...get().resumePast, current].slice(-40),
          resumeFuture: [],
          isDemoMode: false,
          ...cloudMutation(state),
        }));
      },
      undoResume: () => {
        const { resumePast, resume, resumeFuture } = get();
        const previous = resumePast.at(-1);
        if (!previous) return;
        set((state) => ({
          resume: previous,
          forgeParsedCv: resumeToParsed(previous),
          resumePast: resumePast.slice(0, -1),
          resumeFuture: [resume, ...resumeFuture].slice(0, 40),
          ...cloudMutation(state),
        }));
      },
      redoResume: () => {
        const { resumePast, resume, resumeFuture } = get();
        const next = resumeFuture[0];
        if (!next) return;
        set((state) => ({
          resume: next,
          forgeParsedCv: resumeToParsed(next),
          resumePast: [...resumePast, resume].slice(-40),
          resumeFuture: resumeFuture.slice(1),
          ...cloudMutation(state),
        }));
      },
      moveResumeSection: (id, direction) => {
        const order = [...get().resumeSectionOrder];
        const index = order.indexOf(id);
        const target = index + direction;
        if (index < 0 || target < 0 || target >= order.length) return;
        [order[index], order[target]] = [order[target], order[index]];
        set((state) => ({ resumeSectionOrder: order, ...cloudMutation(state) }));
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
        set((state) => ({
          resume: updated,
          forgeParsedCv: nextParsed,
          isDemoMode: false,
          ...cloudMutation(state),
        }));
        return toAdd.length;
      },
      setResume: (resume) => set((state) => ({
        resume,
        forgeParsedCv: resumeToParsed(resume),
        resumePast: [...get().resumePast, get().resume].slice(-40),
        resumeFuture: [],
        isDemoMode: false,
        ...cloudMutation(state),
      })),
      resetResume: () => set((state) => ({
        resume: emptyResume(),
        forgeParsedCv: null,
        resumePast: [],
        resumeFuture: [],
        isDemoMode: false,
        ...cloudMutation(state),
      })),
      addCoachMessage: (message) =>
        set((state) => ({
          coachMessages: [
            ...get().coachMessages,
            {
              ...message,
              id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
          ],
          ...cloudMutation(state),
        })),
      clearCoach: () => set((state) => ({
        coachMessages: [coachWelcome(get().lang, true)],
        ...cloudMutation(state),
      })),
      setForgeCvText: (text) => set((state) => ({ forgeCvText: text, ...cloudMutation(state) })),
      setForgeJdText: (text) => set((state) => ({ forgeJdText: text, ...cloudMutation(state) })),
      setForgeParsedCv: (cv) =>
        set((state) => ({
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
          ...cloudMutation(state),
        })),
      setForgeAnalysis: (analysis) => set((state) => ({ forgeAnalysis: analysis, ...cloudMutation(state) })),
      setForgeTone: (tone) => set((state) => ({ forgeTone: tone, ...cloudMutation(state) })),
      pushForgeHistory: (item) =>
        set((state) => ({
          forgeHistory: [
            {
              ...item,
              id: `forge-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              createdAt: new Date().toISOString(),
            },
            ...get().forgeHistory,
          ].slice(0, 30),
          ...cloudMutation(state),
        })),
      clearForgeHistory: () => set((state) => ({ forgeHistory: [], ...cloudMutation(state) })),
      clearForgeCv: () =>
        set((state) => ({
          forgeCvText: "",
          forgeParsedCv: null,
          forgeAnalysis: null,
          resume: emptyResume(),
          resumePast: [],
          resumeFuture: [],
          isDemoMode: false,
          ...cloudMutation(state),
        })),
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
        set((state) => ({
          forgeBackups: [backup, ...forgeBackups].slice(0, 20),
          ...cloudMutation(state),
        }));
        return backup;
      },
      restoreForgeBackup: (id) => {
        const bak = get().forgeBackups.find((b) => b.id === id);
        if (!bak) return false;
        set((state) => ({
          forgeCvText: bak.cvText,
          forgeParsedCv: bak.parsed,
          ...cloudMutation(state),
        }));
        return true;
      },
      deleteForgeBackup: (id) =>
        set((state) => ({
          forgeBackups: get().forgeBackups.filter((b) => b.id !== id),
          ...cloudMutation(state),
        })),
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
        const demoJdText = isTr
          ? "Senior Frontend Engineer\nGereksinimler: TypeScript, Next.js, React, test otomasyonu, CI/CD ve temel sistem tasarımı."
          : "Senior Frontend Engineer\nRequirements: TypeScript, Next.js, React, testing, CI/CD, and system design fundamentals.";
        const demoAnalysis = analyzeMatch(demoParsedCV, demoJdText, lang);

        set({
          isDemoMode: true,
          cloudDirty: false,
          cloudStatus: "demo",
          cloudError: null,
          resume: demoResume,
          resumePast: [],
          resumeFuture: [],
          forgeParsedCv: demoParsedCV,
          forgeCvText: isTr
            ? "Yusuf Demir — Senior Frontend Engineer\nİstanbul | yusuf@demir.dev\n\nÖZET\nNext.js ve TypeScript ile ölçeklenebilir ürün arayüzleri geliştiren frontend mühendisi.\n\nDENEYİM\nSoftBridge — Senior Frontend Developer (2022–Devam Ediyor)\n- 12 bin aylık kullanıcıya hizmet veren analitik paneli geliştirdi\n- Sayfa açılış süresini %35 azalttı\n\nBECERİLER\nJavaScript, React, CSS, Git, REST API, TypeScript, Next.js"
            : "Yusuf Demir — Senior Frontend Engineer\nIstanbul | yusuf@demir.dev\n\nSUMMARY\nFrontend engineer building scalable product interfaces with Next.js and TypeScript.\n\nEXPERIENCE\nSoftBridge — Senior Frontend Developer (2022–Present)\n- Built an analytics workspace serving 12,000 monthly users\n- Reduced page load time by 35%\n\nSKILLS\nJavaScript, React, CSS, Git, REST API, TypeScript, Next.js",
          forgeJdText: demoJdText,
          forgeAnalysis: demoAnalysis,
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
              summary: isTr ? `ATS analizi tamamlandı · ${demoAnalysis.atsScore}/100` : `ATS analysis completed · ${demoAnalysis.atsScore}/100`,
              createdAt: new Date().toISOString(),
              payload: { atsScore: demoAnalysis.atsScore },
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
      exitDemoMode: () => set((state) => ({
        isDemoMode: false,
        cloudHydrated: false,
        cloudDirty: false,
        cloudStatus: "loading",
        cloudError: null,
        cloudReloadVersion: state.cloudReloadVersion + 1,
      })),
    }),
    {
      name: "softbridge-careerforge-ui-v2",
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        savedJobIds: state.savedJobIds,
        appliedJobIds: state.appliedJobIds,
        jobStages: state.jobStages,
        jobApplicationDetails: state.jobApplicationDetails,
        enrolledPathIds: state.enrolledPathIds,
        completedModuleIds: state.completedModuleIds,
        resume: state.resume,
        resumeSectionOrder: state.resumeSectionOrder,
        coachMessages: state.coachMessages,
        forgeCvText: state.forgeCvText,
        forgeJdText: state.forgeJdText,
        forgeParsedCv: state.forgeParsedCv,
        forgeAnalysis: state.forgeAnalysis,
        forgeHistory: state.forgeHistory,
        forgeBackups: state.forgeBackups,
        careerGoalId: state.careerGoalId,
        lastAnalysisMeta: state.lastAnalysisMeta,
      }),
    }
  ))
);
