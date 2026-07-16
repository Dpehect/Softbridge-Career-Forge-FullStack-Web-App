import type { CareerPath } from "@/types";

export const careerPaths: CareerPath[] = [
  {
    id: "path-frontend",
    title: "Frontend Craft Engineer",
    track: "Engineering",
    summary:
      "Go from solid React foundations to shipping premium, motion-aware product surfaces employers actually want.",
    durationWeeks: 12,
    difficulty: "Intermediate",
    outcomes: [
      "Ship a production-quality portfolio app",
      "Master component architecture and design systems",
      "Interview-ready system design for UI",
    ],
    skills: ["React", "TypeScript", "Next.js", "CSS Architecture", "Accessibility"],
    color: "#E85D3B",
    modules: [
      {
        id: "fe-1",
        title: "TypeScript for product teams",
        durationHours: 8,
        topics: ["Strict mode patterns", "Generics in UI", "API contracts"],
      },
      {
        id: "fe-2",
        title: "Component systems that scale",
        durationHours: 10,
        topics: ["Composition", "CVA patterns", "State boundaries"],
      },
      {
        id: "fe-3",
        title: "Motion and polish",
        durationHours: 8,
        topics: ["Framer Motion", "Perceived performance", "Micro-interactions"],
      },
      {
        id: "fe-4",
        title: "Career forge project",
        durationHours: 16,
        topics: ["Capstone app", "Code review", "Portfolio narrative"],
      },
    ],
  },
  {
    id: "path-pm",
    title: "Product Manager — Platform",
    track: "Product",
    summary:
      "Learn to write crisp specs, run discovery, and drive platform bets with engineering and design partners.",
    durationWeeks: 10,
    difficulty: "Intermediate",
    outcomes: [
      "Ship a PRD and experiment plan",
      "Facilitate discovery interviews",
      "Build a metrics stack for one product surface",
    ],
    skills: ["Discovery", "PRD Writing", "Metrics", "Roadmapping", "Stakeholder Management"],
    color: "#A44932",
    modules: [
      {
        id: "pm-1",
        title: "Problem framing",
        durationHours: 6,
        topics: ["Jobs-to-be-done", "Opportunity scoring", "Scope discipline"],
      },
      {
        id: "pm-2",
        title: "Writing that ships",
        durationHours: 8,
        topics: ["PRDs", "Decision logs", "Async updates"],
      },
      {
        id: "pm-3",
        title: "Experiments and metrics",
        durationHours: 10,
        topics: ["North-star metrics", "A/B design", "Guardrails"],
      },
    ],
  },
  {
    id: "path-design",
    title: "Product Design Systems",
    track: "Design",
    summary:
      "Build visual systems and flows that feel intentional — from tokens to high-fidelity prototypes.",
    durationWeeks: 11,
    difficulty: "Foundational",
    outcomes: [
      "Publish a mini design system",
      "Prototype a multi-step career flow",
      "Present critique-ready case studies",
    ],
    skills: ["Figma", "Design Tokens", "Prototyping", "UX Writing", "Critique"],
    color: "#D94F2E",
    modules: [
      {
        id: "ds-1",
        title: "Foundations and tokens",
        durationHours: 7,
        topics: ["Color systems", "Type scales", "Spacing"],
      },
      {
        id: "ds-2",
        title: "Flows that convert",
        durationHours: 9,
        topics: ["IA", "Empty states", "Error recovery"],
      },
      {
        id: "ds-3",
        title: "Portfolio narrative",
        durationHours: 8,
        topics: ["Case studies", "Outcomes", "Storytelling"],
      },
    ],
  },
  {
    id: "path-data",
    title: "Analytics Engineer",
    track: "Data",
    summary:
      "Model trustworthy metrics, ship dbt projects, and turn messy event streams into decision-ready tables.",
    durationWeeks: 14,
    difficulty: "Advanced",
    outcomes: [
      "Own a metrics layer for a product domain",
      "Ship documented dbt models",
      "Partner with PMs on experiment readout",
    ],
    skills: ["SQL", "dbt", "Warehouse Modeling", "Data Quality", "Storytelling"],
    color: "#7A4633",
    modules: [
      {
        id: "da-1",
        title: "SQL for product questions",
        durationHours: 10,
        topics: ["Window functions", "Cohorts", "Funnels"],
      },
      {
        id: "da-2",
        title: "Modeling with dbt",
        durationHours: 12,
        topics: ["Staging", "Marts", "Tests"],
      },
      {
        id: "da-3",
        title: "Quality and trust",
        durationHours: 8,
        topics: ["Anomaly detection", "SLAs", "Documentation"],
      },
    ],
  },
  {
    id: "path-career-switch",
    title: "Career Switch Accelerator",
    track: "General",
    summary:
      "For professionals pivoting into tech product roles. Map transferable skills, rebuild narrative, and land interviews.",
    durationWeeks: 8,
    difficulty: "Foundational",
    outcomes: [
      "Rewrite resume and LinkedIn narrative",
      "Complete 20 targeted applications",
      "Run mock interviews with feedback loops",
    ],
    skills: ["Positioning", "Resume", "Networking", "Interviewing", "Negotiation"],
    color: "#5C2E1F",
    modules: [
      {
        id: "cs-1",
        title: "Positioning workshop",
        durationHours: 5,
        topics: ["Skill mapping", "Target roles", "Story arcs"],
      },
      {
        id: "cs-2",
        title: "Materials that open doors",
        durationHours: 7,
        topics: ["Resume forge", "Portfolio", "Cold outreach"],
      },
      {
        id: "cs-3",
        title: "Interview loops",
        durationHours: 10,
        topics: ["Behavioral", "Case", "Negotiation"],
      },
    ],
  },
  {
    id: "path-ai-pm",
    title: "AI Product Builder",
    track: "Product · AI",
    summary:
      "Design and ship AI-assisted product features with evaluation, UX patterns, and cost awareness.",
    durationWeeks: 9,
    difficulty: "Advanced",
    outcomes: [
      "Ship a scoped AI feature end-to-end",
      "Define evaluation criteria for quality",
      "Communicate risk and value to stakeholders",
    ],
    skills: ["Prompt Design", "Eval Harnesses", "AI UX", "Cost Modeling", "Safety"],
    color: "#E85D3B",
    modules: [
      {
        id: "ai-1",
        title: "AI interaction patterns",
        durationHours: 6,
        topics: ["Assistive UX", "Latency", "Failure modes"],
      },
      {
        id: "ai-2",
        title: "Evaluation that matters",
        durationHours: 8,
        topics: ["Rubrics", "Human review", "Regression sets"],
      },
      {
        id: "ai-3",
        title: "Ship and measure",
        durationHours: 10,
        topics: ["Instrumentation", "Cost", "Iteration"],
      },
    ],
  },
];

export function getPath(id: string) {
  return careerPaths.find((p) => p.id === id);
}
