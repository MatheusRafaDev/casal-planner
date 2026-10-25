import { BRAND_CONFIG } from "@/design-system";

export interface BrandLogoTextProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withTagline?: boolean;
  withDot?: boolean;
  prefix?: string;
  suffix?: string;
  tagline?: string;
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
    xl: "h-12 w-12",
  };

  return (
    <img
      src={src || BRAND_CONFIG.assets.logoPng}
      alt={BRAND_CONFIG.name}
      className={`${sizeMap[size]} object-contain shrink-0 select-none ${className}`}
      loading="eager"
    />
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
        <span className="font-extrabold text-primary">{prefix}</span>
        <span className="font-bold text-foreground">{suffix}</span>
        {withDot && (
          <span
            aria-hidden="true"
            className={`${current.dot} inline-block shrink-0 rounded-full bg-brand-dot`}
          />
        )}
      </span>
      {withTagline && (
        <span
          className={`mt-1 font-sans text-muted-foreground/85 font-bold uppercase ${current.tagline}`}
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

