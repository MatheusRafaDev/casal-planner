import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { box: "h-8 w-8", icon: "h-4 w-4", label: "text-base" },
  md: { box: "h-10 w-10", icon: "h-5 w-5", label: "text-lg" },
  lg: { box: "h-14 w-14", icon: "h-7 w-7", label: "text-2xl" },
};

export function BrandMark({ className, showLabel = true, size = "md" }: BrandMarkProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "bg-gradient-brand grid place-items-center rounded-2xl text-primary-foreground shadow-[var(--shadow-glow)]",
          s.box,
        )}
      >
        <Heart className={cn(s.icon, "fill-current")} strokeWidth={2.5} />
      </div>
      {showLabel && (
        <span className={cn("font-bold tracking-tight", s.label)}>
          Casal<span className="text-gradient-brand">Planner</span>
        </span>
      )}
    </div>
  );
}
