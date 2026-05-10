import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildFAQJsonLd, buildCourseJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { PageTemplate } from "../_components/PageTemplate";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = buildMetadata({
  title: "מבחן מחוננים שלב א׳ — הכנה לכיתה ב׳ | סמארטי",
  description:
    "הכנה למבחן מחוננים שלב א׳ לכיתה ב׳: תרגול אדפטיבי בהבנת הנקרא, חשבון ובעיות מילוניות. שאלות לדוגמה, מבחנים לתרגול ומדריכים להורים.",
  keywords: [
    "מבחן מחוננים שלב א",
    "מבחן מחוננים כיתה ב",
    "הכנה למבחן מחוננים שלב א כיתה ב",
    "הבנת הנקרא מחוננים",
    "חשבון מחוננים כיתה ב",
  ],
  canonical: "https://smarti.co.il/shlab-a",
});

const carouselSlides = [
  {
    title: "מבחן מחוננים שלב א׳ — כיתה ב׳",
    description:
      "שאלות הבנת הנקרא וחשבון מותאמות לגיל, בפורמט זהה למבחן האמיתי",
    imageSrc: "/smarti_step1.png",
  },
  {
    title: "תרגול אדפטיבי לפי רמת הילד",
    description:
      "המערכת מזהה חולשות ומחזקת אותן — תרגול ממוקד שמביא לתוצאות",
    imageSrc: "/smarti_step2.png",
  },
  {
    title: "הכנה למבחן מחוננים כיתה ב׳ — מתחילים עכשיו",
    description: "אלפי שאלות, סימולציות ומעקב התקדמות בזמן אמת",
    imageSrc: "/smarti_step3.png",
  },
];

const faqData = [
  {
    question: "מה בודק מבחן מחוננים שלב א׳?",
    answer:
      "שלב א׳ בודק הבנת הנקרא, חשבון ובעיות מילוניות. המבחן מיועד לתלמידי כיתה ב׳ ונערך בדרך כלל באוקטובר–נובמבר.",
  },
  {
    question: "מתי נערך מבחן שלב א׳?",
    answer:
      "המבחן נערך בדרך כלל בתחילת כיתה ב׳, בחודשים אוקטובר–נובמבר. יש לבדוק את מועד הדיוק עם בית הספר.",
  },
  {
    question: "כמה שאלות יש במבחן שלב א׳?",
    answer:
      "המבחן כולל בדרך כלל 40–50 שאלות: כחצי הבנת הנקרא וכחצי חשבון ובעיות מילוניות. משך המבחן כ-90 דקות.",
  },
  {
    question: "האם ניתן לעבור שלב א׳ ללא הכנה?",
    answer:
      "כן, אך הכנה מראש מעלה משמעותית את הסיכויים. ילדים שמתאמנים מראש מכירים את פורמט השאלות ומרגישים בטוחים יותר.",
  },
  {
    question: "מה הציון העובר בשלב א׳?",
    answer:
      "אין ציון קבוע — הסיווג מבוסס על אחוזון יחסי למגישים. בדרך כלל צריך להיות ב-85%+ כדי לעבור לשלב ב׳.",
  },
  {
    question: "איפה נמצא תרגול מבחן מחוננים שלב א׳?",
    answer:
      "בסמארטי יש לומדה עם שאלות לפי נושא, וסימולציות מלאות — נכנסים דרך 'כניסה ללומדה' או דרך העמוד תרגול וסימולציה באתר.",
  },
  {
    question: "האם יש שאלות לדוגמה מבחן מחוננים חינם?",
    answer:
      "כאן בעמוד יש דוגמאות; לעוד חומר והסבר על PDF רשמי ראו את העמוד 'שאלות לדוגמה' במרכז המדריכים.",
  },
  {
    question: "מה זה הכנה למבחן מחוננים שלב א כיתה ב בפועל?",
    answer:
      "שילוב של תרגול יומיומי קצר (חשבון והבנת הנקרא), סימולציה שבועית, ושיח עם בית הספר — לא רק צבירת ניקוד אלא גם ביטחון בפורמט.",
  },
];

const topics = [
  {
    title: "הבנת הנקרא",
    desc: "קריאת טקסטים קצרים ומענה על שאלות הבנה, מסקנות ופרטי מידע",
    keywords: ["הבנת הנקרא מחוננים", "שאלות הבנת הנקרא מחוננים"],
  },
  {
    title: "חשבון",
    desc: "חשבון בסיסי ומתקדם: חיבור, חיסור, כפל, חילוק, שברים",
    keywords: ["חשבון מחוננים כיתה ב", "תרגילי חשבון מחוננים"],
  },
  {
    title: "בעיות מילוניות",
    desc: "פתרון בעיות מתמטיות המנוסחות בשפה, דורשות הבנה והמרה",
    keywords: ["בעיות מילוניות מחוננים", "חשיבה מתמטית מחוננים"],
  },
  {
    title: "סדרות מספרים",
    desc: "זיהוי דפוסים בסדרות מספריות — ממה שנראה פשוט עד מאתגר",
    keywords: ["סדרות מספרים מחוננים", "חידות מחוננים"],
  },
];

const sampleQuestions = [
  {
    q: "בשורה: 2, 5, 8, 11, __ מה המספר הבא?",
    a: "14 (כל פעם מוסיפים 3)",
    topic: "סדרות מספרים",
  },
  {
    q: "ל-12 ילדים יש 3 עוגיות כל אחד. כמה עוגיות בסך הכל?",
    a: "36 (12 × 3 = 36)",
    topic: "חשבון",
  },
  {
    q: "דנה קראה 40 עמודים. ספרה כולל 100 עמודים. כמה נשאר לה לקרוא?",
    a: "60 עמודים (100 − 40 = 60)",
    topic: "בעיות מילוניות",
  },
];

