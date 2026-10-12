import type { ImgHTMLAttributes } from "react";

export function BrandLogoIcon({
  className = "h-5 w-5",
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src="/logo_casalplanner.png?v=4"
      alt=""
      aria-hidden="true"
      className={className}
      decoding="async"
      {...props}
    />
  );
}

interface BrandLogoBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogoBadge({ size = "md", className = "" }: BrandLogoBadgeProps) {
  const sizeMap = {
    sm: { box: "h-8 w-8", icon: "h-7 w-7" },
    md: { box: "h-10 w-10", icon: "h-9 w-9" },
    lg: { box: "h-12 w-12", icon: "h-11 w-11" },
  };

  const current = sizeMap[size];

  return (
    <span
      className={`inline-flex ${current.box} shrink-0 items-center justify-center bg-transparent transition-transform group-hover:scale-105 ${className}`}
    >
      <BrandLogoIcon className={current.icon} />
    </span>
  );
}

export interface BrandLogoTextProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withTagline?: boolean;
  withDot?: boolean;
}

/**
 * Wordmark Oficial do CasalPlanner:
 * Tipografia moderna, sofisticada e limpa (Outfit) com detalhe dourado sutil.
 */
export function BrandLogoText({
  size = "md",
  className = "",
  withTagline = false,
  withDot = true,
}: BrandLogoTextProps) {
  const sizeMap = {
    sm: {
      text: "text-[18px]",
      dot: "w-1.5 h-1.5 ml-1",
      tagline: "text-[9px] tracking-[0.18em]",
    },
    md: {
      text: "text-[22px]",
      dot: "w-2 h-2 ml-1.5",
      tagline: "text-[10px] tracking-[0.18em]",
    },
    lg: {
      text: "text-[27px]",
      dot: "w-2.5 h-2.5 ml-1.5",
      tagline: "text-[11px] tracking-[0.2em]",
    },
    xl: {
      text: "text-[33px]",
      dot: "w-3 h-3 ml-2",
      tagline: "text-[12px] tracking-[0.2em]",
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex flex-col select-none leading-none ${className}`}>
      <span className={`font-brand tracking-[-0.02em] inline-flex items-baseline ${current.text}`}>
        <span className="font-extrabold text-[#206E49] dark:text-[#4FB387] transition-colors">
          Casal
        </span>
        <span className="font-bold text-[#1E2922] dark:text-[#FAF6EE] ml-[3px] transition-colors">
          Planner
        </span>

        {/* Ponto solar dourado sutil */}
        {withDot && (
          <span
            className={`${current.dot} inline-block rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#D97706] shadow-xs shrink-0 transition-transform group-hover:scale-125`}
            title="CasalPlanner"
          />
        )}
      </span>

      {withTagline && (
        <span
          className={`font-sans font-bold uppercase text-muted-foreground/85 mt-1 ${current.tagline}`}
        >
          Planejamento a dois
        </span>
      )}
    </div>
  );
}

export interface BrandLogoWordmarkProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withBadge?: boolean;
  withTagline?: boolean;
}

/**
 * Combinação completa de Ícone + Logo Texto
 */
export function BrandLogoWordmark({
  size = "md",
  className = "",
  withBadge = true,
  withTagline = false,
}: BrandLogoWordmarkProps) {
  const badgeSize = size === "xl" ? "lg" : size === "lg" ? "md" : "sm";

  return (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {withBadge && (
        <BrandLogoBadge size={badgeSize} className="transition-transform group-hover:scale-105" />
      )}
      <BrandLogoText size={size} withTagline={withTagline} />
    </div>
  );
}
