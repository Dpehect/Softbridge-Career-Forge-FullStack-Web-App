import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProductSwitcher } from "@/components/landing/ProductSwitcher";
import { ProductShowcases } from "@/components/landing/ProductShowcases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ResumeExamples } from "@/components/landing/ResumeExamples";
import { ScoreMethodology } from "@/components/landing/ScoreMethodology";
import { Pricing } from "@/components/landing/Pricing";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/Footer";

/**
 * SoftBridge CareerForge — product-led editorial landing.
 * Interactive sections are client islands; shell stays simple for performance.
 */
export default function HomePage() {
  return (
    <div className="landing-page min-h-full">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <ProductSwitcher />
        <ProductShowcases />
        <HowItWorks />
        <ResumeExamples />
        <ScoreMethodology />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