export default function ShlabAPage() {
  return (
    <>
      <Script
        id="ld-faq-shlab-a"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />
      <Script
        id="ld-course-shlab-a"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCourseJsonLd({
              name: "הכנה למבחן מחוננים שלב א׳ — כיתה ב׳",
              description:
                "תרגול אדפטיבי בהבנת הנקרא, חשבון ובעיות מילוניות לכיתה ב׳",
              url: "https://smarti.co.il/shlab-a",
            })
          ),
        }}
      />

      <PageTemplate
        carouselSlides={carouselSlides}
        heroSlot={
          <div className="flex flex-col items-center gap-5 w-full max-w-[420px] text-center" dir="rtl">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 dark:text-slate-200 leading-snug">
              מבחן מחוננים שלב א׳
              <br />
              <span className="text-green-600">הכנה לכיתה ב׳</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              הכנה ממוקדת לשלב הראשון — הבנת הנקרא, חשבון ובעיות מילוניות.
              מאות שאלות לדוגמה וסימולציות מלאות.
            </p>
            <Button variant="secondary" size="lg" className="w-full" asChild>
              <Link href="/learn">כניסה למערכת — התחל עכשיו</Link>
            </Button>
            <Button variant="primaryOutline" size="default" asChild>
              <Link href="#practice">לדוגמאות חינמיות ↓</Link>
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
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-6">
            מה בודק מבחן מחוננים שלב א׳?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-2xl">
            מבחן שלב א׳ מיועד לתלמידי כיתה ב׳ ובוחן שתי יכולות עיקריות:
            הבנת הנקרא וחשבון. המבחן נערך בתנאי לחץ ומצריך מוכנות לפורמט.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* ─── עומק SEO: נושאי מבחן ותרגול ─ */}
        <section
          id="mivhan-depth"
          className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-10 border-t border-slate-100 dark:border-slate-800 scroll-mt-20"
          dir="rtl"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-700 dark:text-slate-200 mb-4">
            תרגול מבחן מחוננים שלב א׳ — נושא אחר נושא
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 leading-relaxed max-w-3xl">
            כשמחפשים <strong>הכנה למבחן מחוננים שלב א כיתה ב</strong> או <strong>תרגול מבחן מחוננים</strong>,
            כדאי לפרק את השבוע לפי נושאים. כך גם מכסים את{" "}
            <strong>מבחן מחוננים שלב א</strong> בצורה שיטתית וגם שומרים על ריכוז הילד.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
            <div>
              <h3 className="font-semibold text-neutral-700 dark:text-slate-200 mb-2">
                הבנת הנקרא מחוננים
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong>שאלות הבנת הנקרא מחוננים</strong> דורשות זיהוי עיקר, פרט ומסקנה. מומלץ
                לקרוא קטעים קצרים ולתרגל סימון במילות מפתח לפני שעונים.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-700 dark:text-slate-200 mb-2">
                חשבון מחוננים כיתה ב
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                יש לחזק חיבור, חיסור, כפל וחילוק בשברים — שלב בסיסי לפני{" "}
                <strong>בעיות מילוליות מחוננים</strong> שמצריכות תרגום מילה למשוואה.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-700 dark:text-slate-200 mb-2">
                סדרות מספרים מחוננים וחידות
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                זיהוי דפוס בין מספרים משפר גם את ה<strong>חידות מחוננים</strong> וגם את{" "}
                <strong>תרגילי אי שוויון מחוננים</strong> כשמופיעים בתור סדרות או השוואות.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-700 dark:text-slate-200 mb-2">
                מבחן מחוננים 2026 ומיקוד
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                בניית תכנית ל<strong>מבחן מחוננים 2026</strong> או לשנה הנוכחית מתחילה מההנחיות
                הרשמיות; התרגול בסמארטי מתעדכן כדי לשקף פורמט ורמות קושי מקובלות.
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="default" size="sm" asChild>
              <Link href="/sheelot-dugma">שאלות לדוגמה נוספות →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/tarugol-ve-simulatzia">תרגול וסימולציה →</Link>
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
              שאלות לדוגמה — מבחן מחוננים שלב א׳
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
            מבחן לדוגמא — שלב א׳
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            במערכת סמארטי תמצאו סימולציות מלאות בפורמט המבחן האמיתי — עם תזמון,
            ניתוח תשובות ומשוב מפורט.
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
              שאלות ותשובות על מבחן מחוננים בכיתה ב׳
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
        <section
          className="w-full max-w-screen-lg mx-auto px-4 sm:px-8 py-8"
          dir="rtl"
        >
          <p className="text-sm text-muted-foreground mb-3">דפים קשורים:</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="default" size="sm" asChild>
              <Link href="/shlab-b">מבחן מחוננים שלב ב׳ →</Link>
            </Button>
            <Button variant="default" size="sm" asChild>
              <Link href="/kita-gimel">כיתה ג׳ — שלב ב׳ →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/madriche-holim">מדריך הורים →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/sheelot-dugma">שאלות לדוגמה →</Link>
            </Button>
            <Button variant="primaryOutline" size="sm" asChild>
              <Link href="/tarugol-ve-simulatzia">תרגול וסימולציה →</Link>
            </Button>
          </div>
        </section>
      </PageTemplate>
    </>
  );
}
