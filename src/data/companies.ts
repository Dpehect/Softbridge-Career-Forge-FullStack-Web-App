import type { Company } from "@/types";

export const companies: Company[] = [
  {
    id: "softbridge",
    name: "Softbridge Solutions",
    logo: "SB",
    industry: "Software & Platforms",
    size: "120–200",
    location: "Lisbon · Remote-first",
    website: "https://www.softbridgesolutions.com",
    description:
      "Softbridge builds premium digital landmarks — domains, websites, and career infrastructure that help people and brands move faster.",
    culture: ["Craft over haste", "Async-first", "Ship weekly", "Human-centered AI"],
  },
  {
    id: "northlane",
    name: "Northlane Labs",
    logo: "NL",
    industry: "AI Infrastructure",
    size: "50–100",
    location: "Berlin · Hybrid",
    website: "https://example.com",
    description:
      "Northlane builds evaluation and routing layers for multi-model AI products used by European fintechs.",
    culture: ["Deep work blocks", "Open research", "Customer empathy"],
  },
  {
    id: "harbor",
    name: "Harbor Commerce",
    logo: "HC",
    industry: "E-commerce",
    size: "200–500",
    location: "Austin · Hybrid",
    website: "https://example.com",
    description:
      "Harbor helps independent brands run checkout, logistics, and growth from one operator console.",
    culture: ["Operator mindset", "Metrics literacy", "Kind urgency"],
  },
  {
    id: "lumen",
    name: "Lumen Health",
    logo: "LH",
    industry: "Healthtech",
    size: "80–150",
    location: "Toronto · Remote",
    website: "https://example.com",
    description:
      "Lumen connects clinicians and patients with care pathways that feel simple, private, and fast.",
    culture: ["Privacy by default", "Clinical rigor", "Inclusive design"],
  },
  {
    id: "orbitpay",
    name: "OrbitPay",
    logo: "OP",
    industry: "Fintech",
    size: "150–300",
    location: "London · Hybrid",
    website: "https://example.com",
    description:
      "OrbitPay modernizes payouts and treasury for marketplaces across EMEA.",
    culture: ["Security first", "Clear writing", "Cross-team rotation"],
  },
  {
    id: "fieldwork",
    name: "Fieldwork Studio",
    logo: "FW",
    industry: "Design & Brand",
    size: "20–40",
    location: "New York · On-site",
    website: "https://example.com",
    description:
      "Fieldwork is a product design studio known for systems that scale without losing soul.",
    culture: ["Critique culture", "Portfolio pride", "Tight teams"],
  },
];

export function getCompany(id: string) {
  return companies.find((c) => c.id === id);
}
