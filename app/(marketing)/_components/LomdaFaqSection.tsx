"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { lomdaFaq } from "../_data/lomdaFaq";

export function LomdaFaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="w-full py-14 px-4 sm:px-8 bg-white dark:bg-background border-t border-slate-100 dark:border-slate-800"
      dir="rtl"
      aria-label="שאלות נפוצות על הלומדה והרכישה"
    >
      <div className="max-w-screen-md mx-auto">
        <header className="flex flex-col items-center text-center gap-3 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden />
            שאלות נפוצות
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
            לפני שמחליטים — כל מה ששואלים אותנו
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            רכישה, התקדמות, התאמה לילד וקבוצת ההורים — תשובות ישירות בלי תנאים קטנים.
          </p>
        </header>

        <ul className="flex flex-col gap-2.5">
          {lomdaFaq.map((faq, i) => {
            const isOpen = open === i;
            return (
              <li
                key={faq.question}
                className={cn(
                  "rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-colors",
                  isOpen
                    ? "border-emerald-300 dark:border-emerald-700 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-sm sm:text-base font-semibold text-neutral-800 dark:text-slate-100 text-right hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors min-h-[48px]"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                      isOpen ? "text-emerald-500 rotate-180" : "text-neutral-400",
                    )}
                  />
                </button>
                {isOpen ? (
                  <div className="faq-answer px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-slate-100 dark:border-slate-800">
                    <p>{faq.answer}</p>
                    {faq.href ? (
                      <Link
                        href={faq.href}
                        className="inline-block mt-2 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                      >
                        קרא עוד ←
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            לכל השאלות והתשובות באתר
            <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
          </Link>
        </div>
      </div>
    </section>
  );
}
