"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Rocket, BookOpen, Sparkles, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketingPlanRecord, MarketingPlansByTypeAndStep } from "@/db/queries";

const STEP_LABELS: Record<number, string> = {
  1: "שלב א׳ — כיתה ב׳",
  2: "שלב ב׳ — כיתה ג׳",
  3: "כיתה ג׳ — שלב ב׳ מורחב",
};

function formatIls(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function collectSortedSteps(plans: MarketingPlansByTypeAndStep): number[] {
  const keys = new Set<number>();
  for (const k of Object.keys(plans.system)) {
    const n = Number(k);
    if (Number.isFinite(n)) keys.add(n);
  }
  for (const k of Object.keys(plans.book)) {
    const n = Number(k);
    if (Number.isFinite(n)) keys.add(n);
  }
  return [...keys].sort((a, b) => a - b);
}

const DEFAULT_SYSTEM_FEATURES = [
  "גישה מלאה לתכני הלומדה",
  "מבחנים וסימולציות מדומים למבחן",
  "מעקב אחר התקדמות הילד/ה",
  "תמיכה והנחיות שימוש",
];

export function LomdaPricingClient({ plans }: { plans: MarketingPlansByTypeAndStep }) {
  const steps = useMemo(() => collectSortedSteps(plans).filter((s) => {
    const sys = plans.system[s] ?? [];
    const bks = plans.book[s] ?? [];
    return sys.length > 0 || bks.length > 0;
  }), [plans]);

  const [activeStep, setActiveStep] = useState<number>(steps[0] ?? 1);
  const [includeBook, setIncludeBook] = useState<boolean>(false);

  if (steps.length === 0) return null;

  const systemPlans = plans.system[activeStep] ?? [];
  const bookPlans = plans.book[activeStep] ?? [];

  const popularIndex = useMemo(() => {
    if (systemPlans.length >= 3) return 2;
    if (systemPlans.length === 0) return 0;
    return systemPlans.length - 1;
  }, [systemPlans.length]);

  return (
    <div className="flex flex-col items-center">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 bg-slate-100/50 p-1.5 rounded-2xl">
        {steps.map((step) => (
          <button
            key={step}
            onClick={() => setActiveStep(step)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeStep === step
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            {STEP_LABELS[step] ?? `שלב ${step}`}
          </button>
        ))}
      </div>

      {/* Plans & Summary Layout */}
      <div className="w-full lg:flex lg:flex-row lg:gap-8 lg:items-start">
        {/* Left Column: Grid + Upsell Toggle */}
        <div className="flex-1 w-full flex flex-col gap-6">
          {/* System Plans Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-stretch">
            {systemPlans.map((plan, i) => {
              const isPopular = i === popularIndex;
              
              let displayPrice = plan.price;
              let originalPrice = null;
              let bookAdded = false;
              
              if (includeBook) {
                const addOpt = plan.displayData?.addBookOption;
                if (addOpt && Number.isFinite(Number(addOpt.price))) {
                  displayPrice += Number(addOpt.price);
                  const regularBookPrice = bookPlans[0]?.price ?? Number(addOpt.originalPrice ?? addOpt.price);
                  const bundleOriginal = plan.price + regularBookPrice;
                  if (bundleOriginal > displayPrice) {
                    originalPrice = bundleOriginal;
                  }
                  bookAdded = true;
                } else if (bookPlans.length > 0) {
                  displayPrice += bookPlans[0].price;
                  bookAdded = true;
                }
              }

              return (
                <div key={plan.id} className="relative flex flex-col h-full">
                  <div
                    className={cn(
                      "w-full text-right rounded-2xl p-6 transition-all flex-1 flex flex-col relative justify-between",
                      isPopular
                        ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-md"
                        : "border border-slate-200 bg-white shadow-sm"
                    )}
                  >
                    {isPopular && (
                      <span className="absolute -top-3 lg:-top-3 right-1/2 translate-x-1/2 rounded-full bg-[#fbbf24] text-yellow-900 text-xs lg:text-sm font-bold px-3 py-1 shadow-sm whitespace-nowrap">
                        הכי פופולרי
                      </span>
                    )}
                    
                    <div className="flex flex-col items-center text-center w-full mt-4 mb-4">
                      <div className="font-bold text-lg lg:text-xl text-neutral-900">
                        {plan.name}
                      </div>
                      <div className="mt-2 text-3xl lg:text-4xl font-extrabold text-neutral-900 tabular-nums flex items-baseline gap-2">
                        {formatIls(displayPrice)}
                        {originalPrice && (
                          <span className="text-lg text-slate-400 line-through font-normal">
                            {formatIls(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                  <div className="mt-auto mb-5">
                    {bookAdded && (
                      <div className="flex items-center justify-center gap-2 text-[13px] text-emerald-700 bg-emerald-50/50 py-2.5 px-3 rounded-xl border border-emerald-500/30">
                        <div className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className="font-bold">כולל חוברת במחיר משולב מוזל</span>
                      </div>
                    )}
                  </div>

                    <div className="flex justify-center">
                      <Link
                        href={`/shop/system?step=${activeStep}`}
                        className={cn(
                          "px-6 py-2.5 rounded-full border text-sm font-bold transition-colors w-full text-center",
                          isPopular
                            ? "border-transparent bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        )}
                      >
                        לרכישת המסלול
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Book Toggle Upsell Section */}
          <section className="rounded-2xl border border-emerald-100 overflow-hidden bg-emerald-50/20 shadow-sm p-4 lg:p-5 mt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden border border-emerald-100 shadow-sm bg-white p-1">
                  <Image 
                    src={activeStep === 1 ? "/bookStep1.webp" : activeStep === 2 ? "/bookStep2.webp" : activeStep === 3 ? "/bookStep3.webp" : "/smarti.png"}
                    alt="חוברת הכנה"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-sm lg:text-base font-bold text-neutral-900 leading-tight">
                    הצג מחירים כולל חוברת הכנה מודפסת
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-md leading-snug">
                    מומלץ מאוד לשלב תרגול על נייר! ילדים שמתרגלים גם בחוברת מגיעים מוכנים ובטוחים יותר למבחן האמיתי.
                  </p>
                  {includeBook && (
                    <span className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" strokeWidth={3} />
                      המחירים למעלה עודכנו וכוללים את ההנחה
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100/50">
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeBook}
                  onClick={() => setIncludeBook((v) => !v)}
                  className={cn(
                    "relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors border-2",
                    includeBook ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-200",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                      includeBook ? "-translate-x-1" : "-translate-x-6",
                    )}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Features Panel */}
        <aside className="mt-8 lg:mt-0 flex flex-col w-full lg:w-[320px] xl:w-[360px] shrink-0 lg:sticky lg:top-24 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-xl xl:text-[1.35rem] font-extrabold text-neutral-900 leading-tight">
              מה כלול
              <br />
              <span className="text-emerald-600 font-bold">בכל המסלולים?</span>
            </h2>
          </div>
          
          <div className="mb-6 flex-1">
            <ul className="flex flex-col gap-3 text-[13px] text-neutral-700">
              {(() => {
                const popularPlan = systemPlans[popularIndex] || systemPlans[0];
                const rawFeatures = popularPlan?.displayData?.features;
                const features = Array.isArray(rawFeatures) ? (rawFeatures as string[]).filter(Boolean) : [];
                const displayFeatures = features.length ? features : DEFAULT_SYSTEM_FEATURES;
                
                return displayFeatures.slice(0, 8).map((f, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={3} />
                    <span className="leading-tight">{f}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>
          
          {/* Book Upsell Notice inside the panel */}
          <div className={cn("pt-5 border-t border-slate-100 -mx-6 px-6 pb-2", includeBook ? "bg-emerald-50/80" : "bg-slate-50/50")}>
            <div className="flex items-start gap-3">
              <div className={cn("shrink-0 w-8 h-8 rounded-full border flex items-center justify-center shadow-sm", includeBook ? "bg-emerald-500 border-emerald-500 text-white" : "bg-white border-emerald-100 text-emerald-600")}>
                {includeBook ? <Check className="w-4 h-4" strokeWidth={3} /> : <BookOpen className="w-4 h-4" />}
              </div>
              <div>
                <h4 className={cn("text-sm font-bold", includeBook ? "text-emerald-900" : "text-neutral-900")}>
                  {includeBook ? "המחירים כוללים חוברת" : "הטבה מיוחדת"}
                </h4>
                <p className={cn("text-xs mt-1 leading-snug", includeBook ? "text-emerald-800 font-medium" : "text-neutral-600")}>
                  {includeBook 
                    ? "המחירים המוצגים משמאל מעודכנים וכוללים מחיר מיוחד לחוברת המודפסת."
                    : "רוכשי הלומדה זכאים להנחה משמעותית על חוברות ההכנה שלנו. ההנחה מתעדכנת אוטומטית בעת הרכישה."}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
      
      {systemPlans.length === 0 && (
        <div className="text-center py-10 text-slate-500">
          לא נמצאו מסלולים זמינים לשלב זה
        </div>
      )}

      {/* Books and Full Store links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full">
        <Link
          href={`/shop/system?step=${activeStep}`}
          className="flex flex-col items-center text-center gap-1.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/20 px-5 py-4 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <Rocket className="w-4 h-4" aria-hidden />
            כל מסלולי הלומדה בחנות
          </span>
          <span className="text-xs text-muted-foreground">בחירת תקופה, תשלום והנחות</span>
        </Link>
        <Link
          href={`/shop/book?step=${activeStep}`}
          className="flex flex-col items-center text-center gap-1.5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 px-5 py-4 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 dark:text-amber-400">
            <BookOpen className="w-4 h-4" aria-hidden />
            כל חוברות ההכנה בחנות
          </span>
          <span className="text-xs text-muted-foreground">משלוח ומלאי לפי שלב</span>
        </Link>
      </div>
    </div>
  );
}
