export type ForgeAction =
  | "parse"
  | "analyze"
  | "optimize"
  | "coverletter"
  | "interview"
  | "chatbot"
  | "ats"
  | "create"
  | "backup"
  | "jobs";

export type CoverLetterTone = "Profesyonel" | "Girişimci" | "Teknik";

export type ChatbotCategory =
  | "Deneyim Güçlendirme"
  | "Beceri Vurgulama"
  | "Eksik Yön Kapama"
  | "ATS İyileştirme"
  | "Mülakat Hazırlığı"
  | "Kariyer Stratejisi";

export interface ParsedExperience {
  company: string;
  position: string;
  duration: string;
  description: string[];
}

export interface ParsedEducation {
  school: string;
  degree: string;
  year: string;
}

export interface ParsedCV {
  name: string;
  title: string;
  email: string;
  phone: string | null;
  location: string | null;
  summary: string | null;
  experience: ParsedExperience[];
  skills: string[];
  education: ParsedEducation[];
  rawLength: number;
  /** Optional profile photo as data URL (jpeg/png) */
  photoDataUrl?: string | null;
}

export interface CvBackup {
  id: string;
  label: string;
  createdAt: string;
  cvText: string;
  parsed: ParsedCV | null;
}

export interface MatchAnalysis {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  requiredSkillsCoverage?: number;
  preferredSkillsCoverage?: number;
  experienceAlignment?: number;
  locationCompatibility?: number;
  languageCompatibility?: number;
  evidenceStrength?: number;
  scoreExplanations?: string[];
  scoreConfidence?: "low" | "medium" | "high";
  rubricVersion?: "match-v2";
  missingInputs?: string[];
  scoreRange?: { min: number; max: number };
  evaluatedDimensions?: Array<"requiredSkills" | "preferredSkills" | "experience" | "location" | "language" | "evidence">;
}

export interface OptimizedCV {
  optimizedExperience: ParsedExperience[];
  optimizedSkills: string[];
  optimizedSummary: string;
  generalSuggestions: string[];
}

export interface CoverLetterResult {
  coverLetter: string;
  tone: CoverLetterTone;
  keyPoints: string[];
}

export interface InterviewQuestion {
  question: string;
  type: "teknik" | "davranışsal" | "deneyim";
  exampleAnswer: string;
}

export interface InterviewResult {
  questions: InterviewQuestion[];
  tips: string[];
  roleHint: string;
}

export interface ChatbotResult {
  category: ChatbotCategory;
  response: string;
  actionableTips: string[];
  nextStep: string;
  freeChatRedirect?: boolean;
}

export interface AtsResult {
  atsScore: number;
  issues: string[];
  fixes: string[];
  keywordCoverage: number;
  status: "critical" | "needsWork" | "good" | "veryGood" | "strong";
  summary: string;
  confidence?: "low" | "medium" | "high";
  rubricVersion?: "ats-v2";
  missingInputs?: string[];
  scoreRange?: { min: number; max: number };
  breakdown: Array<{
    id: "structure" | "completeness" | "experience" | "keywords" | "impact" | "contact";
    score: number;
    maxScore: number;
  }>;
}

export interface ForgeHistoryItem {
  id: string;
  action: ForgeAction;
  createdAt: string;
  summary: string;
  payload: unknown;
}
