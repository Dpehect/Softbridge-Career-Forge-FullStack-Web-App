import type { ParsedCV, ParsedEducation, ParsedExperience } from "./types";

export function parsedCvToText(cv: ParsedCV): string {
  const lines: string[] = [
    cv.name,
    cv.title,
    [cv.email, cv.phone, cv.location].filter(Boolean).join(" | "),
    "",
  ];
  if (cv.summary) {
    lines.push("Summary", cv.summary, "");
  }
  if (cv.experience.length) {
    lines.push("Experience");
    for (const e of cv.experience) {
      lines.push(`${e.position} @ ${e.company} | ${e.duration}`);
      for (const d of e.description) lines.push(`- ${d}`);
      lines.push("");
    }
  }
  if (cv.skills.length) {
    lines.push("Skills", cv.skills.join(", "), "");
  }
  if (cv.education.length) {
    lines.push("Education");
    for (const ed of cv.education) {
      lines.push(`${ed.school} – ${ed.degree} ${ed.year}`);
    }
  }
  return lines.join("\n").trim();
}

export function emptyCvDraft(): ParsedCV {
  return {
    name: "",
    title: "",
    email: "",
    phone: null,
    location: null,
    summary: null,
    experience: [],
    skills: [],
    education: [],
    rawLength: 0,
  };
}

export function buildCvFromDraft(draft: {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string;
  photoDataUrl?: string | null;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    bullets: string;
  }>;
  education: Array<{ school: string; degree: string; year: string }>;
}): ParsedCV {
  const experience: ParsedExperience[] = draft.experience
    .filter((e) => e.company.trim() || e.position.trim())
    .map((e) => ({
      company: e.company.trim() || "Company",
      position: e.position.trim() || "Role",
      duration: e.duration.trim() || "—",
      description: e.bullets
        .split("\n")
        .map((b) => b.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean),
    }));

  const education: ParsedEducation[] = draft.education
    .filter((e) => e.school.trim())
    .map((e) => ({
      school: e.school.trim(),
      degree: e.degree.trim() || "Degree",
      year: e.year.trim() || "—",
    }));

  const skills = draft.skills
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const cv: ParsedCV = {
    name: draft.name.trim() || "Candidate",
    title: draft.title.trim() || "Professional",
    email: draft.email.trim(),
    phone: draft.phone.trim() || null,
    location: draft.location.trim() || null,
    summary: draft.summary.trim() || null,
    experience,
    skills,
    education,
    rawLength: 0,
    photoDataUrl: draft.photoDataUrl || null,
  };
  cv.rawLength = parsedCvToText(cv).length;
  return cv;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
