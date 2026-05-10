import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ChevronLeft } from "lucide-react";

import { buildMetadata, buildFAQJsonLd, buildCourseJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageTemplate } from "../_components/PageTemplate";

export const metadata: Metadata = buildMetadata({
  title: "מבחן מחוננים שלב ב׳ — הכנה | סמארטי",
  description:
    "הכנה למבחן מחוננים שלב ב׳: תרגול אנלוגיות מילוליות, סדרות צורניות, חשיבה לוגית ומרחבית. שאלות לדוגמה ומבחנים מלאים.",
  keywords: [
    "מבחן מחוננים שלב ב",
    "הכנה למבחן מחוננים שלב ב",
    "אנלוגיות מילוניות מחוננים",
    "סדרות צורניות מחוננים",
    "חשיבה לוגית מחוננים",
  ],
  canonical: "https://smarti.co.il/shlab-b",
});

const carouselSlides = [
  {
    title: "מבחן מחוננים שלב ב׳",
    description:
      "אנלוגיות, סדרות צורניות וחשיבה לוגית — ההכנה המקיפה לשלב המאתגר",
    imageSrc: "/smarti_step2.webp",
  },
  {
    title: "חיזוק יכולות קוגניטיביות",
    description:
      "תרגול שיטתי בחשיבה מרחבית, יוצא דופן ומטריצות — כדי להגיע מוכן",
    imageSrc: "/smarti_step1.webp",
  },
  {
    title: "הכנה למבחן מחוננים שלב ב׳ כיתה ג׳",
    description: "סימולציות מלאות בפורמט המבחן, עם ניתוח תשובות ומשוב",
    imageSrc: "/smarti_step3.webp",
  },
];

const faqData = [
  {
    question: "מה ההבדל בין שלב א׳ לשלב ב׳?",
    answer:
      "שלב א׳ בוחן הבנת הנקרא וחשבון; שלב ב׳ בוחן יכולות קוגניטיביות: אנלוגיות, סדרות צורניות, חשיבה מרחבית ולוגית.",
  },
  {
    question: "מי נבחן בשלב ב׳?",
    answer:
      "רק תלמידים שעברו את סף שלב א׳ מוזמנים לשלב ב׳. המבחן נערך בדרך כלל בתחילת כיתה ג׳.",
  },
  {
    question: "כמה זמן להכין לשלב ב׳?",
    answer:
      "מומלץ 2–3 חודשים של תרגול ממוקד. ילדים שכבר הכינו לשלב א׳ יכולים להסתפק בחודש–חודשיים נוסף.",
  },
  {
    question: "מה זה אנלוגיות מילוניות במבחן מחוננים?",
    answer:
      "אנלוגיה היא יחס בין זוגות מילים: 'כלב הוא ל-נביחה כמו חתול ל-?'. שאלות אלו בוחנות חשיבה יחסית ואוצר מילים.",
  },
  {
    question: "מה זה יוצא דופן במבחן מחוננים?",
    answer:
      "שאלת 'יוצא דופן' מציגה 4–5 פריטים ומבקשת לזהות מי אינו שייך לקבוצה לפי קטגוריה לוגית.",
  },
  {
    question: "איפה מתרגלים סימולציה לשלב ב׳?",
    answer:
      "במערכת סמארטי ובעמוד התרגול שלנו — ניתן לשלב תרגול לפי נושא ואז מבחן מלא באורך דומה למבחן האמיתי.",
  },
  {
    question: "מה ההבדל בין הכנה למבחן מחוננים שלב ב לבין שלב א?",
    answer:
      "שלב א׳ מתמקד בהבנת הנקרא וחשבון; שלב ב׳ בוחן יותר משימות קוגניטיביות כמו אנלוגיות, מטריצות וחשיבה מרחבית.",
  },
];

const topics = [
  {
    title: "אנלוגיות מילוניות",
    desc: "יחסים בין מושגים: כמו חתול ל-נביחה. בוחן אוצר מילים וחשיבה יחסית",
  },
  {
    title: "סדרות צורניות",
    desc: "זיהוי דפוסים בצורות, גדלים וצבעים — המשך סדרה ויוצא דופן",
  },
  {
    title: "חשיבה לוגית",
    desc: "הסקת מסקנות, כלל ויוצא מן הכלל, סדר הגיוני",
  },
  {
    title: "חשיבה מרחבית",
    desc: "קיפולי נייר, סיבובים, מראה — זיהוי צורות ממבטים שונים",
  },
  {
    title: "השלמת משפטים",
    desc: "בחירת המילה המתאימה ביותר להשלמת משפט בהקשר",
  },
  {
    title: "מטריצות",
    desc: "השלמת טבלת צורות לפי הדפוס הנסתר בשורות ובעמודות",
  },
];

