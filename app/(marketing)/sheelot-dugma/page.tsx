import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP, GuideUl } from "../_components/MarketingArticleShell";
import { LearnEntryButton } from "../_components/LearnEntryButton";

export const metadata: Metadata = buildMetadata({
  title: "שאלות לדוגמה מבחן מחוננים — תרגול חינם והמשך במערכת | סמארטי",
  description:
    "שאלות לדוגמה מבחן מחוננים: איפה לראות דוגמאות חינם לשלב א׳ ושלב ב׳, איך להתקדם לתרגול מלא, ומה ההבדל בין דוגמאות לבין מבחן מחוננים חינם PDF רשמי ממשרד החינוך.",
  keywords: [
    "שאלות לדוגמה מבחן מחוננים",
    "שאלות לדוגמה מבחן מחוננים חינם",
    "מבחן מחוננים חינם PDF",
    "תרגול מבחן מחוננים",
  ],
  canonical: "https://smarti.co.il/sheelot-dugma",
});

const faqData = [
  {
    question: "איפה יש שאלות לדוגמה מבחן מחוננים בלי תשלום?",
    answer:
      "בעמודי שלב א׳ ושלב ב׳ באתר שלנו יש דוגמאות. למאגר מלא עם משוב ומעקב — נרשמים למערכת דרך כניסה ללומדה.",
  },
  {
    question: "האם יש מבחן מחוננים חינם PDF מהמשרד?",
    answer:
      "מדי פעם מתפרסמים חומרי עזר; חפשו באתר משרד החינוך ובאתר ההורים. אלו לא מחליפים תרגול מגוון במערכת כמו סמארטי.",
  },
  {
    question: "מה ההבדל בין דוגמה בודדת לסימולציה?",
    answer:
      "דוגמה מלמדת סוג שאלה אחד. סימולציה אורכת כמו מבחן אמיתי ומתאמת את הילד ללחץ הכולל.",
  },
  {
    question: "איך לא להסתמך רק על שאלות לדוגמה שמצאתי ברשת?",
    answer:
      "בדקו מקור: שאלות ישנות או לא מאומתות עלולות לטעות את הילד בפורמט. עדיף לשלב מקור מאומת עם תרגול מובנה.",
  },
];

const canonical = "https://smarti.co.il/sheelot-dugma";

export default function SheelotDugmaPage() {
  return (
    <>
      <Script
        id="ld-article-sheelot"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "שאלות לדוגמה מבחן מחוננים — תרגול חינם והמשך",
              description:
                "מדריך למציאת דוגמאות, PDF רשמי, ותרגול במערכת סמארטי.",
              url: canonical,
              datePublished: "2025-09-01",
              dateModified: "2026-05-10",
            })
          ),
        }}
      />
      <Script
        id="ld-faq-sheelot"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="שאלות לדוגמה מבחן מחוננים — מאיפה מתחילים"
        subtitle="במילות חיפוש: שאלות לדוגמה חינם, מבחן מחוננים חינם PDF, ותרגול עמוק — כאן מסבירים איך לשלב אלמנט חינמי עם מערכת תרגול מלאה."
        faq={faqData}
        canonicalUrl={canonical}
      >
        <GuideP>
          חיפוש <strong>שאלות לדוגמה מבחן מחוננים</strong> מוביל לאתרים רבים; חשוב לבחור מקורות עם
          פורמט עדכני ועם <strong>תרגול מבחן מחוננים</strong> שמכסה את כל סוגי המשימות — בשלב א׳: הבנת
          הנקרא, חשבון, בעיות מילוליות, חידות בסגנון <strong>חידות מחוננים</strong> בסדרות מספרים;
          בשלב ב׳: <strong>אנלוגיות מילוליות מחוננים</strong>, סדרות צורניות ועוד.
        </GuideP>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-a#examples">דוגמאות בשלב א׳</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-b#examples">דוגמאות בשלב ב׳</Link>
          </Button>
        </div>

        <section className="space-y-4">
          <GuideH2 id="free-vs-paid">חינם מול מערכת מלאה</GuideH2>
          <GuideUl>
            <li>דוגמאות באתר = טעימה מהפורמט והניסוח.</li>
            <li>
              <LearnEntryButton
                variant="ghost"
                size="sm"
                className="inline h-auto min-h-0 p-0 rounded-none border-0 shadow-none normal-case text-base font-normal text-green-700 dark:text-green-400 underline hover:bg-transparent hover:text-emerald-600 dark:hover:text-emerald-300"
                trackSource="sheelot_dugma_inline"
              >
                הלומדה
              </LearnEntryButton>
              {" "}= מאות שאלות, מעקב רמה והתאמה אישית — כלומר הכנה שלמה ל<strong>מבחן מחוננים שלב א</strong> או{" "}
              <strong>מבחן מחוננים שלב ב</strong>.
            </li>
          </GuideUl>
        </section>

        <section className="space-y-4">
          <GuideH2 id="pdf">מבחן מחוננים חינם PDF</GuideH2>
          <GuideP>
            אם מצאתם קובץ PDF רשמי או מסכם ממשרד החינוך — שמרו אותו לצד התרגול. אל תסמכו רק על עותק
            לא רשמי ברשת. לטווח ארוך עדיף <strong>שאלות לדוגמה מבחן מחוננים חינם</strong> מאומתות +
            משוב בתוך אפליקציה.
          </GuideP>
        </section>

        <section className="space-y-3 border border-green-200/70 dark:border-green-900/40 rounded-xl p-5 bg-green-50/40 dark:bg-green-950/20">
          <p className="font-medium text-neutral-800 dark:text-slate-100">מוכנים לעבור לתרגול מלא?</p>
          <GuideP>שלב הבא: רישום או כניסה אורח — ואז תרגול לפי שלב ולפי רמת הילד.</GuideP>
          <LearnEntryButton variant="secondary" trackSource="sheelot_dugma_cta">
            התחלה במערכת
          </LearnEntryButton>
        </section>
      </MarketingArticleShell>
    </>
  );
}
