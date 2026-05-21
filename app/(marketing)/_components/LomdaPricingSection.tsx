import { Rocket } from "lucide-react";
import type { MarketingPlansByTypeAndStep } from "@/db/queries";
import { LomdaPricingClient } from "./LomdaPricingClient";

function hasAnyPlan(plans: MarketingPlansByTypeAndStep): boolean {
  const sys = Object.values(plans.system).flat();
  const books = Object.values(plans.book).flat();
  return sys.length > 0 || books.length > 0;
}

export function LomdaPricingSection({ plans }: { plans: MarketingPlansByTypeAndStep }) {
  if (!hasAnyPlan(plans)) {
    return null;
  }

  return (
    <section
      id="pricing"
      className="w-full py-14 px-4 sm:px-8 bg-slate-50 dark:bg-background border-t border-slate-100 dark:border-slate-800"
      dir="rtl"
      aria-label="מחירים וחבילות הלומדה"
    >
      <div className="max-w-screen-xl mx-auto">
        <header className="flex flex-col items-center text-center gap-3 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
            <Rocket className="w-3.5 h-3.5" aria-hidden />
            מחירים שקופים
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">מחירים וחבילות</h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
            המסלולים המומלצים שלנו לפי שלב. כוללים גישה מלאה ללומדה ודוחות התקדמות. לפירוט נרחב, תקופות נוספות והוספת חוברות — מעבר מהיר לחנות.
          </p>
        </header>

        <LomdaPricingClient plans={plans} />
      </div>
    </section>
  );
}

