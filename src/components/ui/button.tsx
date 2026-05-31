import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[14px] text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700/25 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-55 active:translate-y-px",
  {
    variants: {
      variant: {
        default: "bg-zinc-950 text-white shadow-[0_18px_34px_-22px_rgba(15,23,42,0.75)] hover:bg-zinc-800",
        secondary: "border border-zinc-200 bg-white text-zinc-900 shadow-[0_14px_34px_-26px_rgba(15,23,42,0.55)] hover:border-zinc-300 hover:bg-zinc-50",
        accent: "bg-zinc-950 text-white shadow-[0_18px_38px_-24px_rgba(24,24,27,0.78)] hover:bg-zinc-800",
        ghost: "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
        danger: "text-red-700 hover:bg-red-50"
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 rounded-[12px] px-3 text-xs",
        lg: "h-12 rounded-[16px] px-6 text-base",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
