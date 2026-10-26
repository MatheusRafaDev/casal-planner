import { BRAND_CONFIG } from "@/design-system";
import { cn } from "@/lib/utils";

export interface BrandLogoTextProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withTagline?: boolean;
  withDot?: boolean;
  prefix?: string;
  suffix?: string;
  tagline?: string;
  variant?: "default" | "light" | "on-dark";
}

export interface BrandLogoIconProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  src?: string;
}

export function BrandLogoIcon({ size = "md", className = "", src }: BrandLogoIconProps) {
  const sizeMap = {
    xs: "h-5 w-5",
    sm: "h-7 w-7",
    md: "h-8 w-8",
    lg: "h-10 w-10",
    xl: "h-14 w-14",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={BRAND_CONFIG.name}
        className={`${sizeMap[size]} object-contain shrink-0 select-none ${className}`}
        loading="eager"
      />
    );
  }

  // Official Design System Monogram SVG: two overlapping lists (coral & white) on rounded green base
  return (
    <svg
      viewBox="0 0 160 160"
      className={`${sizeMap[size]} shrink-0 select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="160" height="160" rx="36" fill="#1f5c43" />
      <rect
        x="40"
        y="30"
        width="84"
        height="100"
        rx="12"
        fill="#ef6f6c"
        transform="rotate(-8 80 80)"
      />
      <g transform="rotate(6 78 84)">
        <rect x="36" y="34" width="84" height="100" rx="12" fill="#fff" />
        <path
          d="M64.36 51.64 A9 9 0 1 0 64.36 64.36"
          fill="none"
          stroke="#1f5c43"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="76" cy="64" r="4" fill="#ef6f6c" />
        <g transform="translate(92 50) scale(0.8)">
          <path
            d="M12 21s-7-4.6-9.3-9C1 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.5 0 5.4 3.6 3.7 7C19 16.4 12 21 12 21z"
            fill="#ef6f6c"
          />
        </g>
        <line x1="46" y1="76" x2="110" y2="76" stroke="#e7ece9" strokeWidth="2" />
        <circle cx="52" cy="88" r="5.5" fill="#ef6f6c" />
        <path
          d="M49.5 88 l2 2 l3.5 -3.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="64"
          y1="88"
          x2="108"
          y2="88"
          stroke="#1f5c43"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="52" cy="104" r="5.5" fill="#1f5c43" />
        <path
          d="M49.5 104 l2 2 l3.5 -3.5"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1="64"
          y1="104"
          x2="98"
          y2="104"
          stroke="#cfd8d2"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="52" cy="120" r="5" fill="none" stroke="#cfd8d2" strokeWidth="2" />
        <line
          x1="64"
          y1="120"
          x2="104"
          y2="120"
          stroke="#cfd8d2"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function BrandLogoText({
  size = "md",
  className = "",
  withTagline = false,
  withDot = true,
  prefix = BRAND_CONFIG.nameParts.prefix,
  suffix = BRAND_CONFIG.nameParts.suffix,
  tagline = BRAND_CONFIG.tagline,
  variant = "default",
}: BrandLogoTextProps) {
  const sizeMap = {
    xs: { text: "text-[16px]", dot: "text-[16px]", tagline: "text-[8px] tracking-[0.14em]" },
    sm: { text: "text-[18px]", dot: "text-[18px]", tagline: "text-[9px] tracking-[0.16em]" },
    md: { text: "text-[22px]", dot: "text-[22px]", tagline: "text-[10px] tracking-[0.18em]" },
    lg: { text: "text-[28px]", dot: "text-[28px]", tagline: "text-[11px] tracking-[0.2em]" },
    xl: { text: "text-[35px]", dot: "text-[35px]", tagline: "text-[12px] tracking-[0.2em]" },
  };

  const current = sizeMap[size];

  return (
    <span className={`inline-flex flex-col select-none leading-none ${className}`}>
      <span className={`inline-flex items-baseline font-brand tracking-[-0.04em] ${current.text}`}>
        <span
          className={cn(
            "font-extrabold",
            variant === "on-dark" ? "text-emerald-300" : "text-primary",
          )}
        >
          {prefix}
        </span>
        <span
          className={cn(
            "font-light",
            variant === "on-dark" ? "text-white" : "text-foreground",
          )}
        >
          {suffix}
        </span>
        {withDot && (
          <span aria-hidden="true" className="font-extrabold text-[#ef6f6c]">
            .
          </span>
        )}
      </span>
      {withTagline && (
        <span
          className={cn(
            "mt-1 font-sans font-semibold uppercase",
            current.tagline,
            variant === "on-dark" ? "text-emerald-200/80" : "text-muted-foreground/85",
          )}
        >
          {tagline}
        </span>
      )}
    </span>
  );
}

export interface BrandLogoProps extends BrandLogoTextProps {
  iconSize?: "xs" | "sm" | "md" | "lg" | "xl";
  iconClassName?: string;
  iconSrc?: string;
}

export function BrandLogo({
  size = "md",
  iconSize,
  className = "",
  iconClassName = "",
  iconSrc,
  withTagline = false,
  withDot = true,
  prefix,
  suffix,
  tagline,
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <BrandLogoIcon size={iconSize || size} className={iconClassName} src={iconSrc} />
      <BrandLogoText
        size={size}
        withTagline={withTagline}
        withDot={withDot}
        prefix={prefix}
        suffix={suffix}
        tagline={tagline}
      />
    </div>
  );
}
