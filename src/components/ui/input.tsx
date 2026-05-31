import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-[14px] border border-zinc-200 bg-white px-3.5 text-sm text-zinc-950 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-emerald-700/50 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
