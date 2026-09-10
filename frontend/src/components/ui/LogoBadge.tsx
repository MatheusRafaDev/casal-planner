import { useState, useEffect } from "react";

interface LogoBadgeProps {
  urls?: string[];
  className?: string;
  fallback?: React.ReactNode;
}

export function LogoBadge({ urls, className = "w-3 h-3 rounded-sm", fallback }: LogoBadgeProps) {
  const [errorIndex, setErrorIndex] = useState(0);

  useEffect(() => {
    setErrorIndex(0);
  }, [urls]);

  if (!urls || urls.length === 0 || errorIndex >= urls.length) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <img
      src={urls[errorIndex]}
      alt=""
      className={className}
      onError={() => setErrorIndex((i) => i + 1)}
    />
  );
}
