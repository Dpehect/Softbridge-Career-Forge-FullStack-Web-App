"use client";

import dynamic from "next/dynamic";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustSignals } from "@/components/home/TrustSignals";

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
      <HomeHero />
      <TrustSignals />
      <div className="space-y-4 md:space-y-0">
        <CareerWorkflow />
        <AtsBreakdownDemo />
        <EvidenceTransformation />
        <JobMatchPreview />
        <InterviewCoachPreview />
        <CareerRoadmapPreview />
        <PrivacySection />
      </div>
      <HomeFinalCta />
    </main>
  );
}
