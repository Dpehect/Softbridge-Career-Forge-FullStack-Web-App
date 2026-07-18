import { describe, expect, it } from "vitest";
import type { ParsedCV } from "./types";
import { analyzeMatch } from "./analyze";

const cv: ParsedCV = {
  name: "Ada Lovelace",
  title: "Frontend Engineer",
  email: "ada@example.com",
  phone: "+90 555 000 00 00",
  location: "Istanbul",
  summary: "Frontend engineer working with React and TypeScript. English C1.",
  experience: [{
    company: "Example Co",
    position: "Frontend Engineer",
    duration: "2022 – 2024",
    description: ["Built a React and TypeScript checkout flow that reduced failed payments by 18%."],
  }],
  skills: ["React", "TypeScript", "CSS"],
  education: [],
  rawLength: 950,
};

describe("analyzeMatch", () => {
  it("returns zero with low confidence when the listing has no measurable signals", () => {
    const result = analyzeMatch(cv, "We are looking for a great person to join our team.", "en");
    expect(result.matchScore).toBe(0);
    expect(result.scoreConfidence).toBe("low");
    expect(result.missingInputs?.length).toBeGreaterThan(2);
  });

  it("caps a strong match below a perfect score and exposes its rubric", () => {
    const result = analyzeMatch(
      cv,
      "React and TypeScript are required. 2+ years experience. Remote. English required.",
      "en",
    );
    expect(result.matchScore).toBeGreaterThan(60);
    expect(result.matchScore).toBeLessThanOrEqual(82);
    expect(result.rubricVersion).toBe("match-v2");
  });

  it("does not invent experience alignment when the listing omits a year target", () => {
    const result = analyzeMatch(cv, "React is required for this role.", "en");
    expect(result.experienceAlignment).toBe(0);
    expect(result.missingInputs).toContain("Required years of experience were not specified");
    expect(result.matchScore).toBeLessThanOrEqual(65);
    expect(result.scoreRange?.max).toBeLessThanOrEqual(65);
    expect(result.evaluatedDimensions).not.toContain("experience");
  });

  it("keeps experience unknown when resume dates cannot be verified", () => {
    const result = analyzeMatch(
      {
        ...cv,
        experience: [{ ...cv.experience[0]!, duration: "Present", description: cv.experience[0]!.description }],
      },
      "React is required. 4+ years experience.",
      "en",
    );
    expect(result.experienceAlignment).toBe(0);
    expect(result.evaluatedDimensions).not.toContain("experience");
  });
});
