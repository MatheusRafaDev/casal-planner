import { createFileRoute } from "@tanstack/react-router";
import { PublicHeader } from "@/components/home/PublicHeader";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { CtaSection } from "@/components/home/CtaSection";

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
