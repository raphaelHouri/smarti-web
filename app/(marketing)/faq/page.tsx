import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronLeft, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildMetadata,
  buildFAQJsonLd,
  buildArticleJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";

import { faqAllData, totalFaqCount } from "../_data/faqAll";

const PAGE_URL = "https://smarti.co.il/faq";
const PAGE_TITLE =
  "שאלות ותשובות על מבחני מחוננים ומצטיינים — סמארטי";
const PAGE_DESCRIPTION =
  "מדריך FAQ מלא להכנה למבחני מחוננים: שלב א׳, שלב ב׳, אחוזונים, הכנה לפי כיתה, מסלולי מצטיינים, מבחני קבלה לחטיבת הביניים, תוצאות וערעור — כל מה שהורים שואלים.";

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  canonical: PAGE_URL,
  keywords: [
    "שאלות ותשובות מבחן מחוננים",
    "FAQ מחוננים",
    "מבחן מחוננים שלב א",
    "מבחן מחוננים שלב ב",
    "אחוזון 97 מחוננים",
    "מצטיינים מחוננים הבדל",
    "כיתות מסלול מופת",
    "מועד ב מחוננים",
    "ערעור מבחן מחוננים",
    "תוצאות מבחן מחוננים",
  ],
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "סמארטי",
      item: "https://smarti.co.il",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "שאלות ותשובות",
      item: PAGE_URL,
    },
  ],
};

export default function FaqPage() {
  const allItems = faqAllData.flatMap((c) => c.items);

  return (
    <>
      <Script
        id="ld-faq-all"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFAQJsonLd(allItems)),
        }}
      />
      <Script
        id="ld-faq-article"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: PAGE_TITLE,
              description: PAGE_DESCRIPTION,
              url: PAGE_URL,
            })
          ),
        }}
      />
      <Script
        id="ld-faq-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <Script
        id="ld-faq-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebSiteJsonLd()),
        }}
      />

      {/* Hero */}
      <header className="w-full border-b border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50 via-white to-green-50/60 dark:from-emerald-950/50 dark:via-background dark:to-background">
        <div className="h-1 w-full bg-gradient-to-l from-emerald-400 via-green-400 to-emerald-300" />
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-14 text-center" dir="rtl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold tracking-wide mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            שאלות נפוצות
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-slate-50 mb-4 leading-tight break-words">
            שאלות ותשובות על מבחני מחוננים ומצטיינים
          </h1>
          <p className="text-base sm:text-lg text-emerald-800/70 dark:text-emerald-200/60 leading-relaxed max-w-2xl mx-auto">
            המדריך המלא להורים — {totalFaqCount} שאלות ותשובות על שלב א׳, שלב ב׳, מצטיינים,
            כיתות מסלול ותוכניות העשרה. מידע מתומצת ומדויק לכל שכבת גיל.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12 w-full min-w-0" dir="rtl">
        {/* Table of contents */}
        <nav
          className="rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 sm:p-6 mb-10"
          aria-label="תוכן עניינים"
        >
          <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
            <span className="inline-block w-1 h-5 rounded-full bg-emerald-400" />
            תוכן עניינים
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {faqAllData.map((cat, i) => (
              <li key={cat.id}>
                <a
                  href={`#${cat.id}`}
                  className="group flex items-baseline gap-2 text-sm text-neutral-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1"
                >
                  <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="group-hover:underline underline-offset-2 break-words">
                    {cat.title}
                  </span>
                  <span className="ms-auto text-xs text-muted-foreground flex-shrink-0">
                    {cat.items.length}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Categories */}
        <div className="space-y-12">
          {faqAllData.map((cat, catIndex) => (
            <section
              key={cat.id}
              id={cat.id}
              className="scroll-mt-24 break-words"
              aria-labelledby={`${cat.id}-heading`}
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                  {String(catIndex + 1).padStart(2, "0")}
                </span>
                <h2
                  id={`${cat.id}-heading`}
                  className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-slate-50 leading-tight break-words"
                >
                  {cat.title}
                </h2>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-5 ps-7">
                {cat.description}
              </p>

              <div className="flex flex-col gap-2.5">
                {cat.items.map((item, i) => (
                  <details
                    key={i}
                    className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
                  >
                    <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 cursor-pointer font-semibold text-sm sm:text-base text-neutral-800 dark:text-slate-100 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 list-none min-h-[48px] transition-colors">
                      <span className="break-words">{item.question}</span>
                      <ChevronLeft className="w-4 h-4 text-emerald-500 group-open:rotate-90 transition-transform flex-shrink-0" />
                    </summary>
                    <div className="px-4 sm:px-5 pb-4 pt-2 text-sm sm:text-[0.95rem] text-neutral-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                      <p className="break-words">{item.answer}</p>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          קרא עוד במדריך המלא
                          <ChevronLeft className="w-3 h-3" />
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Related guides */}
      <section
        className="w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/60 dark:to-background border-y border-slate-100 dark:border-slate-800 py-12 px-4 sm:px-6"
        dir="rtl"
        aria-label="מדריכים מורחבים"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-1 h-6 rounded-full bg-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-800 dark:text-slate-100">
              מדריכים מורחבים
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            לקריאה מעמיקה לפי נושא — קישורים למדריכים המלאים שלנו.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { href: "/shlab-a", title: "שלב א׳ — מידע מלא" },
              { href: "/shlab-b", title: "שלב ב׳ — מידע מלא" },
              { href: "/kita-gimel", title: "כיתה ג׳ — שלב ב׳" },
              { href: "/madriche-holim", title: "מדריך הורים" },
              { href: "/tarugol-ve-simulatzia", title: "תרגול וסימולציה" },
              { href: "/sheelot-dugma", title: "שאלות לדוגמה" },
              { href: "/mitztaynim", title: "מחוננים ומצטיינים" },
              { href: "/acharei-mevchan", title: "אחרי המבחן" },
              { href: "/misgeret-mechonanim", title: "מקורות משרד החינוך" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm transition-all"
              >
                <span className="text-sm font-bold text-neutral-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors break-words">
                  {link.title}
                </span>
                <ChevronLeft className="w-4 h-4 text-neutral-400 group-hover:text-emerald-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="w-full py-14 px-4 text-center bg-gradient-to-br from-emerald-500 to-green-500 dark:from-emerald-700 dark:to-green-700"
        dir="rtl"
        aria-label="קריאה לפעולה"
      >
        <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            עדיין יש שאלה?
          </h2>
          <p className="text-sm text-white/85 leading-relaxed">
            הצטרפו ללומדה והתחילו לתרגל — אלפי שאלות, סימולציות, מעקב התקדמות והדרכת הורים.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg"
              asChild
            >
              <Link href="/learn">כניסה ללומדה</Link>
            </Button>
            <Button
              size="lg"
              variant="primaryOutline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link href="/sheelot-dugma">שאלות לדוגמה חינם</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
