import type { ParsedCV } from "./types";
import { jobs as localJobs } from "@/data/jobs";
import { getCompany } from "@/data/companies";

export interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  reason: string;
  source: "CareerForge" | "RemoteOK" | "Web search";
  url: string;
  tags: string[];
}

function skillOverlap(cvSkills: string[], tags: string[]) {
  const cv = cvSkills.map((s) => s.toLowerCase());
  const hit = tags.filter((t) => cv.some((c) => c.includes(t.toLowerCase()) || t.toLowerCase().includes(c)));
  return { hit, ratio: tags.length ? hit.length / tags.length : 0 };
}

export function buildWebSearchLinks(cv: ParsedCV) {
  const q = encodeURIComponent([cv.title, ...cv.skills.slice(0, 3)].filter(Boolean).join(" "));
  const loc = encodeURIComponent(cv.location || "Remote");
  return [
    {
      id: "web-linkedin",
      title: `${cv.title || "Jobs"} on LinkedIn`,
      company: "LinkedIn Jobs",
      location: cv.location || "Worldwide",
      matchScore: 70,
      reason: "Search on LinkedIn using your title and top skills.",
      source: "Web search" as const,
      url: `https://www.linkedin.com/jobs/search/?keywords=${q}&location=${loc}`,
      tags: cv.skills.slice(0, 4),
    },
    {
      id: "web-indeed",
      title: `${cv.title || "Jobs"} on Indeed`,
      company: "Indeed",
      location: cv.location || "Worldwide",
      matchScore: 68,
      reason: "Open Indeed with a query built from your CV.",
      source: "Web search" as const,
      url: `https://www.indeed.com/jobs?q=${q}&l=${loc}`,
      tags: cv.skills.slice(0, 4),
    },
    {
      id: "web-remoteok",
      title: "Remote roles matching your stack",
      company: "RemoteOK",
      location: "Remote",
      matchScore: 66,
      reason: "Browse remote postings filtered by your keywords.",
      source: "Web search" as const,
      url: `https://remoteok.com/remote-${encodeURIComponent((cv.skills[0] || "dev").toLowerCase())}-jobs`,
      tags: cv.skills.slice(0, 4),
    },
  ];
}

export function recommendLocalJobs(cv: ParsedCV): JobRecommendation[] {
  const scored = localJobs.map((job) => {
    const company = getCompany(job.companyId);
    const { hit, ratio } = skillOverlap(cv.skills, job.tags);
    const titleHit =
      cv.title && job.title.toLowerCase().includes(cv.title.toLowerCase().split(" ")[0] || "")
        ? 0.15
        : 0;
    const score = Math.round(Math.min(96, (ratio * 70 + titleHit * 100 + (job.featured ? 8 : 0))));
    return {
      id: `local-${job.id}`,
      title: job.title,
      company: company?.name || "Company",
      location: job.location,
      matchScore: score,
      reason:
        hit.length > 0
          ? `Matches your skills: ${hit.slice(0, 4).join(", ")}`
          : "Related role on CareerForge board.",
      source: "CareerForge" as const,
      url: `/jobs/${job.id}`,
      tags: job.tags,
    };
  });
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
}

/** Live RemoteOK list (public API). Falls back silently on network failure. */
export async function fetchRemoteOkJobs(cv: ParsedCV): Promise<JobRecommendation[]> {
  try {
    const res = await fetch("https://remoteok.com/api", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const posts = data.filter((row) => row && typeof row === "object" && row.id && row.position);
    const cvSkills = cv.skills.map((s) => s.toLowerCase());
    const titleBits = (cv.title || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    const scored: JobRecommendation[] = [];
    for (const p of posts.slice(0, 80)) {
      const title = String(p.position || "");
      const company = String(p.company || "Remote company");
      const tags = Array.isArray(p.tags) ? p.tags.map(String) : [];
      const blob = `${title} ${tags.join(" ")} ${String(p.description || "")}`.toLowerCase();
      let score = 20;
      const hit: string[] = [];
      for (const s of cvSkills) {
        if (blob.includes(s.toLowerCase())) {
          score += 12;
          hit.push(s);
        }
      }
      for (const t of titleBits) {
        if (title.toLowerCase().includes(t)) score += 8;
      }
      if (score < 32) continue;
      const slug = p.slug ? String(p.slug) : "";
      const id = String(p.id);
      scored.push({
        id: `remoteok-${id}`,
        title,
        company,
        location: "Remote",
        matchScore: Math.min(95, score),
        reason: hit.length ? `Skills fit: ${hit.slice(0, 4).join(", ")}` : "Remote role related to your profile.",
        source: "RemoteOK",
        url: slug ? `https://remoteok.com/remote-jobs/${slug}` : `https://remoteok.com/l/${id}`,
        tags: tags.slice(0, 6),
      });
    }
    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
  } catch {
    return [];
  }
}

export async function getJobRecommendations(cv: ParsedCV): Promise<{
  items: JobRecommendation[];
  note: string;
}> {
  const local = recommendLocalJobs(cv);
  const web = buildWebSearchLinks(cv);
  const remote = await fetchRemoteOkJobs(cv);
  const items = [...remote, ...local, ...web]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 14);
  const note = remote.length
    ? "Includes live remote listings plus CareerForge roles and job-board searches."
    : "Live remote feed was unavailable — showing CareerForge matches and web job searches.";
  return { items, note };
}
