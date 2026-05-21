import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP, GuideUl } from "../_components/MarketingArticleShell";
import { LearnEntryButton } from "../_components/LearnEntryButton";

export const metadata: Metadata = buildMetadata({
  title: "מחוננים ומצטיינים — ההבדל, אחוזון והכנה למבחן מצטיינים | סמארטי",
  description:
    "מדריך: מה ההבדל בין מחוננים למצטיינים (אחוזון 97 מול 92–96), איך נראית הכנה למבחן מצטיינים בכיתה ב׳, ואיך סמארטי משלבת שני המסלולים עם תרגול וסימולציה.",
  keywords: [
    "מחוננים ומצטיינים",
    "הכנה למבחן מצטיינים",
    "מבחן מחוננים מצטיינים כיתה ב",
    "אחוזון מחוננים",
    "הבדל מחוננים מצטיינים",
  ],
  canonical: "https://smarti.co.il/mitztaynim",
});

const faqData = [
  {
    question: "מה ההבדל המרכזי בין מחוננים למצטיינים?",
    answer:
      "במסלול המקובל בישראל, מחוננים משויכים לאחוזון גבוה מאוד (למשל 97 ומעלה); מצטיינים לטווח נפרד (למשל בין אחוזון 92 ל־96). חשוב להבחין: שני המסלולים אינם זהים — תוכן ההכנה והמסגרות בבית הספר שונים.",
  },
  {
    question: "האם אותו מבחן שלב א׳ מתאים גם למצטיינים וגם למחוננים?",
    answer:
      "בשלבים הראשונים מתקיים לעיתים מבחן משותף או דומה, אך הסיווג והמשך הדרך שונים. חשוב לקרוא מדי שנה את פרסומי משרד החינוך ואת ההנחיות מבית הספר.",
  },
  {
    question: "איך נראית הכנה למבחן מצטיינים בפועל?",
    answer:
      "כמו במחוננים: היכרות עם פורמט השאלון, תרגול עקבי של הבנת הנקרא וחשבון בשלב א׳, ואחר כך משימות קוגניטיביות בשלב ב׳ — בקצב המתאים לילד ולמסלול שנבחר.",
  },
  {
    question: "האם כדאי להתמקד רק במחוננים כי זה 'יוקרתי' יותר?",
    answer:
      "לא בהכרח. כל ילד שונה; חשוב להתאים ציפיות למידה ולמוטיבציה. שני המסלולים לגיטימיים, וההכנה הטובה מכבדת את הילד ולא תורמת ללחצים מיותרים מהסביבה.",
  },
  {
    question: "איפה מתרגלים למסלול מצטיינים בסמארטי?",
    answer:
      "במערכת הלומדה יש חומרים לשלב א׳ ושלב ב׳ — ניתן לשלב עם ההדרכה מבית הספר כדי ליישר קו עם המסלול הרצוי.",
  },
];

const canonical = "https://smarti.co.il/mitztaynim";

export default function MitztaynimPage() {
  return (
    <>
      <Script
        id="ld-article-mitztaynim"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "מחוננים ומצטיינים — ההבדל והכנה למבחן מצטיינים",
              description:
                "הסבר על אחוזונים, מסלולי לימוד, ותרגול עם סמארטי.",
              url: canonical,
              datePublished: "2025-09-01",
              dateModified: "2026-05-10",
            })
          ),
        }}
      />
      <Script
        id="ld-faq-mitztaynim"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="מחוננים ומצטיינים — מדריך קצר להבדלים והכנה"
        subtitle="מילות מפתח שחוזרות בחיפוש: מה ההבדל מחוננים ומצטיינים, אחוזון, והכנה למבחן מצטיינים ביחס לשלב א׳ ושלב ב׳."
        faq={faqData}
        canonicalUrl={canonical}
      >
        <GuideP>
          כשמחפשים <strong>הכנה למבחן מחוננים</strong> או <strong>הכנה למבחן מצטיינים</strong>, חייבים
          קודם כל להבין: שני המסלולים נועדו לאוכלוסיות שונות של ציונים יחסיים (אחוזונים), ובתי ספר
          ומשרד החינוך קובעים כל שנה את הפרטים המדויקים. עמוד זה נותן מסגרת כללית; הפרטים המשפטיים
          והמנהליים רק באתר הרשמי ובבית הספר.
        </GuideP>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-a">שלב א׳ ומבחן מחוננים כיתה ב׳</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/madriche-holim">מדריך הורים</Link>
          </Button>
        </div>

        <section className="space-y-4">
          <GuideH2 id="achuzon">אחוזון — למה מדברים בכלל?</GuideH2>
          <GuideP>
            <strong>אחוזון</strong> אומר איפה הילד עומד ביחס לקבוצת גיל רחבה. מחוננים נמצאים בדרך כלל
            באחוזון העליון ביותר; מצטיינים בטווח שמתחתיו אך עדיין גבוה. המספרים המדויקים משתנים —
            אל תסתמכו על פוסט ברשת; בדקו את הטבלאות הרשמיות.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="mah-lomdim">מה לומדים בכל מסלול?</GuideH2>
          <GuideP>
            ברמת היעד החינוכי, שני המסלולים שמים דגש על למידה מתקדמת, אבל לא זהה בדיוק באינטנסיביות
            ובמבנה הכיתות. להורים נטו מומלץ לשוחח עם בית הספר ולהצמיד <strong>תרגול</strong> לפי מה
            שמתאים לילד — גם <strong>לומדה מחוננים</strong> וגם חומר מודפס.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="hachana-pract">איך נראית הכנה מאוזנת?</GuideH2>
          <GuideUl>
            <li>שבוע עם 3–5 ימי תרגול קצרים עדיף על יום אחד ארוך.</li>
            <li>שילוב תרגול אונליין (למשל <strong>לומדה מחוננים</strong>) עם חוברת אם הילד צריך נייר.</li>
            <li>שיחה עם המורה כדי לוודא שהכיוון תואם את המסלול.</li>
          </GuideUl>
        </section>

        <section className="space-y-4">
          <GuideH2 id="smarti">איך סמארטי נכנסת לתמונה?</GuideH2>
          <GuideP>
            סמארטי נבנתה סביב <strong>תרגול מבחן מחוננים</strong>, <strong>סימולציה מבחן מחוננים</strong>{" "}
            ודוחות להורים — כדי שתהיה <strong>הכנה למחוננים</strong> מדודה. מסלול המצטיינים משתמש
            באותה תשתית של שלב א׳/ב׳ כשמדובר בצמד המבחנים; ההבדל הוא בהכוונה ובשיח מול בית הספר.
          </GuideP>
          <LearnEntryButton variant="secondary" trackSource="mitztaynim">
            לתרגול במערכת
          </LearnEntryButton>
        </section>
      </MarketingArticleShell>
    </>
  );
}
