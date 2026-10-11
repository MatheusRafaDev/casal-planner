import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border-2 border-border bg-card dark:bg-[#233028] px-3 py-2 text-sm text-foreground shadow-[2px_2px_0_var(--border)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-foreground placeholder:text-muted-foreground dark:placeholder:text-[#9bb0a4] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring dark:focus-visible:ring-primary dark:focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
