"use client";

import dynamic from "next/dynamic";

// Eagerly loaded above-the-fold sections
import { HomeHero } from "@/components/home/HomeHero";
import { TrustSignals } from "@/components/home/TrustSignals";

// Dynamically loaded below-the-fold sections for performance
const CareerWorkflow = dynamic(
  () => import("@/components/home/CareerWorkflow").then((m) => m.CareerWorkflow),
  { ssr: false }
);
const AtsBreakdownDemo = dynamic(
  () => import("@/components/home/AtsBreakdownDemo").then((m) => m.AtsBreakdownDemo),
  { ssr: false }
);
const EvidenceTransformation = dynamic(
  () => import("@/components/home/EvidenceTransformation").then((m) => m.EvidenceTransformation),
  { ssr: false }
);
const JobMatchPreview = dynamic(
  () => import("@/components/home/JobMatchPreview"),
  { ssr: false }
);
const InterviewCoachPreview = dynamic(
  () => import("@/components/home/InterviewCoachPreview"),
  { ssr: false }
);
const CareerRoadmapPreview = dynamic(
  () => import("@/components/home/CareerRoadmapPreview").then((m) => m.CareerRoadmapPreview),
  { ssr: false }
);
const PrivacySection = dynamic(
  () => import("@/components/home/PrivacySection").then((m) => m.PrivacySection),
  { ssr: false }
);
const HomeFinalCta = dynamic(
  () => import("@/components/home/HomeFinalCta").then((m) => m.HomeFinalCta),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      {/* 1. Animated Hero */}
      <HomeHero />

      {/* 2. Trust Signals */}
      <TrustSignals />

      {/* 3. Scroll-driven Workflow */}
      <CareerWorkflow />

      {/* 4. ATS Breakdown Demo */}
      <AtsBreakdownDemo />

      {/* 5. Evidence Transformation */}
      <EvidenceTransformation />

      {/* 6. Job Match Preview */}
      <JobMatchPreview />

      {/* 7. Interview Coach Preview */}
      <InterviewCoachPreview />

      {/* 8. Career Roadmap Preview */}
      <CareerRoadmapPreview />

      {/* 9. Privacy */}
      <PrivacySection />

      {/* 10. Final CTA */}
      <HomeFinalCta />
    </main>
  );
}
