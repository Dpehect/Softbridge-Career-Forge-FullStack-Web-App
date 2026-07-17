export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type Seniority = "Intern" | "Junior" | "Mid" | "Senior" | "Lead" | "Principal";
export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";

export interface Company {
  id: string;
  name: string;
  logo: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  description: string;
  culture: string[];
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  location: string;
  workMode: WorkMode;
  type: JobType;
  seniority: Seniority;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  tags: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  postedAt: string;
  featured?: boolean;
  applicants: number;
  isDemo?: boolean;
  source?: string;
  expirationDate?: string;
  applicationUrl?: string;
}

export interface CareerPath {
  id: string;
  title: string;
  track: string;
  summary: string;
  durationWeeks: number;
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  outcomes: string[];
  skills: string[];
  modules: PathModule[];
  color: string;
}

export interface PathModule {
  id: string;
  title: string;
  durationHours: number;
  topics: string[];
  completed?: boolean;
}

export interface ResumeProfile {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  photoDataUrl?: string | null;
  website?: string;
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  languages?: ResumeLanguage[];
  awards?: ResumeAward[];
  publications?: ResumePublication[];
  socialLinks?: ResumeSocialLink[];
  customization?: ResumeCustomization;
  sectionVisibility?: Record<string, boolean>;
  customSections?: Array<{ id: string; title: string; content: string; visible?: boolean }>;
}

export interface ResumeProject {
  id: string;
  title: string;
  description: string;
  url?: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeLanguage {
  id: string;
  name: string;
  level: string;
}

export interface ResumeAward {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

export interface ResumePublication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url?: string;
}

export interface ResumeSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface ResumeCustomization {
  template: "classic" | "modern" | "minimal";
  fontFamily: string;
  primaryColor: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface CoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface DashboardStats {
  applications: number;
  interviews: number;
  offers: number;
  profileStrength: number;
}

export interface JobApplicationDetails {
  notes?: string;
  contactPerson?: string;
  interviewDate?: string;
  salaryExpectation?: string;
  followUpDate?: string;
  reminder?: boolean;
  resumeVersionId?: string;
  coverLetterUsed?: string;
  applicationUrl?: string;
  timeline?: Array<{ stage: string; updatedAt: string }>;
}
