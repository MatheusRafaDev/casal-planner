import type { SVGProps } from "react";

/**
 * Ícone Oficial CasalPlanner:
 * Une Casa (Lar), Casal (Verde e Dourado) e Planner (Checkmark dinâmico de metas)
 */
export function BrandLogoIcon({ className = "h-5 w-5", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true" {...props}>
      {/* Chaminé acolhedora */}
      <path
        d="M12 16 V10 H17 V13.5"
        fill="#E8B63C"
        stroke="#24302A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Estrutura da casa (paredes) */}
      <path
        d="M9 20 L24 7 L39 20 V40 C39 41.65 37.65 43 36 43 H12 C10.35 43 9 41.65 9 40 Z"
        fill="#FFFDF8"
        stroke="#24302A"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Telhado charmoso verde floresta */}
      <path
        d="M6 21 L24 6 L42 21"
        stroke="#2F7D5B"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Coração sutil no ápice do telhado */}
      <path
        d="M24 11.5 C23.2 10.5 21.8 10.5 21.8 11.7 C21.8 13 24 14.5 24 14.5 C24 14.5 26.2 13 26.2 11.7 C26.2 10.5 24.8 10.5 24 11.5 Z"
        fill="#E0531C"
        stroke="#24302A"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Pessoa 1 - Verde (Matheus) */}
      <g id="pessoa-verde">
        <circle cx="18" cy="23" r="3.5" fill="#2F7D5B" stroke="#24302A" strokeWidth="1.8" />
        <path
          d="M12.5 36 C12.5 29.5 15 28 18 28 C21 28 23.5 29.5 23.5 36 Z"
          fill="#2F7D5B"
          stroke="#24302A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>

      {/* Pessoa 2 - Amarelo/Dourado (Rayane) */}
      <g id="pessoa-amarela">
        <circle cx="28.5" cy="24" r="3.5" fill="#E8B63C" stroke="#24302A" strokeWidth="1.8" />
        <path
          d="M23.5 36 C23.5 30.5 25.5 29 28.5 29 C31.5 29 34.5 30.5 34.5 36 Z"
          fill="#E8B63C"
          stroke="#24302A"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </g>

      {/* Checkmark marcante do Planner cruzando à frente */}
      <path
        d="M16 34 L23.5 40.5 L38.5 23"
        stroke="#24302A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 34 L23.5 40.5 L38.5 23"
        stroke="#E8B63C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface BrandLogoBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BrandLogoBadge({ size = "md", className = "" }: BrandLogoBadgeProps) {
  const sizeMap = {
    sm: { box: "h-9 w-9 rounded-xl", icon: "h-5 w-5" },
    md: { box: "h-10 w-10 rounded-xl", icon: "h-6 w-6" },
    lg: { box: "h-12 w-12 rounded-2xl", icon: "h-7 w-7" },
  };

  const current = sizeMap[size];

  return (
    <span
      className={`grid ${current.box} shrink-0 place-items-center border-2 border-border bg-[#FFFDF8] shadow-[2.5px_2.5px_0_var(--border)] transition-transform group-hover:scale-105 ${className}`}
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
 * Tipografia limpa, harmoniosa e com selo de checkmark sutil e elegante.
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
      checkBadge: "w-4 h-4 ml-1",
      checkSvg: "w-2.5 h-2.5",
      checkStroke: "2.6",
      tagline: "text-[9px] tracking-wider",
    },
    md: {
      text: "text-[22px]",
      checkBadge: "w-5 h-5 ml-1.5",
      checkSvg: "w-3 h-3",
      checkStroke: "2.8",
      tagline: "text-[10px] tracking-wider",
    },
    lg: {
      text: "text-[28px]",
      checkBadge: "w-6 h-6 ml-2",
      checkSvg: "w-3.5 h-3.5",
      checkStroke: "3",
      tagline: "text-[11px] tracking-wider",
    },
    xl: {
      text: "text-[34px]",
      checkBadge: "w-7 h-7 ml-2.5",
      checkSvg: "w-4 h-4",
      checkStroke: "3.2",
      tagline: "text-[12px] tracking-wider",
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex flex-col select-none leading-none ${className}`}>
      <span
        className={`font-display font-extrabold tracking-tight inline-flex items-center ${current.text}`}
      >
        <span className="text-[#2F7D5B]">Casal</span>
        <span className="text-[#24302A] dark:text-foreground ml-0.5">Planner</span>

        {/* Selo minimalista com Checkmark */}
        {withDot && (
          <span
            className={`${current.checkBadge} inline-flex items-center justify-center rounded-md bg-[#2F7D5B] text-white border-1.5 border-[#24302A] shadow-[1.5px_1.5px_0_#24302A] shrink-0 transition-transform group-hover:scale-105`}
            title="CasalPlanner"
          >
            <svg
              className={current.checkSvg}
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.2 8.4 L6.4 11.6 L12.8 4.6"
                stroke="currentColor"
                strokeWidth={current.checkStroke}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </span>

      {withTagline && (
        <span
          className={`font-sans font-bold uppercase text-muted-foreground mt-1 ${current.tagline}`}
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
