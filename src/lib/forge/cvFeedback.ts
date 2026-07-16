import type { ParsedCV } from "./types";
import { analyzeAts } from "./analyze";

export interface CvDeepFeedback {
  overallScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  careerAdvice: string[];
  summaryLine: string;
}

function hasMetrics(text: string) {
  return /\d+%|\$\d|\d+\+|x\d|increased|reduced|grew|improved|\d{2,}/i.test(text);
}

export function generateCvFeedback(cv: ParsedCV, rawText = ""): CvDeepFeedback {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const improvements: string[] = [];
  const careerAdvice: string[] = [];

  const allBullets = cv.experience.flatMap((e) => e.description);
  const metricBullets = allBullets.filter(hasMetrics);
  const ats = analyzeAts(cv, rawText || cv.skills.join(" "));

  // —— Strengths ——
  if (cv.name && cv.name !== "Candidate" && cv.name !== "Aday") {
    strengths.push(`Clear candidate identity (“${cv.name}”) — recruiters can attribute the file quickly.`);
  }
  if (cv.title && cv.title.length > 3) {
    strengths.push(`Professional headline is present (“${cv.title}”), which helps both humans and ATS keyword matching.`);
  }
  if (cv.email) {
    strengths.push("Contact email is available — a basic but critical hire-path requirement.");
  }
  if (cv.skills.length >= 6) {
    strengths.push(`Solid skill surface area (${cv.skills.length} skills listed): ${cv.skills.slice(0, 6).join(", ")}${cv.skills.length > 6 ? "…" : ""}.`);
  } else if (cv.skills.length >= 3) {
    strengths.push(`Core skills are listed (${cv.skills.join(", ")}).`);
  }
  if (cv.experience.length >= 2) {
    strengths.push(`Multiple experience blocks (${cv.experience.length}) give a career narrative beyond a single role.`);
  } else if (cv.experience.length === 1) {
    strengths.push("At least one experience block is structured — a foundation you can expand with stronger outcomes.");
  }
  if (metricBullets.length >= 2) {
    strengths.push(`${metricBullets.length} achievement lines already use numbers or measurable language — keep leaning into that.`);
  }
  if (cv.summary && cv.summary.length > 80) {
    strengths.push("Summary/profile text exists and can frame your positioning before the experience list.");
  }
  if (cv.education.length > 0) {
    strengths.push("Education is present for screening filters that still check degree/school fields.");
  }
  if (cv.photoDataUrl) {
    strengths.push("Profile photo is attached for export-facing versions of the CV (keep ATS plain-text versions photo-free when needed).");
  }
  if (!strengths.length) {
    strengths.push("You have a starting CV shell — structure is enough to improve quickly with focused edits.");
  }

  // —— Weaknesses ——
  if (!cv.email) {
    weaknesses.push("No email detected — many ATS systems and recruiters will bounce incomplete contact blocks.");
  }
  if (!cv.phone) {
    weaknesses.push("Phone number missing — optional in some markets, but still useful for high-intent roles.");
  }
  if (!cv.location) {
    weaknesses.push("Location not stated — hybrid/on-site filters may skip you without city/region or “Remote”.");
  }
  if (!cv.summary || cv.summary.length < 60) {
    weaknesses.push("Summary is thin or missing — you lose a high-attention slot to state target role + proof + direction.");
  }
  if (cv.skills.length < 5) {
    weaknesses.push("Skill list is short for technical hiring screens — aim for 8–14 real, role-relevant skills.");
  }
  if (cv.experience.length === 0) {
    weaknesses.push("No experience blocks detected — even projects/internships should appear as structured roles.");
  }
  if (allBullets.length > 0 && metricBullets.length === 0) {
    weaknesses.push("Experience lines lack measurable outcomes (%, time saved, users, revenue, reliability).");
  }
  if (allBullets.some((b) => b.length > 200)) {
    weaknesses.push("Some bullets are very long — ATS and recruiters prefer scannable 1–2 line outcomes.");
  }
  if (allBullets.some((b) => /responsible for|helped with|worked on/i.test(b))) {
    weaknesses.push("Passive duty language (“responsible for / helped with”) weakens impact versus ownership verbs.");
  }
  if (cv.experience.some((e) => e.description.length < 2)) {
    weaknesses.push("One or more roles have too few bullets — thin roles look unfinished in senior screens.");
  }
  if (!cv.education.length) {
    weaknesses.push("Education section empty — add school/degree/year if relevant, or a certifications block.");
  }
  if (ats.atsScore < 60) {
    weaknesses.push(`ATS structural score is modest (%${ats.atsScore}) — formatting and keyword coverage need attention.`);
  }

  // —— Improvements (specific) ——
  improvements.push(
    "Rewrite each bullet as: strong verb + what you built/owned + tool/stack + business or product result."
  );
  improvements.push(
    "Add 1–2 metrics per recent role (latency, conversion, adoption, revenue, tickets, team size, release cadence)."
  );
  if (cv.title) {
    improvements.push(
      `Mirror the language of 3 target job ads for “${cv.title}” in your top skills line and first two bullets.`
    );
  } else {
    improvements.push("Choose one target title and put it in the headline — avoid generic “Professional” positioning.");
  }
  improvements.push(
    "Keep a plain single-column layout for ATS applications; use the photo PDF export only for human-forward channels."
  );
  if (cv.skills.length) {
    improvements.push(
      `Group skills into Core vs Tools (example Core: ${cv.skills.slice(0, 3).join(", ") || "…"}).`
    );
  } else {
    improvements.push("Build a skills section from real work evidence — only list skills you can defend in an interview.");
  }
  improvements.push(
    "Open the summary with: who you are + years/domain + signature outcome + what you’re targeting next."
  );
  if (allBullets.length) {
    improvements.push(
      `Upgrade your weakest bullet first — pick one line under ${cv.experience[0]?.company || "your latest role"} and make it metric-led this week.`
    );
  }
  improvements.push(...ats.fixes.slice(0, 3));

  // —— Career advice ——
  careerAdvice.push(
    "Run a weekly loop: 8–12 high-fit applications, 2 outreach messages, 1 mock interview — consistency beats volume spikes."
  );
  careerAdvice.push(
    "Keep a living “proof library”: 5 STAR stories (success, conflict, failure, leadership, hard technical decision) mapped to your bullets."
  );
  if (cv.skills.some((s) => /react|next|frontend|ui/i.test(s)) || /frontend|react/i.test(cv.title)) {
    careerAdvice.push(
      "For frontend tracks, pair your CV with one public repo or live URL that proves taste + performance awareness."
    );
  } else if (cv.skills.some((s) => /python|java|go|backend|node/i.test(s)) || /backend|engineer/i.test(cv.title)) {
    careerAdvice.push(
      "For backend tracks, highlight reliability: scale numbers, incident ownership, or API/design trade-offs in bullets."
    );
  } else {
    careerAdvice.push(
      "Publish one proof artifact aligned to your target role (case study, dashboard, design write-up, or architecture note)."
    );
  }
  careerAdvice.push(
    "After every rejection or silence, adjust one thing only (headline, top bullets, or target list) — controlled iteration compounds."
  );
  careerAdvice.push(
    "Use CareerForge Match with a real job ad next: close the top 3 skill gaps with either a project or honest repositioning."
  );

  // scores
  let overall = 42;
  overall += Math.min(18, cv.skills.length * 2);
  overall += Math.min(16, cv.experience.length * 6);
  overall += Math.min(12, metricBullets.length * 4);
  if (cv.summary && cv.summary.length > 80) overall += 8;
  if (cv.email) overall += 5;
  if (cv.education.length) overall += 4;
  if (cv.location) overall += 3;
  overall = Math.max(28, Math.min(94, overall));

  const summaryLine =
    overall >= 75
      ? "Solid professional base — tighten metrics and keyword alignment to compete for stronger roles."
      : overall >= 55
        ? "Promising foundation — focused rewrites on summary and bullets will move this into interview-ready range."
        : "Early-stage CV structure — prioritize contact completeness, 3 strong bullets, and a clear target title first.";

  return {
    overallScore: overall,
    atsScore: ats.atsScore,
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    improvements: improvements.slice(0, 10),
    careerAdvice: careerAdvice.slice(0, 6),
    summaryLine,
  };
}
