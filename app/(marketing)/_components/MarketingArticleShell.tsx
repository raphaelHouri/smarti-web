import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type FaqItem = { question: string; answer: string };

type MarketingArticleShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  faq: FaqItem[];
};

export function MarketingArticleShell({ title, subtitle, children, faq }: MarketingArticleShellProps) {
  return (
    <>
      {/* Page header */}
      <header className="w-full border-b border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-white to-green-50/60 dark:from-emerald-950/50 dark:via-background dark:to-background">
        {/* top accent line */}
        <div className="h-1 w-full bg-gradient-to-l from-emerald-400 via-green-400 to-emerald-300" />
        <div className="max-w-3xl mx-auto px-4 py-10 text-center" dir="rtl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-slate-50 mb-3 leading-snug px-1 break-words">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm sm:text-base text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed max-w-2xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full min-w-0" dir="rtl">
        <article className="space-y-8 text-sm sm:text-base text-neutral-700 dark:text-slate-300 leading-relaxed break-words overflow-x-clip">
          {children}
        </article>
      </div>

      {/* FAQ */}
      <section
        className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-background border-y border-slate-100 dark:border-slate-800 py-12 px-4 sm:px-6"
        dir="rtl"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-1 h-6 rounded-full bg-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-800 dark:text-slate-100">
              שאלות נפוצות
            </h2>
          </div>
          <div className="flex flex-col gap-2.5 max-w-2xl">
            {faq.map((f, i) => (
              <details
                key={i}
                className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
              >
                <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer font-semibold text-sm text-neutral-800 dark:text-slate-100 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 list-none min-h-[44px] transition-colors">
                  <span>{f.question}</span>
                  <ChevronLeft className="w-4 h-4 text-emerald-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-slate-100 dark:border-slate-800">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA row */}
      <section className="w-full bg-gradient-to-l from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row flex-wrap gap-3 justify-center" dir="rtl">
          <Button variant="secondary" size="lg" asChild>
            <Link href="/learn">כניסה לתרגול במערכת</Link>
          </Button>
          <Button variant="primaryOutline" asChild>
            <Link href="/">חזרה לעמוד הבית</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

/** שימוש עקבי לכותרות משנה בתוך מדריכים */
export function GuideH2({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-slate-50 scroll-mt-24 pt-2 break-words border-b border-slate-100 dark:border-slate-800 pb-2"
    >
      {children}
    </h2>
  );
}

export function GuideP({ children }: { children: React.ReactNode }) {
  return <p className="text-neutral-600 dark:text-slate-400 leading-loose">{children}</p>;
}

export function GuideUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="space-y-2 text-neutral-600 dark:text-slate-400 pr-1">
      {children}
    </ul>
  );
}
