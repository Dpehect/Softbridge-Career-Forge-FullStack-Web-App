import type { ParsedCV, ParsedEducation, ParsedExperience } from "./types";

const SKILL_LEXICON = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "nextjs",
  "node",
  "node.js",
  "python",
  "java",
  "go",
  "golang",
  "rust",
  "c#",
  "c++",
  "sql",
  "postgresql",
  "mongodb",
  "redis",
  "docker",
  "kubernetes",
  "aws",
  "gcp",
  "azure",
  "graphql",
  "rest",
  "tailwind",
  "css",
  "html",
  "git",
  "ci/cd",
  "figma",
  "vue",
  "angular",
  "django",
  "fastapi",
  "spring",
  "kafka",
  "terraform",
  "linux",
  "agile",
  "scrum",
  "jest",
  "cypress",
  "playwright",
  "redux",
  "zustand",
  "prisma",
  "supabase",
  "firebase",
  "llm",
  "ai",
  "machine learning",
  "data analysis",
  "product management",
  "ux",
  "ui",
];

function normalize(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/%PDF[\s\S]{0,200}/g, " ")
    .trim();
}

/** Reject raw PDF dumps before structuring. */
export function assertCleanCvText(text: string) {
  const t = text.trim();
  if (!t) throw new Error("EMPTY_CV");
  if (/%PDF-?\d/.test(t.slice(0, 200))) throw new Error("RAW_PDF");
  if (/\/FlateDecode|endstream|startxref/.test(t.slice(0, 3000))) {
    const letters = (t.slice(0, 1500).match(/\p{L}/gu) ?? []).length;
    if (letters < 80) throw new Error("RAW_PDF");
  }
}

function extractEmail(text: string) {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0] ?? "";
}

function extractPhone(text: string) {
  const m = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?)?\d{3}[\s-]?\d{2,4}[\s-]?\d{2,4}/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  return digits.length >= 10 ? m[0].trim() : null;
}

function extractSkills(text: string) {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  for (const skill of SKILL_LEXICON) {
    if (lower.includes(skill)) {
      const pretty =
        skill === "nextjs"
          ? "Next.js"
          : skill === "node.js" || skill === "node"
            ? "Node.js"
            : skill === "javascript"
              ? "JavaScript"
              : skill === "typescript"
                ? "TypeScript"
                : skill.charAt(0).toUpperCase() + skill.slice(1);
      found.add(pretty);
    }
  }
  // skill line patterns
  const skillLine = text.match(/(?:skills?|beceriler|yetenekler)\s*[:：]\s*(.+)/i);
  if (skillLine) {
    skillLine[1]
      .split(/[,|/·•]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 40)
      .forEach((s) => found.add(s));
  }
  return Array.from(found);
}

