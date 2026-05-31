"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingChildren?: ReactNode;
};

export function SubmitButton({ children, className = "button primary", pendingChildren }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={`${className}${pending ? " is-pending" : ""}`} type="submit" disabled={pending} aria-busy={pending}>
      {pending ? <span className="button-spinner" aria-hidden="true" /> : null}
      {pending ? pendingChildren ?? children : children}
    </button>
  );
}
