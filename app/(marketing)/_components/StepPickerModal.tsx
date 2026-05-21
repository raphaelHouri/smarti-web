"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronDown } from "lucide-react";

import { setGuestSystemStep, setUserSystemStep } from "@/actions/user-system-step";
import { LEARNING_ENTRY_STEPS } from "@/lib/learning-entry-steps";
import { getSystemStepFromCookie } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SelectedStepBadge } from "./SelectedStepBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StepValue = "1" | "2" | "3";

interface StepPickerModalProps {
  isAuthenticated: boolean;
  initialStep?: number;
  inline?: boolean;
}

function getInitialValue(stepParam: string | null, initialStep?: number): StepValue {
  if (stepParam) {
    const n = Number(stepParam);
    if ([1, 2, 3].includes(n)) return String(n) as StepValue;
  }
  if (initialStep && [1, 2, 3].includes(initialStep)) {
    return String(initialStep) as StepValue;
  }
  return String(getSystemStepFromCookie()) as StepValue;
}

export function StepPickerModal({ isAuthenticated, initialStep, inline }: StepPickerModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");

  const [currentValue, setCurrentValue] = useState<StepValue>(
    () => getInitialValue(stepParam, initialStep)
  );
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (stepParam) {
      const n = Number(stepParam);
      if ([1, 2, 3].includes(n)) setCurrentValue(String(n) as StepValue);
    }
  }, [stepParam]);

  const activeStep =
    LEARNING_ENTRY_STEPS.find((s) => s.value === currentValue) ?? LEARNING_ENTRY_STEPS[0];

  function handleSelect(value: StepValue) {
    setCurrentValue(value);
    setOpen(false);
    const numeric = Number(value);
    startTransition(async () => {
      if (isAuthenticated) {
        await setUserSystemStep(numeric);
      } else {
        await setGuestSystemStep(numeric);
      }
      router.refresh();
    });
  }

  if (inline) {
    return (
      <div dir="rtl" className="flex flex-col gap-3">
        {/* Section label */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-neutral-500 dark:text-slate-400">
            בחרו את השלב שלכם
          </p>
          <span className="text-[10px] text-muted-foreground">ניתן לשנות בכל עת</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {LEARNING_ENTRY_STEPS.map((step) => {
            const isActive = step.value === currentValue;
            return (
              <button
                key={step.value}
                onClick={() => handleSelect(step.value)}
                disabled={isPending}
                className={cn(
                  "group relative flex flex-col rounded-xl border overflow-hidden text-right bg-white dark:bg-slate-900",
                  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                  isActive
                    ? "border-emerald-600 dark:border-emerald-500 ring-1 ring-emerald-600 dark:ring-emerald-500"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                {/* Image */}
                <div
                  className={cn(
                    "relative aspect-square w-full",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-950/40"
                      : "bg-slate-50 dark:bg-slate-800/40"
                  )}
                >
                  <Image
                    src={step.imageSrc}
                    alt={step.title}
                    fill
                    sizes="140px"
                    className="object-contain p-2"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-0.5 p-2.5 flex-1 border-t border-slate-100 dark:border-slate-800">
                  <p className="font-bold text-xs text-neutral-900 dark:text-slate-50 leading-tight">
                    {step.title}
                  </p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    {step.subtitle}
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {step.description}
                  </p>
                </div>

                {/* Active checkmark — subtle, top-left of card */}
                {isActive && (
                  <span className="absolute top-1.5 left-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white shadow-sm">
                    <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={3} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Trust footer — approval badge */}
        <div className="flex justify-start pt-0.5" dir="rtl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            מאושר ע״י הורים ומורים
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Current step display — no image ── */}
      <div
        className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
        dir="rtl"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-bold text-neutral-900 dark:text-slate-50 leading-tight">
            {activeStep.title}
            <span className="mr-1.5 text-xs font-normal text-muted-foreground">
              — {activeStep.subtitle}
            </span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {activeStep.description}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 gap-1 px-2"
          onClick={() => setOpen(true)}
          disabled={isPending}
        >
          שנה שלב
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* ── Dialog ── */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl w-full p-6 sm:p-8"
          dir="rtl"
        >
          <DialogHeader className="text-right sm:text-right">
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-slate-50">
              בחרו את השלב המתאים לילדכם
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              לחצו על השלב המתאים — תוכלו לשנות בכל עת
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            {LEARNING_ENTRY_STEPS.map((step) => {
              const isActive = step.value === currentValue;
              return (
                <button
                  key={step.value}
                  onClick={() => handleSelect(step.value)}
                  disabled={isPending}
                  className={cn(
                    "relative flex flex-col rounded-2xl overflow-hidden text-right transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
                    isActive
                      ? "border-[3px] border-emerald-500 dark:border-emerald-400 shadow-md"
                      : "border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm"
                  )}
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full bg-emerald-50 dark:bg-emerald-950/30">
                    <Image
                      src={step.imageSrc}
                      alt={step.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 220px"
                      className="object-contain p-2"
                    />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-1 p-3 bg-white dark:bg-slate-900 flex-1">
                    <p className="font-bold text-sm text-neutral-900 dark:text-slate-50 leading-tight">
                      {step.title}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      {step.subtitle}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  </div>

                  {isActive ? <SelectedStepBadge /> : null}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