function extractExperience(text: string): ParsedExperience[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const experiences: ParsedExperience[] = [];
  const dateRe =
    /((?:19|20)\d{2}|\w+\s+(?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|Present|Günümüz|Halen|Now)/i;

  let current: ParsedExperience | null = null;

  for (const line of lines) {
    const dateMatch = line.match(dateRe);
    if (dateMatch) {
      if (current) experiences.push(current);
      // try "Position @ Company | dates" or "Position - Company dates"
      const cleaned = line.replace(dateRe, "").replace(/[|·•]/g, " ").trim();
      const parts = cleaned.split(/\s+[@at–-]\s+|\s{2,}/).filter(Boolean);
      current = {
        position: parts[0] || "Pozisyon",
        company: parts[1] || parts[0] || "Şirket",
        duration: `${dateMatch[1]} – ${dateMatch[2]}`,
        description: [],
      };
      continue;
    }

    if (/^(deneyim|experience|iş deneyimi)/i.test(line)) continue;

    if (current && (/^[-•*·]/.test(line) || line.length > 40)) {
      current.description.push(line.replace(/^[-•*·]\s*/, ""));
    } else if (!current && /mühendis|engineer|developer|tasarımcı|designer|manager|analist/i.test(line)) {
      // title-like line without dates — skip into summary later
    }
  }
  if (current) experiences.push(current);

  // fallback: if nothing found, create one block from bullet lines
  if (experiences.length === 0) {
    const bullets = lines.filter((l) => /^[-•*·]/.test(l)).map((l) => l.replace(/^[-•*·]\s*/, ""));
    if (bullets.length) {
      experiences.push({
        company: "Belirtilmedi",
        position: "Deneyim",
        duration: "—",
        description: bullets.slice(0, 8),
      });
    }
  }

  return experiences.slice(0, 8);
}

function extractEducation(text: string): ParsedEducation[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const edu: ParsedEducation[] = [];
  for (const line of lines) {
    if (/(üniversite|university|institute|okul|bachelor|master|lisans|yüksek lisans|bsc|msc|ba|bs)/i.test(line)) {
      const year = line.match(/(19|20)\d{2}/)?.[0] ?? "—";
      edu.push({
        school: line.replace(/(19|20)\d{2}/g, "").replace(/[-–|,]/g, " ").trim() || line,
        degree: /(yüksek lisans|master|msc)/i.test(line)
          ? "Yüksek Lisans"
          : /(lisans|bachelor|bsc|bs|ba)/i.test(line)
            ? "Lisans"
            : "Eğitim",
        year,
      });
    }
  }
  return edu.slice(0, 4);
}

function extractName(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines.find(
    (l) =>
      l &&
      !l.includes("@") &&
      l.length < 60 &&
      !/%PDF|endobj|\/Type|Font/i.test(l) &&
      /^[\p{L}\s.'-]+$/u.test(l.replace(/\d/g, "").trim() || "x")
  );
  if (!first) return "Candidate";
  if (/^(cv|özgeçmiş|resume|curriculum)/i.test(first)) {
    const second = lines.find(
      (l, i) =>
        i > 0 &&
        l &&
        !l.includes("@") &&
        l.length < 60 &&
        !/%PDF|endobj/i.test(l)
    );
    return (second || "Candidate").replace(/[^\p{L}\s.'-]/gu, "").trim() || "Candidate";
  }
  return first.replace(/[^\p{L}\s.'-]/gu, "").trim() || "Candidate";
}

function extractTitle(text: string, skills: string[]) {
  const m = text.match(
    /(Senior|Mid|Junior|Lead|Staff|Principal)?\s*(Frontend|Backend|Full[- ]?Stack|Software|Yazılım|Product|Data|DevOps|Mobile)?\s*(Engineer|Developer|Mühendisi|Mühendis|Designer|Manager|Analist)?/i
  );
  if (m && m[0].trim().length > 3) return m[0].trim();
  if (skills.includes("React") || skills.includes("Next.js")) return "Frontend Developer";
  if (skills.includes("Python") || skills.includes("SQL")) return "Software Engineer";
  return "Yazılım Profesyoneli";
}

function extractSummary(text: string) {
  const block = text.match(/(?:summary|özet|profil|about)\s*[:：]?\s*([\s\S]{40,400})/i);
  if (block) {
    return block[1].split("\n").slice(0, 4).join(" ").trim();
  }
  const paras = text.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 80);
  return paras[0]?.slice(0, 320) ?? null;
}

function extractLocation(text: string) {
  const m = text.match(
    /(İstanbul|Istanbul|Ankara|İzmir|Izmir|Bursa|Antalya|Remote|Hibrit|Hybrid|Lisbon|Berlin|London|New York|Toronto)/i
  );
  return m?.[0] ?? null;
}

export function parseCV(raw: string): ParsedCV {
  assertCleanCvText(raw);
  const text = normalize(raw);
  assertCleanCvText(text);
  const skills = extractSkills(text);
  return {
    name: extractName(text),
    title: extractTitle(text, skills),
    email: extractEmail(text),
    phone: extractPhone(text),
    location: extractLocation(text),
    summary: extractSummary(text),
    experience: extractExperience(text),
    skills,
    education: extractEducation(text),
    rawLength: text.length,
  };
}

export { SKILL_LEXICON };
