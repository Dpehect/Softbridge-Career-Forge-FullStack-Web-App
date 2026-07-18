import { describe, expect, it } from "vitest";
import type { ParsedCV } from "@/lib/forge/types";
import { calculateAtsScore } from "./atsScore";

const emptyCv: ParsedCV = {
  name: "Candidate",
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

describe("calculateAtsScore", () => {
  it("does not reward an empty or default profile", () => {
    const result = calculateAtsScore(emptyCv);
    expect(result.total).toBeLessThan(15);
    expect(result.confidence).toBe("low");
    expect(result.missingInputs.length).toBeGreaterThan(2);
  });

  it("does not treat an email address or profile photo as a professional URL", () => {
    const result = calculateAtsScore({
      ...emptyCv,
      name: "Ada Lovelace",
      email: "ada@example.com",
      photoDataUrl: "data:image/png;base64,example",
      summary: "Software engineer focused on reliable systems.",
    });
    const contact = result.categories.find((category) => category.id === "contact");
    expect(contact?.evidence.some((item) => /link|bağlant/i.test(item))).toBe(false);
    expect(contact?.missing.some((item) => /link|portfolio/i.test(item))).toBe(true);
  });

  it("does not grant an exceptional score for keyword stuffing without evidence", () => {
    const result = calculateAtsScore({
      ...emptyCv,
      name: "Ada Lovelace",
      title: "Engineer",
      email: "ada@example.com",
      phone: "+90 555 000 00 00",
      location: "Istanbul",
      summary: "React TypeScript Node.js AWS SQL Docker Kubernetes GraphQL",
      skills: ["React", "TypeScript", "Node.js", "AWS", "SQL", "Docker", "Kubernetes", "GraphQL"],
      rawLength: 900,
    });
    expect(result.total).toBeLessThan(60);
    expect(result.status).not.toBe("strong");
  });
});
