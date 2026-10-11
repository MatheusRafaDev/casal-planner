import { useState, useEffect } from "react";
import { Store } from "lucide-react";

interface LogoBadgeProps {
  urls?: string[];
  className?: string;
  fallback?: React.ReactNode;
}

export function LogoBadge({
  urls,
  className = "w-3.5 h-3.5 rounded-[var(--radius-sm)] object-contain shrink-0",
  fallback,
}: LogoBadgeProps) {
  const [errorIndex, setErrorIndex] = useState(0);

  useEffect(() => {
    setErrorIndex(0);
  }, [urls]);

  if (!urls || urls.length === 0 || errorIndex >= urls.length) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Store className="w-3.5 h-3.5 opacity-50 shrink-0" />
    );
  }

  return (
    <img
      src={urls[errorIndex]}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setErrorIndex((i) => i + 1)}
    />
  );
}
