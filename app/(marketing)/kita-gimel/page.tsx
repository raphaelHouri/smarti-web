import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronLeft } from "lucide-react";

import { buildMetadata, buildFAQJsonLd, buildCourseJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageTemplate } from "../_components/PageTemplate";
import { LearnEntryButton } from "../_components/LearnEntryButton";

export const metadata: Metadata = buildMetadata({
  title: "מבחן מחוננים כיתה ג׳ — שלב ב׳ מתקדם | סמארטי",
  description:
    "הכנה למבחן מחוננים כיתה ג׳ — שלב ב׳ מתקדם: תרגול אנלוגיות, מטריצות, חשיבה מרחבית ולוגית ברמה גבוהה. סימולציות מלאות ומותאמות.",
  keywords: [
    "מבחן מחוננים כיתה ג",
    "מבחן מחוננים שלב ב כיתה ג",
    "הכנה למבחן מחוננים שלב ב",
    "אנלוגיות מחוננים שלב ב",
    "מטריצות מחוננים",
    "חשיבה מרחבית מחוננים",
  ],
  canonical: "https://smarti.co.il/kita-gimel",
});

const carouselSlides = [
  {
    title: "מבחן מחוננים כיתה ג׳ — שלב ב׳",
    description:
      "ההכנה המתקדמת ביותר לשלב ב׳: מטריצות, אנלוגיות מורכבות וחשיבה מרחבית",
    imageSrc: "/smarti_step3.webp",
  },
  {
    title: "הכנה למבחן מחוננים שלב ב׳ — כיתה ג׳",
    description:
      "מתרגלים בפורמט המבחן האמיתי עם שאלות ברמת קושי עולה",
    imageSrc: "/smarti_step2.webp",
  },
  {
    title: "סימולציות מלאות לשלב ב׳",
    description:
      "מבחני תרגול מלאים עם תזמון, ניתוח תשובות ומשוב מפורט",
    imageSrc: "/smarti_step1.webp",
  },
];

const faqData = [
  {
    question: "מה נבחן בשלב ב׳ לכיתה ג׳?",
    answer:
      "שלב ב׳ בוחן יכולות קוגניטיביות: אנלוגיות מילוניות, סדרות צורניות, מטריצות, חשיבה לוגית ומרחבית, יוצא דופן והשלמת משפטים.",
  },
  {
    question: "מה ההבדל בין שלב ב׳ לכיתה ב׳ לכיתה ג׳?",
    answer:
      "תלמידי כיתה ב׳ שעברו שלב א׳ עוברים לשלב ב׳ בכיתה ב׳ (בדרך כלל פברואר). תלמידי כיתה ג׳ עשויים להיבחן בשלב ב׳ בהמשך, בפורמט זהה.",
  },
  {
    question: "כמה זמן להכין לשלב ב׳ כיתה ג׳?",
    answer:
      "מומלץ 6–8 שבועות של תרגול ממוקד ביכולות הקוגניטיביות הנדרשות. חשוב לתרגל בפורמט המבחן.",
  },
  {
    question: "מה זה מטריצות במבחן מחוננים?",
    answer:
      "מטריצה היא טבלת 3×3 של צורות עם תא חסר. הנבחן צריך לזהות את הדפוס ולמצוא את הצורה המשלימה.",
  },
  {
    question: "האם שלב ב׳ קשה יותר משלב א׳?",
    answer:
      "כן — שלב ב׳ נחשב מאתגר יותר כי הוא בוחן יכולות קוגניטיביות שאינן מלומדות בבית הספר, ומצריך תרגול ייעודי.",
  },
];

const topics = [
  {
    title: "אנלוגיות מילוניות",
    desc: "יחסים בין מושגים ברמה מורכבת — בודק עומק אוצר מילים וחשיבה",
  },
  {
    title: "מטריצות",
    desc: "השלמת טבלת 3×3 של צורות לפי הדפוס הנסתר בשורות ובעמודות",
  },
  {
    title: "חשיבה מרחבית",
    desc: "קיפולים, סיבובים, מראה — זיהוי עצמים ממבטים שונים",
  },
  {
    title: "סדרות צורניות",
    desc: "זיהוי דפוסים בצורות מורכבות ורב-ממדיות",
  },
  {
    title: "חשיבה לוגית",
    desc: "סילוגיזמים, טבלאות אמת וסדרות לוגיות מורכבות",
  },
  {
    title: "יוצא דופן",
    desc: "זיהוי הפריט שאינו שייך לקבוצה לפי קטגוריה מופשטת",
  },
];

const sampleQuestions = [
  {
    q: "ספר הוא לקריאה כמו מחבת היא ל-___",
    a: "בישול (ספר = כלי לקריאה; מחבת = כלי לבישול)",
    topic: "אנלוגיות",
  },
  {
    q: "בטבלת 3×3: בשורה הראשונה — עיגול, ריבוע, משולש. בשורה השנייה — עיגול גדול, ריבוע גדול, ___",
    a: "משולש גדול (הדפוס: צורה + גדול)",
    topic: "מטריצות",
  },
  {
    q: "איזה מהבאים יוצא דופן? בנגיטר, פסנתר, כינור, חליל, תוף",
    a: "תוף — כלי הקשה; שאר הכלים הם מיתרים/נשיפה",
    topic: "יוצא דופן",
  },
];

