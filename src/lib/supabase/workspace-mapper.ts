import { z } from "zod";
import type { Locale } from "@/i18n/messages";
import type { CoverLetterTone, CvBackup, ForgeHistoryItem, MatchAnalysis, ParsedCV } from "@/lib/forge/types";
import type { CareerState, ResumeSectionId } from "@/store/useCareerStore";
import type { CoachMessage, ResumeProfile, JobApplicationDetails } from "@/types";
import type {
  CareerWorkspaceInsert,
  CareerWorkspaceRow,
  Json,
  ProfileRow,
  ProfileUpdate,
} from "@/types/database";

export const CURRENT_WORKSPACE_DATA_VERSION = 2;

const resumeExperienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  start: z.string(),
  end: z.string(),
  highlights: z.array(z.string()),
});

const resumeEducationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  year: z.string(),
});

const resumeProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  url: z.string().optional(),
});

const resumeCertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});

const resumeLanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.string(),
});

const resumeAwardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
});

const resumePublicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  date: z.string(),
  url: z.string().optional(),
});

const resumeSocialLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

const resumeCustomizationSchema = z.object({
  template: z.enum(["classic", "modern", "minimal"]).default("classic"),
  fontFamily: z.string().default("sans"),
  primaryColor: z.string().default("brand"),
});

const resumeSchema = z.object({
  fullName: z.string(),
  headline: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(resumeExperienceSchema),
  education: z.array(resumeEducationSchema),
  photoDataUrl: z.string().nullable().optional(),
  website: z.string().optional(),
  projects: z.array(resumeProjectSchema).optional(),
  certifications: z.array(resumeCertificationSchema).optional(),
  languages: z.array(resumeLanguageSchema).optional(),
  awards: z.array(resumeAwardSchema).optional(),
  publications: z.array(resumePublicationSchema).optional(),
  socialLinks: z.array(resumeSocialLinkSchema).optional(),
  customization: resumeCustomizationSchema.optional(),
  sectionVisibility: z.record(z.string(), z.boolean()).optional(),
  customSections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    visible: z.boolean().optional(),
  })).optional(),
});

const parsedExperienceSchema = z.object({
  company: z.string(),
  position: z.string(),
  duration: z.string(),
  description: z.array(z.string()),
});

const parsedEducationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  year: z.string(),
});

const parsedCvSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  location: z.string().nullable(),
  summary: z.string().nullable(),
  experience: z.array(parsedExperienceSchema),
  skills: z.array(z.string()),
  education: z.array(parsedEducationSchema),
  rawLength: z.number().finite().nonnegative(),
  photoDataUrl: z.string().nullable().optional(),
});

const matchAnalysisSchema = z.object({
  matchScore: z.number().finite(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  suggestions: z.array(z.string()),
  atsScore: z.number().finite(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  requiredSkillsCoverage: z.number().finite().optional(),
  preferredSkillsCoverage: z.number().finite().optional(),
  experienceAlignment: z.number().finite().optional(),
  locationCompatibility: z.number().finite().optional(),
  languageCompatibility: z.number().finite().optional(),
  evidenceStrength: z.number().finite().optional(),
  scoreExplanations: z.array(z.string()).optional(),
  scoreConfidence: z.enum(["low", "medium", "high"]).optional(),
  rubricVersion: z.literal("match-v2").optional(),
  missingInputs: z.array(z.string()).optional(),
});

const coachMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  createdAt: z.string(),
});

const forgeHistorySchema = z.object({
  id: z.string(),
  action: z.enum(["parse", "analyze", "optimize", "coverletter", "interview", "chatbot", "ats", "create", "backup", "jobs"]),
  createdAt: z.string(),
  summary: z.string(),
  payload: z.unknown(),
});

const cvBackupSchema = z.object({
  id: z.string(),
  label: z.string(),
  createdAt: z.string(),
  cvText: z.string(),
  parsed: parsedCvSchema.nullable(),
});

const lastAnalysisMetaSchema = z.object({
  at: z.string(),
  fileName: z.string().optional(),
  candidateName: z.string().optional(),
  targetTitle: z.string().optional(),
});

const resumeSectionOrderSchema = z.array(z.enum(["profile", "experience", "skills", "education", "projects", "certifications", "languages", "awards", "publications", "socialLinks"]));
const stringArraySchema = z.array(z.string());
const forgeToneSchema = z.enum(["Profesyonel", "Girişimci", "Teknik"]);

