/**
 * Offline / design-time fixtures for CareerForge.
 * Flip USE_MOCK_DATA to true when Ollama or network is unavailable.
 * Swap these objects for live API responses when online.
 */

export const USE_MOCK_DATA = false;

export type MockAtsAnalysis = {
  atsScore: number;
  missingKeywords: string[];
  feedback: string;
  analyzedAt: string;
  candidateName: string;
  targetRole: string;
};

export const MOCK_ATS_ANALYSIS: MockAtsAnalysis = {
  atsScore: 72,
  missingKeywords: [
    "TypeScript",
    "Next.js",
    "System Design",
    "CI/CD",
    "Unit Testing",
    "Stakeholder Communication",
  ],
  feedback:
    "Solid foundation with clear role history. Increase keyword density for TypeScript/Next.js, add 3–4 metric-backed bullets, and mirror JD language in the summary.",
  analyzedAt: "2026-07-16T14:30:00.000Z",
  candidateName: "Jane Doe",
  targetRole: "Senior Frontend Engineer",
};

export const MOCK_DASHBOARD_STATS = {
  analyzedCvCount: 3,
  latestAtsScore: 72 as number | null,
  interviewPrepDone: 5,
};

export const MOCK_RECENT_ACTIVITY = [
  {
    id: "mock-1",
    title: "Jane Doe — Frontend CV",
    summary: "ATS 72 · Match analysis vs Senior FE role",
    createdAt: "2026-07-16T14:30:00.000Z",
  },
  {
    id: "mock-2",
    title: "Cover letter draft",
    summary: "Professional tone · SoftBridge listing",
    createdAt: "2026-07-15T11:05:00.000Z",
  },
  {
    id: "mock-3",
    title: "Interview prep set",
    summary: "5 STAR questions generated",
    createdAt: "2026-07-14T09:20:00.000Z",
  },
];

export const MOCK_CV_TEXT = `
Jane Doe — Full Stack Developer
Istanbul | jane@example.com

SUMMARY
Developer with 4 years building web apps in React and Node.js.

EXPERIENCE
SoftBridge — Frontend Developer (2022–Present)
- Built dashboard features used by 12k monthly users
- Reduced page load time by 35% via code-splitting

SKILLS
JavaScript, React, CSS, Git, REST
`.trim();

export const MOCK_JD_TEXT = `
Senior Frontend Engineer
Requirements: TypeScript, Next.js, React, testing, CI/CD, system design basics.
`.trim();
