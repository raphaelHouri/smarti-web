import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP, GuideUl } from "../_components/MarketingArticleShell";

export const metadata: Metadata = buildMetadata({
  title: "תרגול מבחן מחוננים, סימולציה ולומדה מחוננים — סמארטי",
  description:
    "תרגול מבחן מחוננים אונליין, סימולציה מלאה בזמן, חוברת הכנה מחוננים וערכת מערכת — איך לשלב בין כלים דיגיטליים לחומרים מודפסים להכנה למבחני מחוננים ומצטיינים.",
  keywords: [
    "תרגול מבחן מחוננים",
    "סימולציה מבחן מחוננים",
    "לומדה מחוננים",
    "חוברת הכנה מחוננים",
    "ערכת הכנה מחוננים",
  ],
  canonical: "https://smarti.co.il/tarugol-ve-simulatzia",
});

const faqData = [
  {
    question: "מה ההבדל בין תרגול מבחן מחוננים לסימולציה?",
    answer:
      "תרגול הוא שלבים קצרים לפי נושא (הבנת הנקרא, חשבון וכו׳). סימולציה מחקה את אורך המבחן, התזמון והאווירה — מתאים לקראת המועד האמיתי.",
  },
  {
    question: "מה זו לומדה מחוננים בסמארטי?",
    answer:
      "פלטפורמה דיגיטלית עם שאלות רבות־שכבה, משוב מיידי והתאמה לרמה — אידיאלית לשגרת תרגול בין השיעורים.",
  },
  {
    question: "האם צריך גם חוברת הכנה מחוננים מודפסת?",
    answer:
      "לא חובה, אבל רבים משלבים: המסך לשגרה, החוברת לסימולציה או ניתוק מהטאבלט. בחנות סמארטי יש חומרים לפי שלב.",
  },
  {
    question: "כמה סימולציות מומלץ לפני המבחן?",
    answer:
      "לפחות 2–4 סימולציות מלאות בשבועיים האחרונים, אחרי שבססתם תרגול נושאי. כך בונים ביטחון מול השעון.",
  },
];

const canonical = "https://smarti.co.il/tarugol-ve-simulatzia";

export default function TarugolVeSimulatziaPage() {
  return (
    <>
      <Script
        id="ld-article-tarugol"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "תרגול מבחן מחוננים וסימולציה — לומדה וחומרים",
              description: "מדריך לשילוב תרגול, סימולציה ולומדה מחוננים.",
              url: canonical,
            })
          ),
        }}
      />
      <Script
        id="ld-faq-tarugol"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="תרגול מבחן מחוננים, סימולציה ולומדה מחוננים"
        subtitle="מקבצים ארוכי זנב בחיפוש: איך לבנות שגרה של תרגול, מתי לעבור לסימולציה מלאה, ומה התפקיד של חוברת הכנה מחוננים וערכת המערכת."
        faq={faqData}
      >
        <GuideP>
          <strong>תרגול מבחן מחוננים</strong> עושה את ההבדל כשהוא נמשך לאורך זמן:           לא ספרינט של לילה לפני המבחן, אלא הרגל של הבנת פורמט השאלון, של זמן מחשבה, ושל צמצום טעויות טיפוסיות.{" "}
          <strong>סימולציה מבחן מחוננים</strong> באה בשכבה מעל — כשהילד כבר יודע את החומר אבל צריך
          ללמוד לנהל את עצמו תחת לחץ.
        </GuideP>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/learn">כניסה ללומדה</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/shop">חנות — חוברות וערכות</Link>
          </Button>
        </div>

        <section className="space-y-4">
          <GuideH2 id="shegrat-tarugol">שגרת תרגול שבועית</GuideH2>
          <GuideUl>
            <li>ימים בלי מבחן: תרגול ממוקד לפי נושא (חשבון, הבנת הנקרא, סדרות מספרים וכו׳).</li>
            <li>יום אחד: סיכום או משחק קצר כדי לשמור על מוטיבציה.</li>
            <li>לקראת המועד: הוספת <strong>סימולציה מבחן מחוננים</strong> מלאה.</li>
          </GuideUl>
        </section>

        <section className="space-y-4">
          <GuideH2 id="lomda">לומדה מחוננים — למה זה עוזר?</GuideH2>
          <GuideP>
            <strong>לומדה מחוננים</strong> מאפשרת משוב מיידי ורבים שאלות — מתאימה במיוחד לתלמידים
            שנוהגים ללמוד במסך. כדאי לשלב עם הדפסה או חוברת כשהילד צריך גיוון או מנוחה מהמסך.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="hovaret">חוברת הכנה מחוננים וערכת הכנה מחוננים</GuideH2>
          <GuideP>
            <strong>חוברת הכנה מחוננים</strong> מתאימה למי שרוצה לתרגל בלי חיבור, או להדפיס דפי
            סימולציה. <strong>ערכת הכנה מחוננים</strong> (מערכת מלאה) מתאימה למי שמחפש חבילה מאורגנת
            — השלימו את הפרטים בעמוד החנות.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="shlav">תרגול לפי שלב א׳ ושלב ב׳</GuideH2>
          <GuideP>
            בשלב א׳ התמקדות בהבנת הנקרא, חשבון ובעיות מילוליות; בשלב ב׳ נכנסות אנלוגיות, סדרות צורניות
            וחשיבה מרחבית. השתמשו בעמודי <Link href="/shlab-a" className="text-green-700 dark:text-green-400 underline">שלב א׳</Link>{" "}
            ו־<Link href="/shlab-b" className="text-green-700 dark:text-green-400 underline">שלב ב׳</Link> כנקודת הפניה.
          </GuideP>
        </section>
      </MarketingArticleShell>
    </>
  );
}
