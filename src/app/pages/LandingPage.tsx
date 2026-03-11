import { useEffect } from "react";
import { useLocation } from "react-router";
import { CinematicBackground } from "../components/CinematicBackground";
import { AppNavbar } from "../components/AppNavbar";
import { LandingHero } from "../components/landing/LandingHero";
import { SocialProofBar } from "../components/landing/SocialProofBar";
import { Phase1Features } from "../components/landing/Phase1Features";
import { Phase2Differentiators } from "../components/landing/Phase2Differentiators";
import { CompetitiveEdge } from "../components/landing/CompetitiveEdge";
import { HowItWorks } from "../components/landing/HowItWorks";
import { RetentionAI } from "../components/landing/RetentionAI";
import { PricingSection } from "../components/landing/PricingSection";
import { TestimonialsSection } from "../components/landing/TestimonialsSection";
import { LandingFooter } from "../components/landing/LandingFooter";

export function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    if (!hash) {
      return;
    }

    const id = hash.replace("#", "");
    let attempts = 0;

    const tryScroll = () => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      attempts += 1;
      if (attempts < 10) {
        window.setTimeout(tryScroll, 50);
      }
    };

    window.setTimeout(tryScroll, 0);
  }, [location.hash]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
    >
      <CinematicBackground />
      <div className="relative" style={{ zIndex: 1 }}>
        <AppNavbar />
        <LandingHero />
        <SocialProofBar />
        <Phase1Features />
        <Phase2Differentiators />
        <RetentionAI />
        <CompetitiveEdge />
        <HowItWorks />
        <PricingSection />
        <TestimonialsSection />
        <LandingFooter />
      </div>
    </div>
  );
}
