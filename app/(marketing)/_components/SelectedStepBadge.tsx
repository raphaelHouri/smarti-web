"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type SelectedStepBadgeProps = { className?: string };

/** Minimal "selected" indicator for a step card — clean circle checkmark. */
export function SelectedStepBadge({ className }: SelectedStepBadgeProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-2.5 start-2.5 z-10",
        "flex items-center justify-center",
        "size-6 rounded-full",
        "bg-sky-600 dark:bg-sky-500",
        "shadow-md ring-2 ring-white dark:ring-slate-900",
        className
      )}
      role="status"
      aria-label="השלב הנבחר"
    >
      <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden />
    </span>
  );
}
