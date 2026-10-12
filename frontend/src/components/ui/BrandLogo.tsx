export interface BrandLogoTextProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withTagline?: boolean;
  withDot?: boolean;
}

export function BrandLogoText({
  size = "md",
  className = "",
  withTagline = false,
  withDot = true,
}: BrandLogoTextProps) {
  const sizeMap = {
    sm: { text: "text-[18px]", dot: "h-1.5 w-1.5 ml-1", tagline: "text-[9px] tracking-[0.18em]" },
    md: { text: "text-[22px]", dot: "h-2 w-2 ml-1.5", tagline: "text-[10px] tracking-[0.18em]" },
    lg: { text: "text-[27px]", dot: "h-2.5 w-2.5 ml-1.5", tagline: "text-[11px] tracking-[0.2em]" },
    xl: { text: "text-[33px]", dot: "h-3 w-3 ml-2", tagline: "text-[12px] tracking-[0.2em]" },
  };

  const current = sizeMap[size];

  return (
    <span className={`inline-flex flex-col select-none leading-none ${className}`}>
      <span className={`inline-flex items-baseline font-brand tracking-[-0.02em] ${current.text}`}>
        <span className="font-extrabold text-[#206E49] dark:text-[#4FB387]">Casal</span>
        <span className="ml-[3px] font-bold text-[#1E2922] dark:text-[#FAF6EE]">Planner</span>
        {withDot && (
          <span
            aria-hidden="true"
            className={`${current.dot} inline-block shrink-0 rounded-full bg-[#F59E0B]`}
          />
        )}
      </span>
      {withTagline && (
        <span
          className={`mt-1 font-sans text-muted-foreground/85 font-bold uppercase ${current.tagline}`}
        >
          Planejamento a dois
        </span>
      )}
    </span>
  );
}