export interface WorkspaceStateSnapshot {
  profileFullName: string;
  profileAvatarPath: string | null;
  lang: Locale;
  theme: "light" | "dark";
  careerGoalId: string | null;
  resume: ResumeProfile;
  resumeSectionOrder: string[];
  coachMessages: CoachMessage[];
  forgeCvText: string;
  forgeJdText: string;
  forgeParsedCv: ParsedCV | null;
  forgeAnalysis: MatchAnalysis | null;
  forgeTone: CoverLetterTone;
  forgeHistory: ForgeHistoryItem[];
  forgeBackups: CvBackup[];
  savedJobIds: string[];
  appliedJobIds: string[];
  jobStages: Record<string, string>;
  jobApplicationDetails: Record<string, JobApplicationDetails>;
  enrolledPathIds: string[];
  completedModuleIds: string[];
  lastAnalysisMeta: CareerState["lastAnalysisMeta"];
}

export type StoreHydrationData = WorkspaceStateSnapshot;

export function createEmptyResume(): ResumeProfile {
  return {
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
    website: "",
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

export function createEmptyHydrationData(
  preferences: { lang: Locale; theme: "light" | "dark" } = { lang: "tr", theme: "light" }
): StoreHydrationData {
  return {
    profileFullName: "",
    profileAvatarPath: null,
    lang: preferences.lang,
    theme: preferences.theme,
    careerGoalId: null,
    resume: createEmptyResume(),
    resumeSectionOrder: ["profile", "experience", "skills", "education", "projects", "certifications", "languages", "awards", "publications", "socialLinks"],
    coachMessages: [],
    forgeCvText: "",
    forgeJdText: "",
    forgeParsedCv: null,
    forgeAnalysis: null,
    forgeTone: "Profesyonel",
    forgeHistory: [],
    forgeBackups: [],
    savedJobIds: [],
    appliedJobIds: [],
    jobStages: {},
    jobApplicationDetails: {},
    enrolledPathIds: [],
    completedModuleIds: [],
    lastAnalysisMeta: null,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseOr<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const result = schema.safeParse(value);
  return result.success ? result.data : fallback;
}

function parseNullable<T>(schema: z.ZodType<T>, value: unknown): T | null {
  const result = schema.safeParse(value);
  return result.success ? result.data : null;
}

function uniqueStrings(value: unknown): string[] {
  return [...new Set(parseOr(stringArraySchema, value, []).map((item) => item.trim()).filter(Boolean))];
}

function normalizeSectionOrder(value: unknown): ResumeSectionId[] {
  const parsed = parseOr(resumeSectionOrderSchema, value, []);
  const valid = [...new Set(parsed)];
  const defaults: ResumeSectionId[] = ["profile", "experience", "skills", "education", "projects", "certifications", "languages", "awards", "publications", "socialLinks"];
  return [...valid, ...defaults.filter((item) => !valid.includes(item))];
}

export function sanitizeResumeForCloud(resume: ResumeProfile): ResumeProfile {
  return { ...resume, photoDataUrl: null };
}

function sanitizeParsedCvForCloud(value: ParsedCV | null): ParsedCV | null {
  return value ? { ...value, photoDataUrl: null } : null;
}

function sanitizeUnknownForCloud(value: unknown): unknown {
  if (typeof value === "string" && value.startsWith("data:image/")) return null;
  if (Array.isArray(value)) return value.map(sanitizeUnknownForCloud);
  if (!isRecord(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "photoDataUrl")
      .map(([key, entry]) => [key, sanitizeUnknownForCloud(entry)])
  );
}

function toJson(value: unknown): Json {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (Array.isArray(value)) return value.map(toJson);
  if (!isRecord(value)) return null;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, toJson(entry)])
  );
}

function normalizeResume(value: unknown): ResumeProfile {
  const parsed = parseOr(resumeSchema, value, createEmptyResume());
  return sanitizeResumeForCloud(parsed);
}

function normalizeParsedCv(value: unknown): ParsedCV | null {
  return sanitizeParsedCvForCloud(parseNullable(parsedCvSchema, value));
}

function normalizeBackups(value: unknown): CvBackup[] {
  return parseOr(z.array(cvBackupSchema), value, []).map((backup) => ({
    ...backup,
    parsed: sanitizeParsedCvForCloud(backup.parsed),
  }));
}

export function createProfileUpdateFromState(
  state: WorkspaceStateSnapshot,
  authenticatedName = ""
): ProfileUpdate {
  return {
    full_name: state.profileFullName.trim() || state.resume.fullName.trim() || authenticatedName.trim() || null,
    avatar_path: state.profileAvatarPath,
    locale: state.lang,
    theme: state.theme,
    career_goal_id: state.careerGoalId,
  };
}

