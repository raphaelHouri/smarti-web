"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ClerkLoaded,
  ClerkLoading,
  SignUpButton,
  useAuth,
} from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { resolveLearnEntryStep } from "@/actions/learn-entry";
import { setGuestSystemStep, setUserSystemStep } from "@/actions/user-system-step";
import { LEARNING_ENTRY_STEPS } from "@/lib/learning-entry-steps";
import { SelectedStepBadge } from "./SelectedStepBadge";
import { cn } from "@/lib/utils";
import { shouldShowAuthButtons } from "@/lib/restricted-users";
import { trackEvent } from "@/lib/posthog";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type StepNum = 1 | 2 | 3;

export interface LearnEntryButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  /** @deprecated Prefer {@link onDialogOpenChange}. If this unmounts the button (e.g. closes a parent portal), the dialog will not open. */
  onTriggerClick?: () => void;
  /** Called when the step-picker dialog opens or closes. */
  onDialogOpenChange?: (open: boolean) => void;
  trackSource?: string;
}

export function LearnEntryButton({
  children,
  className,
  variant = "secondary",
  size,
  onTriggerClick,
  onDialogOpenChange,
  trackSource,
  disabled,
  ...rest
}: LearnEntryButtonProps) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StepNum>(1);
  const [resolved, setResolved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      setResolved(false);
      return;
    }
    let cancelled = false;
    setResolved(false);
    void resolveLearnEntryStep().then((step) => {
      if (!cancelled && [1, 2, 3].includes(step)) {
        setSelected(step as StepNum);
        setResolved(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  function handleOpen() {
    setOpen(true);
    trackEvent("learn_entry_opened", {
      source: trackSource ?? "unknown",
    });
    onTriggerClick?.();
  }

  function goLearn() {
    setOpen(false);
    router.push("/learn");
  }

  function handleGuest() {
    startTransition(async () => {
      await setGuestSystemStep(selected);
      trackEvent("learn_entry_continue_guest", {
        systemStep: selected,
        source: trackSource ?? "unknown",
      });
      router.refresh();
      goLearn();
    });
  }

  function handleSignedInContinue() {
    startTransition(async () => {
      try {
        await setUserSystemStep(selected);
      } catch {
        await setGuestSystemStep(selected);
      }
      trackEvent("learn_entry_continue_signed_in", {
        systemStep: selected,
        source: trackSource ?? "unknown",
      });
      router.refresh();
      goLearn();
    });
  }

  const showAuthUpsell = shouldShowAuthButtons(userId);
  const redirectWithStep = `/learn?step=${selected}`;

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        {...rest}
        onClick={handleOpen}
      >
        {children}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onDialogOpenChange?.(next);
        }}
      >
        <DialogContent
          overlayClassName="z-[260]"
          className="z-[261] max-w-2xl w-full p-6 sm:p-8 max-h-[min(90dvh,820px)] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader className="text-right sm:text-right space-y-1">
            <DialogTitle className="text-xl font-bold text-neutral-900 dark:text-slate-50">
              בחרו את השלב המתאים לילדכם
            </DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              השלב המסומן מותאם לעונה ולנתונים ששמרתם — ניתן לשנות לפני הכניסה
            </p>
          </DialogHeader>

          {!resolved ? (
            <div className="flex justify-center py-12" aria-busy="true">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-2">
              {LEARNING_ENTRY_STEPS.map((step) => {
                const num = Number(step.value) as StepNum;
                const isActive = selected === num;
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => setSelected(num)}
                    disabled={isPending}
                    className={cn(
                      "relative flex flex-row sm:flex-col rounded-2xl overflow-hidden text-right transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2",
                      isActive
                        ? "border-[3px] border-sky-500 dark:border-sky-400 shadow-md"
                        : "border-2 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-sm"
                    )}
                  >
                    <div className="relative bg-sky-50 dark:bg-sky-950/30 w-[5.5rem] shrink-0 aspect-square sm:w-full sm:aspect-[4/3]">
                      <Image
                        src={step.imageSrc}
                        alt={step.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 220px"
                        className="object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-col gap-1 p-2.5 sm:p-3 bg-white dark:bg-slate-900 flex-1 justify-center">
                      <p className="font-bold text-sm text-neutral-900 dark:text-slate-50 leading-tight">
                        {step.title}
                      </p>
                      <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
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
          )}

          <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            {isSignedIn ? (
              /* ── Signed-in: go straight to learning ── */
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={isPending || !resolved}
                onClick={handleSignedInContinue}
              >
                {isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                ) : (
                  "התחל ללמוד"
                )}
              </Button>
            ) : (
              /* ── Signed-out: signup CTA + quiet guest link ── */
              <>
                {/* Primary: open Clerk signup */}
                {showAuthUpsell && (
                  <>
                    <ClerkLoading>
                      <Button variant="secondary" size="lg" className="w-full" disabled>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                      </Button>
                    </ClerkLoading>
                    <ClerkLoaded>
                      <SignUpButton mode="modal" forceRedirectUrl={redirectWithStep}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="w-full"
                          disabled={!resolved}
                          onClick={() =>
                            trackEvent("learn_entry_sign_up_clicked", {
                              systemStep: selected,
                              source: trackSource ?? "unknown",
                            })
                          }
                        >
                          בואו נלמד ביחד
                        </Button>
                      </SignUpButton>
                    </ClerkLoaded>
                  </>
                )}

                {/* Secondary: continue as guest */}
                <button
                  type="button"
                  disabled={isPending || !resolved}
                  onClick={handleGuest}
                  className="w-full text-center text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:underline disabled:opacity-50 pt-3 pb-1 mt-1 border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin inline" aria-hidden />
                  ) : (
                    "המשך כאורח"
                  )}
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
