import { useState } from "react";

interface LogoBadgeProps {
  url?: string | null;
  className?: string;
  fallback?: React.ReactNode;
}

export function LogoBadge({ url, className = "w-3 h-3 rounded-sm", fallback }: LogoBadgeProps) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={url}
      alt=""
      className={className}
      onError={() => setError(true)}
    />
  );
}
