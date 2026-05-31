import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-[16px] border border-zinc-200 bg-white px-3.5 py-3 text-sm leading-6 text-zinc-950 shadow-sm transition-colors placeholder:text-zinc-400 focus:border-emerald-700/50 focus:outline-none focus:ring-4 focus:ring-emerald-700/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