export default function KitaGimelPage() {
  return (
    <>
      <Script
        id="ld-faq-kita-gimel"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />
      <Script
        id="ld-breadcrumb-kita-gimel"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildBreadcrumbJsonLd([
              { name: "בית", url: "https://smarti.co.il" },
              { name: "הכנה לכיתה ג׳ — שלב ב׳", url: "https://smarti.co.il/kita-gimel" },
            ])
          ),
        }}
      />
      <Script
        id="ld-course-kita-gimel"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCourseJsonLd({
              name: "הכנה למבחן מחוננים כיתה ג׳ — שלב ב׳",
              description:
                "תרגול מתקדם באנלוגיות, מטריצות וחשיבה מרחבית לכיתה ג׳",
              url: "https://smarti.co.il/kita-gimel",
            })
          ),
        }}
      />

      <PageTemplate
        carouselSlides={carouselSlides}
        heroSlot={
          <div className="flex flex-col items-center gap-5 w-full max-w-[420px] text-center" dir="rtl">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-slate-200 leading-snug">
              כיתה ג׳ — שלב ב׳
              <br />
              <span className="text-green-600">הכנה מתקדמת</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              מטריצות, אנלוגיות מורכבות וחשיבה מרחבית — ההכנה המקיפה לשלב ב׳
              ברמת כיתה ג׳.
            </p>
            <LearnEntryButton variant="secondary" size="lg" className="w-full" trackSource="kita_gimel_hero">
              כניסה למערכת — התחל עכשיו
            </LearnEntryButton>
            <Button variant="primaryOutline" size="default" asChild>
              <Link href="#examples">לשאלות לדוגמה ↓</Link>
            </Button>
          </div>
        }
      >
        {/* ─── מה בודק המבחן ──────── */}
        <section
          id="info"
          className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-10 scroll-mt-20"
          dir="rtl"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-4">
            מה בודק מבחן מחוננים שלב ב׳ — כיתה ג׳?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-2xl">
            שלב ב׳ בוחן יכולות קוגניטיביות גבוהות — אנלוגיות, מטריצות,
            חשיבה לוגית ומרחבית. אלו יכולות שמצריכות תרגול ייעודי.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t) => (
              <div
                key={t.title}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
              >
                <h3 className="font-bold text-neutral-700 dark:text-slate-200 mb-1">
                  {t.title}
                </h3>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── שאלות לדוגמה ───────── */}
        <section
          id="examples"
          className="w-full bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800 py-10 px-4 sm:px-8 scroll-mt-20"
          dir="rtl"
        >
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-6">
              שאלות לדוגמה — מבחן מחוננים כיתה ג׳
            </h2>
            <div className="flex flex-col gap-4">
              {sampleQuestions.map((q, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
                    {q.topic}
                  </p>
                  <p className="font-medium text-neutral-700 dark:text-slate-200 mb-2">
                    {q.q}
                  </p>
                  <details className="text-sm text-muted-foreground cursor-pointer">
                    <summary className="text-green-600 dark:text-green-400 font-medium hover:underline">
                      הצג תשובה
                    </summary>
                    <p className="mt-1 pr-2">{q.a}</p>
                  </details>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <LearnEntryButton variant="secondary" trackSource="kita_gimel_more_questions">
                לאלפי שאלות נוספות במערכת ←
              </LearnEntryButton>
            </div>
          </div>
        </section>

        {/* ─── מבחן לדוגמא + CTA ──── */}
        <section
          id="practice"
          className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-10 scroll-mt-20"
          dir="rtl"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-4">
            מבחן לדוגמא — שלב ב׳ כיתה ג׳
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            סימולציה מלאה ברמת כיתה ג׳ — עם אנלוגיות, מטריצות, חשיבה מרחבית,
            תזמון ומשוב מפורט.
          </p>
          <LearnEntryButton variant="secondary" size="lg" trackSource="kita_gimel_simulation">
            כניסה לסימולציה המלאה
          </LearnEntryButton>
        </section>

        {/* ─── FAQ ───────────────────── */}
        <section
          className="w-full bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800 py-10 px-4 sm:px-8"
          dir="rtl"
        >
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-6">
              שאלות ותשובות על מבחן מחוננים כיתה ג׳
            </h2>
            <div className="flex flex-col gap-3 max-w-2xl">
              {faqData.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-4 py-3.5 cursor-pointer font-medium text-sm text-neutral-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 list-none min-h-[44px]">
                    <span>{f.question}</span>
                    <ChevronLeft className="w-4 h-4 text-neutral-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {f.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ─── קישורים לדפים נוספים ── */}
        <section className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-8" dir="rtl">
          <p className="text-sm text-muted-foreground mb-3">דפים קשורים:</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm" asChild>
              <Link href="/shlab-a">מבחן מחוננים שלב א׳ →</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/shlab-b">מבחן מחוננים שלב ב׳ →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/tarugol-ve-simulatzia">תרגול וסימולציה →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/madriche-holim">מדריך הורים →</Link>
            </Button>
          </div>
        </section>
      </PageTemplate>
    </>
  );
}
