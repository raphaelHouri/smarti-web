import Image from "next/image";
import Link from "next/link";
import { BookOpen, Check, ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import type { MarketingPlanRecord, MarketingPlansByTypeAndStep } from "@/db/queries";

const STEP_META: Record<
  number,
  { label: string; href: string; imageSrc: string; description: string }
> = {
  1: {
    label: "שלב א׳ — כיתה ב׳",
    href: "/shlab-a",
    imageSrc: "/bookStep1.webp",
    description: "חוברת הכנה לשלב א׳ עם סימולציות מודפסות בפורמט המבחן.",
  },
  2: {
    label: "שלב ב׳ — כיתה ג׳",
    href: "/shlab-b",
    imageSrc: "/bookStep2.webp",
    description: "חוברת מתקדמת לשלב ב׳: אנלוגיות, סדרות צורניות וחשיבה מרחבית.",
  },
  3: {
    label: "כיתה ג׳ — שלב ב׳ מורחב",
    href: "/kita-gimel",
    imageSrc: "/bookStep3.webp",
    description: "חוברת לכיתה ג׳ עם דגש על שלב ב׳ — חיזוק מאתגר ומורכב יותר.",
  },
};

function bookFeatures(plan: MarketingPlanRecord): string[] {
  const features = plan.displayData?.features;
  if (Array.isArray(features)) {
    return features.filter((f): f is string => typeof f === "string");
  }
  return [];
}

function formatIls(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function BookCard({ plan }: { plan: MarketingPlanRecord }) {
  const features = bookFeatures(plan);
  const meta = STEP_META[plan.systemStep] ?? {
    label: `שלב ${plan.systemStep}`,
    href: "/shop/book",
    imageSrc: "/bookStep1.webp",
    description: "",
  };

  return (
    <article className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
      <div className="relative w-full sm:w-44 aspect-[3/4] sm:aspect-[3/4] flex-shrink-0 rounded-xl overflow-hidden bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
        <Image
          src={meta.imageSrc}
          alt={`${plan.name} — חוברת הכנה למבחן מחוננים`}
          fill
          sizes="(max-width: 640px) 100vw, 11rem"
          className="object-contain p-3"
        />
      </div>

      <div className="flex flex-col gap-2.5 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-[11px] font-bold tracking-wide">
            <BookOpen className="w-3 h-3" aria-hidden />
            {meta.label}
          </span>
        </div>

        <h3 className="text-lg font-bold text-neutral-900 dark:text-slate-50 leading-tight">{plan.name}</h3>

        {plan.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
        ) : meta.description ? (
          <p className="text-sm text-muted-foreground leading-relaxed">{meta.description}</p>
        ) : null}

        {features.length > 0 ? (
          <ul className="flex flex-col gap-1 mt-1">
            {features.slice(0, 4).map((feature) => (
              <li key={feature} className="flex items-start gap-1.5 text-sm text-neutral-700 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" aria-hidden />
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-neutral-900 dark:text-slate-50 tabular-nums">{formatIls(plan.price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={meta.href}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
            >
              מידע על השלב
              <ArrowLeft className="w-3 h-3" aria-hidden />
            </Link>
            <Link
              href="/shop/book"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm py-2 px-3 transition-colors"
            >
              לחנות החוברות
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function LomdaPrepBooks({ plans }: { plans: MarketingPlansByTypeAndStep }) {
  const sortedSteps = Object.keys(plans.book)
    .map(Number)
    .filter((step) => Number.isFinite(step))
    .sort((a, b) => a - b);

  const allBooks = sortedSteps.flatMap((step) => plans.book[step] ?? []);

  if (allBooks.length === 0) {
    return null;
  }

  return (
    <section
      id="books"
      className="w-full py-14 px-4 sm:px-8 bg-amber-50/40 dark:bg-amber-950/10 border-t border-amber-100 dark:border-amber-900/40"
      dir="rtl"
      aria-label="ספרי וחוברות הכנה למבחן מחוננים"
    >
      <div className="max-w-screen-xl mx-auto">
        <header className="flex flex-col items-center text-center gap-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" aria-hidden />
            חוברות הכנה
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
            כל חוברת הכנה — מה כלול ולמי היא מתאימה
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            לכל שלב יש חוברת ייעודית עם סימולציות בפורמט המבחן. אפשר לרכוש לבד או לשלב עם
            מנוי דיגיטלי בלומדה — כך מקבלים גם תרגול אדפטיבי וגם מבחן אמיתי על נייר.
          </p>
        </header>

        <div className={cn("grid grid-cols-1 gap-5", allBooks.length > 1 && "lg:grid-cols-2")}> 
          {allBooks.map((plan) => (
            <BookCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-sm">
          <Link
            href="/tarugol-ve-simulatzia"
            className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold hover:underline"
          >
            איך משלבים חוברת עם הלומדה?
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
