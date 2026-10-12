import { useId, type SVGProps } from "react";

/**
 * Ícone Oficial CasalPlanner:
 * Dois bonequinhos (Verde Esmeralda e Amarelo Dourado) abraçando o Lar (Casa Branca Central).
 */
export function BrandLogoIcon({ className = "h-5 w-5", ...props }: SVGProps<SVGSVGElement>) {
  const id = useId();
  const cleanId = id.replace(/:/g, "");
  const greenGradId = `cp-green-${cleanId}`;
  const goldGradId = `cp-gold-${cleanId}`;
  const shadowId = `cp-shadow-${cleanId}`;

  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true" {...props}>
      <defs>
        {/* Gradiente Verde Esmeralda (Pessoa 1) */}
        <linearGradient id={greenGradId} x1="11" y1="9" x2="23" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#24784F" />
        </linearGradient>

        {/* Gradiente Amarelo Dourado (Pessoa 2) */}
        <linearGradient id={goldGradId} x1="25" y1="9" x2="37" y2="41" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Sombra sutil sob a casinha */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* ========================================================
          1. BONEQUINHO ESQUERDO (Verde Esmeralda)
          ======================================================== */}
      {/* Cabeça Esquerda */}
      <circle cx="17" cy="15" r="6.8" fill={`url(#${greenGradId})`} />

      {/* Corpo / Ombro Esquerdo */}
      <path
        d="M 17 22.5 C 10.5 22.5 6 27.5 6 34.5 C 6 39.5 9.5 42 16 42 C 20.5 42 24.5 39.5 26.5 35 C 25.5 28.5 22 22.5 17 22.5 Z"
        fill={`url(#${greenGradId})`}
      />

      {/* ========================================================
          2. BONEQUINHO DIREITO (Amarelo Dourado)
          ======================================================== */}
      {/* Cabeça Direita */}
      <circle cx="31" cy="15" r="6.8" fill={`url(#${goldGradId})`} />

      {/* Corpo / Ombro Direito */}
      <path
        d="M 31 22.5 C 26 22.5 22.5 28.5 21.5 35 C 23.5 39.5 27.5 42 32 42 C 38.5 42 42 39.5 42 34.5 C 42 27.5 37.5 22.5 31 22.5 Z"
        fill={`url(#${goldGradId})`}
      />

      {/* Intersecção / União dos dois corpos no centro */}
      <path
        d="M 24 24 C 21.5 28 20 33 20 38 C 21 40 23 41.5 24 41.8 C 25 41.5 27 40 28 38 C 28 33 26.5 28 24 24 Z"
        fill="#266B46"
        opacity="0.35"
      />

      {/* ========================================================
          3. O LAR NO CENTRO (Casinha com Chaminé)
          ======================================================== */}
      <g filter={`url(#${shadowId})`}>
        {/* Chaminé */}
        <rect x="27.5" y="24" width="2.6" height="5" rx="0.6" fill="#FFFFFF" stroke="#E2DDD5" strokeWidth="0.8" />

        {/* Estrutura da Casinha (Telhado Inclinado + Paredes) */}
        <path
          d="M 24 23.2 L 32.2 29.8 C 32.6 30.1 32.5 30.7 32 30.7 H 30.5 V 39.5 C 30.5 40.3 29.8 41 29 41 H 19 C 18.2 41 17.5 40.3 17.5 39.5 V 30.7 H 16 C 15.5 30.7 15.4 30.1 15.8 29.8 L 24 23.2 Z"
          fill="#FFFFFF"
          stroke="#E2DDD5"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />

        {/* Portinha Acolhedora no Centro */}
        <path
          d="M 22 41 V 34.8 C 22 33.8 22.8 33 23.8 33 H 24.2 C 25.2 33 26 33.8 26 34.8 V 41"
          fill="#FAF8F5"
          stroke="#E2DDD5"
          strokeWidth="0.75"
        />
      </g>
    </svg>
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
      <span
        className={`font-brand tracking-[-0.02em] inline-flex items-baseline ${current.text}`}
      >
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

