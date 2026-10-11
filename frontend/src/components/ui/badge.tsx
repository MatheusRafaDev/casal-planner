/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border-2 border-border px-3 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-3 focus:ring-ring whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-muted text-foreground",
        destructive: "bg-destructive-tint text-destructive-tint-foreground",
        success: "bg-success-tint text-success-tint-foreground",
        warning: "bg-gold-tint text-gold-tint-foreground",
        info: "bg-primary-tint text-primary-tint-foreground",
        gold: "bg-gold text-gold-foreground",
        outline: "bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
