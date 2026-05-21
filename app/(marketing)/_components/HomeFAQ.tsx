"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { homeMarketingFaq } from "../_data/homeFaq";

const remainingFaq = homeMarketingFaq.slice(5);

export function HomeFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-10 px-4 sm:px-6" dir="rtl">
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-block w-1 h-5 rounded-full bg-emerald-400" />
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-slate-100">
          שאלות נפוצות
        </h2>
      </div>
      <ul className="flex flex-col gap-2 mb-4">
        {remainingFaq.map((faq, i) => (
          <li
            key={i}
            className={cn(
              "rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-colors",
              open === i
                ? "border-emerald-300 dark:border-emerald-700 shadow-sm"
                : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            )}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              className="w-full flex items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold text-neutral-800 dark:text-slate-100 text-right hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors min-h-[44px]"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  "w-4 h-4 flex-shrink-0 transition-transform duration-200",
                  open === i ? "text-emerald-500 rotate-180" : "text-neutral-400"
                )}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-slate-100 dark:border-slate-800">
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
            )}
          </li>
        ))}
      </ul>
      <Link
        href="/faq"
        className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
      >
        לכל השאלות והתשובות
        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
      </Link>
    </section>
  );
}
