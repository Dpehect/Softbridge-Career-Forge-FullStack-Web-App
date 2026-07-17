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
    0;
  const atsScore = Math.max(0, Math.min(100, Math.round(baseAts)));

  const keyword =
    missing[0] ||
    opts.missingFromMatch?.[0] ||
    opts.feedback?.weaknesses?.[0]?.slice(0, 40) ||
    "System Design";

  const progressPct = Math.round(
    (ready.length / Math.max(1, ready.length + missing.length)) * 100
  );

  const painLineTr = `CV'nizde “${keyword}” sinyali net görünmüyor. Bu eksik, hedef rol gereksinimleriyle eşleşmeyi zayıflatabilir; etkisi ancak gerçek bir ilan metniyle karşılaştırıldığında doğrulanabilir.`;
  const painLineEn = `The “${keyword}” signal is not clearly visible in your resume. This may weaken alignment with a target role, but the effect can only be verified against a real job description.`;

  const gainLineTr = "Eksik sinyali yalnızca gerçek deneyiminizle destekleyebiliyorsanız ilgili deneyim maddesine ekleyin; ardından hedef ilanla eşleşmeyi yeniden ölçün.";
  const gainLineEn = "Add the missing signal to an experience bullet only when real evidence supports it, then measure alignment again against the target listing.";

  return {
    atsScore,
    missingKeywords: missing.slice(0, 8),
    readySkills: ready,
    missingSkills: missing,
    progressPct,
    painLineTr,
    painLineEn,
    gainLineTr,
    gainLineEn,
    nextStepsTr: [
      "Eksik anahtar kelimeyi yalnızca doğrulanmış deneyiminiz varsa ilgili CV maddesine ekleyin.",
      "CV Analizi alanında gerçek hedef ilan metnini yapıştırıp eşleşmeyi yeniden ölçün.",
      "Kariyer ve Mülakat Koçu ile deneyiminize dayalı STAR yanıtı çalışın.",
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