export function createWorkspaceUpsertFromState(
  state: WorkspaceStateSnapshot,
  userId: string
): CareerWorkspaceInsert {
  const backups = state.forgeBackups.map((backup) => ({
    ...backup,
    parsed: sanitizeParsedCvForCloud(backup.parsed),
  }));
  const history = state.forgeHistory.map((item) => ({
    ...item,
    payload: sanitizeUnknownForCloud(item.payload),
  }));

  return {
    user_id: userId,
    resume: toJson(sanitizeResumeForCloud(state.resume)),
    resume_section_order: toJson(state.resumeSectionOrder),
    coach_messages: toJson(state.coachMessages),
    forge_cv_text: state.forgeCvText,
    forge_jd_text: state.forgeJdText,
    forge_parsed_cv: state.forgeParsedCv ? toJson(sanitizeParsedCvForCloud(state.forgeParsedCv)) : null,
    forge_analysis: state.forgeAnalysis ? toJson(state.forgeAnalysis) : null,
    forge_tone: state.forgeTone,
    forge_history: toJson(history),
    forge_backups: toJson(backups),
    saved_job_ids: toJson(uniqueStrings(state.savedJobIds)),
    applied_job_ids: toJson(
      uniqueStrings(state.appliedJobIds).map((id) => {
        const stage = state.jobStages?.[id] || "applied";
        const details = state.jobApplicationDetails?.[id];
        if (details) {
          return `${id}:${stage}:${encodeURIComponent(JSON.stringify(details))}`;
        }
        return `${id}:${stage}`;
      })
    ),
    enrolled_path_ids: toJson(uniqueStrings(state.enrolledPathIds)),
    completed_module_ids: toJson(uniqueStrings(state.completedModuleIds)),
    last_analysis_meta: state.lastAnalysisMeta ? toJson(state.lastAnalysisMeta) : null,
  };
}

function parseAppliedJobs(rawIds: string[]): {
  appliedJobIds: string[];
  jobStages: Record<string, string>;
  jobApplicationDetails: Record<string, JobApplicationDetails>;
} {
  const appliedJobIds: string[] = [];
  const jobStages: Record<string, string> = {};
  const jobApplicationDetails: Record<string, JobApplicationDetails> = {};
  rawIds.forEach((item) => {
    const parts = item.split(":");
    const id = parts[0];
    const stage = parts[1] || "applied";
    appliedJobIds.push(id);
    jobStages[id] = stage;
    if (parts[2]) {
      try {
        jobApplicationDetails[id] = JSON.parse(decodeURIComponent(parts[2]));
      } catch {
        // fallback
      }
    }
  });
  return { appliedJobIds, jobStages, jobApplicationDetails };
}

export function createStoreHydrationData(
  profile: ProfileRow | null,
  workspace: CareerWorkspaceRow | null,
  fallback: { lang: Locale; theme: "light" | "dark" }
): StoreHydrationData {
  const empty = createEmptyHydrationData(fallback);
  if (!workspace) {
    return {
      ...empty,
      profileFullName: profile?.full_name?.trim() || "",
      profileAvatarPath: profile?.avatar_path || null,
      lang: profile?.locale === "en" || profile?.locale === "tr" ? profile.locale : fallback.lang,
      theme: profile?.theme === "dark" || profile?.theme === "light" ? profile.theme : fallback.theme,
      careerGoalId: profile?.career_goal_id || null,
    };
  }

  return {
    profileFullName: profile?.full_name?.trim() || "",
    profileAvatarPath: profile?.avatar_path || null,
    lang: profile?.locale === "en" || profile?.locale === "tr" ? profile.locale : fallback.lang,
    theme: profile?.theme === "dark" || profile?.theme === "light" ? profile.theme : fallback.theme,
    careerGoalId: profile?.career_goal_id || null,
    resume: normalizeResume(workspace.resume),
    resumeSectionOrder: normalizeSectionOrder(workspace.resume_section_order),
    coachMessages: parseOr(z.array(coachMessageSchema), workspace.coach_messages, []),
    forgeCvText: typeof workspace.forge_cv_text === "string" ? workspace.forge_cv_text : "",
    forgeJdText: typeof workspace.forge_jd_text === "string" ? workspace.forge_jd_text : "",
    forgeParsedCv: normalizeParsedCv(workspace.forge_parsed_cv),
    forgeAnalysis: parseNullable(matchAnalysisSchema, workspace.forge_analysis),
    forgeTone: parseOr(forgeToneSchema, workspace.forge_tone, "Profesyonel"),
    forgeHistory: parseOr(z.array(forgeHistorySchema), workspace.forge_history, []),
    forgeBackups: normalizeBackups(workspace.forge_backups),
    savedJobIds: uniqueStrings(workspace.saved_job_ids),
    ...parseAppliedJobs(uniqueStrings(workspace.applied_job_ids)),
    enrolledPathIds: uniqueStrings(workspace.enrolled_path_ids),
    completedModuleIds: uniqueStrings(workspace.completed_module_ids),
    lastAnalysisMeta: parseNullable(lastAnalysisMetaSchema, workspace.last_analysis_meta),
  };
}

