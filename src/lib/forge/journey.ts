import type { ParsedCV } from "./types";
import type { CvDeepFeedback } from "./cvFeedback";

export type CareerGoalId =
  | "fullstack"
  | "frontend"
  | "backend"
  | "data"
  | "product"
  | "devops";

export type CareerGoal = {
  id: CareerGoalId;
  labelTr: string;
  labelEn: string;
  requiredSkills: string[];
};

export const CAREER_GOALS: CareerGoal[] = [
  {
    id: "fullstack",
    labelTr: "Full Stack Developer",
    labelEn: "Full Stack Developer",
    requiredSkills: ["React", "Node.js", "TypeScript", "Next.js", "System Design", "SQL"],
  },
  {
    id: "frontend",
    labelTr: "Frontend Engineer",
    labelEn: "Frontend Engineer",
    requiredSkills: ["React", "TypeScript", "Next.js", "CSS", "Testing", "Accessibility"],
  },
  {
    id: "backend",
    labelTr: "Backend Engineer",
    labelEn: "Backend Engineer",
    requiredSkills: ["Node.js", "API Design", "SQL", "System Design", "Docker", "Testing"],
  },
  {
    id: "data",
    labelTr: "Data Analyst",
    labelEn: "Data Analyst",
    requiredSkills: ["SQL", "Python", "Excel", "Tableau", "Statistics", "Communication"],
  },
  {
    id: "product",
    labelTr: "Product Manager",
    labelEn: "Product Manager",
    requiredSkills: ["Roadmapping", "Stakeholder Management", "Analytics", "User Research", "Prioritization"],
  },
  {
    id: "devops",
    labelTr: "DevOps / Cloud",
    labelEn: "DevOps / Cloud",
    requiredSkills: ["CI/CD", "Docker", "Kubernetes", "AWS", "Linux", "Observability"],
  },
];

export function getGoal(id: string | null | undefined): CareerGoal | null {
  if (!id) return null;
  return CAREER_GOALS.find((g) => g.id === id) ?? null;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

export function matchSkills(cvSkills: string[], required: string[]) {
  const bag = cvSkills.map(normalize);
  const ready: string[] = [];
  const missing: string[] = [];

  for (const req of required) {
    const n = normalize(req);
    const hit = bag.some(
      (s) => s.includes(n) || n.includes(s) || (n.length > 3 && s.includes(n.slice(0, 4)))
    );
    if (hit) ready.push(req);
    else missing.push(req);
  }

  return { ready, missing };
}

export type JourneyInsight = {
  atsScore: number;
  rejectionRiskPct: number;
  jobsNow: number;
  jobsAfter: number;
  missingKeywords: string[];
  readySkills: string[];
  missingSkills: string[];
  progressPct: number;
  painLineTr: string;
  painLineEn: string;
  gainLineTr: string;
  gainLineEn: string;
  nextStepsTr: string[];
  nextStepsEn: string[];
  coachHookTr: string;
  coachHookEn: string;
};

/**
 * Solution-center narrative from CV + optional goal + feedback/ATS.
 */
export function buildJourneyInsight(opts: {
  cv: ParsedCV | null;
  goalId?: string | null;
  atsScore?: number | null;
  feedback?: CvDeepFeedback | null;
  missingFromMatch?: string[];
}): JourneyInsight {
  const goal = getGoal(opts.goalId);
  const skills = opts.cv?.skills ?? [];
  const { ready, missing } = matchSkills(
    skills,
    goal?.requiredSkills ?? ["TypeScript", "System Design", "CI/CD", "Testing", "Communication"]
  );

  const baseAts =
    opts.atsScore ??
    opts.feedback?.atsScore ??
    (skills.length >= 8 ? 68 : skills.length >= 4 ? 55 : 42);

  const gapPenalty = Math.min(35, missing.length * 8);
  const atsScore = Math.max(18, Math.min(98, Math.round(baseAts - gapPenalty * 0.15)));

  const rejectionRiskPct = Math.min(85, Math.max(25, 100 - atsScore + missing.length * 4));
  const jobsNow = Math.max(3, Math.round(5 + (atsScore / 100) * 8 - missing.length));
  const jobsAfter = Math.min(40, jobsNow + 12 + missing.length * 2);

  const keyword =
    missing[0] ||
    opts.missingFromMatch?.[0] ||
    opts.feedback?.weaknesses?.[0]?.slice(0, 40) ||
    "System Design";

  const progressPct = Math.round(
    (ready.length / Math.max(1, ready.length + missing.length)) * 100
  );

  const painLineTr = `CV'nizde “${keyword}” net görünmüyor. Bu yüzden Amazon ve Google gibi firmaların ATS sistemleri tarafından yaklaşık %${rejectionRiskPct} oranında elenebilirsiniz.`;
  const painLineEn = `“${keyword}” is weak or missing on your CV. ATS systems at firms like Amazon and Google may auto-filter you roughly ${rejectionRiskPct}% of the time.`;

  const gainLineTr = `Bu CV ile yaklaşık ${jobsNow} ilana güçlü başvurabilirsiniz. Özgeçmiş Düzenleyici ile puanınızı %80+ bandına taşırsanız bu sayı ~${jobsAfter} ilana çıkabilir.`;
  const gainLineEn = `With this CV you can competitively apply to about ${jobsNow} roles. Raise your score toward 80%+ in the Resume Builder and that expands to ~${jobsAfter} roles.`;

  return {
    atsScore,
    rejectionRiskPct,
    jobsNow,
    jobsAfter,
    missingKeywords: missing.slice(0, 8),
    readySkills: ready,
    missingSkills: missing,
    progressPct,
    painLineTr,
    painLineEn,
    gainLineTr,
    gainLineEn,
    nextStepsTr: [
      "Özgeçmiş Düzenleyici’de eksik anahtar kelimeleri deneyim maddelerine gömün.",
      "Forge’da hedef ilan metnini yapıştırıp eşleşme skorunu yeniden ölçün.",
      "AI Koç ile STAR cevap şablonları çalışın — mülakatta canınız yanmasın.",
    ],
    nextStepsEn: [
      "Embed missing keywords into experience bullets in Resume Builder.",
      "Paste a target JD in Forge and re-check your match score.",
      "Practice STAR answers with AI Coach so interviews don’t surprise you.",
    ],
    coachHookTr: `Bu CV ile bir mülakata girsen en zorlanacağın soru şuna yakın olabilir: “Neden önceki projenizde X’i seçtiniz / ne ters gitti?” İşte STAR metoduna uygun 3 cevap iskeleti hazırladım — Koç’ta detaylandıralım.`,
    coachHookEn: `If you interviewed with this CV today, a hard question might be: “Why did a past project fail or change direction?” I have 3 STAR answer skeletons ready — open Coach to refine them.`,
  };
}