const sampleQuestions = [
  {
    q: "ספינה : מים :: מטוס : ___",
    a: "אוויר (ספינה נעה במים; מטוס נע באוויר)",
    topic: "אנלוגיות",
  },
  {
    q: "איזה מהבאים יוצא דופן? עגבנייה, מלפפון, תפוח, מלון, קישוא",
    a: "תפוח (היחיד שאינו ירק — פרי)",
    topic: "יוצא דופן",
  },
  {
    q: "אם כל הכלבים הם חיות, וחיות נושמות — האם כל הכלבים נושמים?",
    a: "כן — זו הסקת מסקנה לוגית (סילוגיזם פשוט)",
    topic: "חשיבה לוגית",
  },
];

export default function ShlabBPage() {
  return (
    <>
      <Script
        id="ld-faq-shlab-b"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />
      <Script
        id="ld-course-shlab-b"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCourseJsonLd({
              name: "הכנה למבחן מחוננים שלב ב׳",
              description:
                "תרגול אנלוגיות, סדרות צורניות, חשיבה לוגית ומרחבית למבחן שלב ב׳",
              url: "https://smarti.co.il/shlab-b",
            })
          ),
        }}
      />

      <PageTemplate
        carouselSlides={carouselSlides}
        heroSlot={
          <div className="flex flex-col items-center gap-5 w-full max-w-[420px] text-center" dir="rtl">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-slate-200 leading-snug">
              מבחן מחוננים שלב ב׳
              <br />
              <span className="text-green-600">הכנה מתקדמת</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              הכנה לשלב ב׳ — אנלוגיות, סדרות צורניות, חשיבה לוגית ומרחבית.
              כל הנושאים שנבחנים בסימולציות מלאות.
            </p>
            <Button variant="secondary" size="lg" className="w-full" asChild>
              <Link href="/learn">כניסה למערכת — התחל עכשיו</Link>
            </Button>
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
            מה בודק מבחן מחוננים שלב ב׳?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-2xl">
            שלב ב׳ בוחן יכולות קוגניטיביות גבוהות שאינן תלויות ישירות בחומר
            הלימודים — חשיבה אנלוגית, מרחבית ולוגית.
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

        <section
          id="shlav-b-depth"
          className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-10 border-t border-slate-100 dark:border-slate-800 scroll-mt-20"
          dir="rtl"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-4">
            הכנה למבחן מחוננים שלב ב׳ — נושאי ליבה לתרגול
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-3xl">
            כשמחפשים <strong>מבחן מחוננים שלב ב כיתה ג</strong> או <strong>סימולציה מבחן מחוננים</strong>,
            כדאי לפרק את ההכנה: <strong>אנלוגיות מחוננים שלב ב</strong>,{" "}
            <strong>סדרות צורניות מחוננים</strong>, <strong>חשיבה לוגית מחוננים</strong>,{" "}
            <strong>חשיבה מרחבית מחוננים</strong> ו<strong>מטריצות מחוננים</strong> — כל אחד עם תרגול
            קצר ולא רק סימולציה אחת לפני המבחן.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 max-w-4xl text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-neutral-700 dark:text-slate-200">אנלוגיות מילוליות מחוננים:</strong>{" "}
              תרגול יומי של זוגות מילים ובניית משפט השלמה מחזק את המהירות.
            </p>
            <p>
              <strong className="text-neutral-700 dark:text-slate-200">יוצא דופן מחוננים:</strong>{" "}
              זיהוי פריט שלא שייך לקבוצה דורש קטגוריות מופשטות — כדאי לפתוח עם דוגמאות קלות.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="default" size="sm" asChild>
              <Link href="/kita-gimel">כיתה ג׳ — עומק נוסף →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/tarugol-ve-simulatzia">מסלול תרגול וסימולציה →</Link>
            </Button>
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
              שאלות לדוגמה — מבחן מחוננים שלב ב׳
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
              <Button variant="secondary" asChild>
                <Link href="/learn">לאלפי שאלות נוספות במערכת ←</Link>
              </Button>
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
            מבחן לדוגמא — שלב ב׳
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            סימולציות מלאות בפורמט שלב ב׳ — עם תזמון, אנלוגיות, סדרות ויוצא
            דופן, ניתוח תשובות ומשוב מפורט.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link href="/learn">כניסה לסימולציה המלאה</Link>
          </Button>
        </section>

        {/* ─── FAQ ───────────────────── */}
        <section
          className="w-full bg-slate-50 dark:bg-slate-900/60 border-y border-slate-100 dark:border-slate-800 py-10 px-4 sm:px-8"
          dir="rtl"
        >
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-6">
              שאלות ותשובות על מבחן מחוננים שלב ב׳
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
              <Link href="/kita-gimel">כיתה ג׳ — שלב ב׳ →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/acharei-mevchan">מה קורה אחרי המבחן? →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/mitztaynim">מצטיינים מול מחוננים →</Link>
            </Button>
          </div>
        </section>
      </PageTemplate>
    </>
  );
}
