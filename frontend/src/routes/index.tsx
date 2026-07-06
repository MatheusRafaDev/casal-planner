import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/Home/PublicHeader";
import { HeroSection } from "@/components/Home/HeroSection";
import { FeaturesSection } from "@/components/Home/FeaturesSection";
import { CtaSection } from "@/components/Home/CtaSection";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicHeader />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
    </div>
  );
}