export function createLegacyHydrationData(
  value: unknown,
  fallback: { lang: Locale; theme: "light" | "dark" }
): StoreHydrationData | null {
  if (!isRecord(value) || value.isDemoMode === true) return null;
  const empty = createEmptyHydrationData(fallback);

  return {
    profileFullName: typeof value.profileFullName === "string" ? value.profileFullName : "",
    profileAvatarPath: null,
    lang: value.lang === "en" || value.lang === "tr" ? value.lang : fallback.lang,
    theme: value.theme === "dark" || value.theme === "light" ? value.theme : fallback.theme,
    careerGoalId: typeof value.careerGoalId === "string" ? value.careerGoalId : null,
    resume: normalizeResume(value.resume),
    resumeSectionOrder: normalizeSectionOrder(value.resumeSectionOrder),
    coachMessages: parseOr(z.array(coachMessageSchema), value.coachMessages, empty.coachMessages),
    forgeCvText: typeof value.forgeCvText === "string" ? value.forgeCvText : "",
    forgeJdText: typeof value.forgeJdText === "string" ? value.forgeJdText : "",
    forgeParsedCv: normalizeParsedCv(value.forgeParsedCv),
    forgeAnalysis: parseNullable(matchAnalysisSchema, value.forgeAnalysis),
    forgeTone: parseOr(forgeToneSchema, value.forgeTone, "Profesyonel"),
    forgeHistory: parseOr(z.array(forgeHistorySchema), value.forgeHistory, []),
    forgeBackups: normalizeBackups(value.forgeBackups),
    savedJobIds: uniqueStrings(value.savedJobIds),
    ...parseAppliedJobs(uniqueStrings(value.appliedJobIds)),
    enrolledPathIds: uniqueStrings(value.enrolledPathIds),
    completedModuleIds: uniqueStrings(value.completedModuleIds),
    lastAnalysisMeta: parseNullable(lastAnalysisMetaSchema, value.lastAnalysisMeta),
  };
}

export function isWorkspaceEffectivelyEmpty(value: StoreHydrationData | CareerWorkspaceRow | null): boolean {
  if (!value) return true;
  const state = "user_id" in value
    ? createStoreHydrationData(null, value, { lang: "tr", theme: "light" })
    : value;
  const resume = state.resume;
  const hasResume = Boolean(
    resume.fullName.trim() || resume.headline.trim() || resume.email.trim() || resume.summary.trim() ||
    resume.skills.length || resume.experience.length || resume.education.length
  );
  const hasCoachWork = state.coachMessages.some((message) => message.role === "user" || !message.id.startsWith("welcome"));

  return !(
    hasResume || state.forgeCvText.trim() || state.forgeJdText.trim() || state.forgeParsedCv ||
    state.forgeAnalysis || state.forgeHistory.length || state.forgeBackups.length || hasCoachWork ||
    state.savedJobIds.length || state.appliedJobIds.length || state.enrolledPathIds.length ||
    state.completedModuleIds.length || state.lastAnalysisMeta
  );
}

export function hasMeaningfulLegacyData(value: unknown): boolean {
  if (!isRecord(value) || value.isDemoMode === true) return false;
  const normalized = createLegacyHydrationData(value, { lang: "tr", theme: "light" });
  return normalized ? !isWorkspaceEffectivelyEmpty(normalized) : false;
}

export function createWorkspaceFingerprint(state: WorkspaceStateSnapshot): string {
  return JSON.stringify({
    profile: createProfileUpdateFromState(state),
    workspace: createWorkspaceUpsertFromState(state, "current-user"),
    version: CURRENT_WORKSPACE_DATA_VERSION,
  });
}
