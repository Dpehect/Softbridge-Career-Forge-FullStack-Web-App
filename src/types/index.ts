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
  location: string;
  summary: string;
  skills: string[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
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
