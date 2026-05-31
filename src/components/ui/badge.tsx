import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[10px] border px-2.5 py-1 text-xs font-semibold tabular-nums",
  {
    variants: {
      variant: {
        default: "border-zinc-200 bg-zinc-50 text-zinc-700",
        accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
        dark: "border-zinc-800 bg-zinc-950 text-zinc-100"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
