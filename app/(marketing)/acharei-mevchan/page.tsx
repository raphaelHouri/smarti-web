import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP, GuideUl } from "../_components/MarketingArticleShell";

export const metadata: Metadata = buildMetadata({
  title: "מה קורה אחרי מבחן מחוננים? תוצאות, שלב ב׳ והמשך הדרך | סמארטי",
  description:
    "מסלול טיפוסי אחרי מבחן שלב א׳: מתי מקבלים משוב, מה המשמעות של מעבר לשלב ב׳, ואיך להתכונן נכון — בלי הבטחות שווא. כולל מילות מפתח: תוצאות מבחן מחוננים, הכנה למבחן מחוננים שלב ב.",
  keywords: [
    "תוצאות מבחן מחוננים",
    "מה קורה אחרי מבחן מחוננים",
    "הכנה למבחן מחוננים שלב ב",
    "מבחן מחוננים שני",
    "מבחן מחוננים מועד ב",
  ],
  canonical: "https://smarti.co.il/acharei-mevchan",
});

const faqData = [
  {
    question: "מתי מתקבלות תוצאות מבחן מחוננים?",
    answer:
      "לרוב יש חלון זמן מוגדר אחרי המבחן — הוא משתנה לפי משרד החינוך, רשות מקומית וסוג המסגרת. כדאי לעקוב אחרי הודעות בית הספר ואתר משרד החינוך; אצלנו במדריך לא נציג תאריך יחיד כי הוא משתנה משנה לשנה.",
  },
  {
    question: "מה אם לא עברתי את שלב א׳?",
    answer:
      "המסלול השלדי בישראל כולל לעיתים מועד נוסף או אפשרות להיבחן שוב — לפי הכללים באותה שנה. חשוב לא לייעץ משפטית או מנהלית: לבדוק את הפרסום הרשמי ולבקש הבהרה מבית הספר.",
  },
  {
    question: "מתי מתחילה הכנה למבחן מחוננים שלב ב׳?",
    answer:
      "אחרי מתן תוצאות ואישור זכאות לשלב הבא. ההכנה כוללת משימות קוגניטיביות עשירות יותר; בסמארטי יש מסלול ייעודי לשלב ב׳ לכיתה ג׳.",
  },
  {
    question: "האפשרות לערעור על תוצאות — איפה מסבירים?",
    answer:
      "דיווחים על ערעור או בקשת בדיקה חוזרת מופיעים בפרסומי משרד החינוך ובמסמכים שמקבלים מהרשות. אם בחרתם בערעור, עקבו אחרי המועדים הרשמיים בלבד.",
  },
];

const canonical = "https://smarti.co.il/acharei-mevchan";

export default function AchareiMevchanPage() {
  return (
    <>
      <Script
        id="ld-article-acharei"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "מה קורה אחרי מבחן מחוננים — תוצאות ושלב ב׳",
              description:
                "ציר זמן טיפוסי, קבלת תוצאות והמשך הכנה לשלב ב׳, עם קישורים למסלולי התרגול בסמארטי.",
              url: canonical,
            })
          ),
        }}
      />
      <Script
        id="ld-faq-acharei"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="מה קורה אחרי מבחן מחוננים?"
        subtitle="תוצאות, סינון לשלב ב׳, ומה חשוב לזכור לפני שממשיכים בהכנה — בלי לנחש תאריכים רשמיים: תמיד לוודא מול בית הספר ומול משרד החינוך."
        faq={faqData}
      >
        <GuideP>
          רבים מההורים מתמקדים רק ביום של <strong>מבחן מחוננים שלב א׳</strong>, אבל התהליך האמיתי
          נמשך גם אחריו: פרסום <strong>תוצאות מבחן מחוננים</strong>, בחירת מסגרת בהמשך, ובמקרים
הטקסט הבא נועד לתת מפת דרכים רגשית ולוגית, בלי להחליף הודעה רשמית מבית הספר.
        </GuideP>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-b">עמוד שלב ב׳</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/kita-gimel">כיתה ג׳ ושלב ב׳</Link>
          </Button>
        </div>

        <section className="space-y-4">
          <GuideH2 id="results">איך מודיעים על תוצאות?</GuideH2>
          <GuideP>
            בדרך כלל ההורים מקבלים עדכון דרך בית הספר או מערכת דיווח מרכזית — התקנון משתנה בין
            שנים ומחוזות. אם יש לכם שאלה דחופה, עדיף לפנות למזכירות ולא למספרים ששמעתם ברשת.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="next-step">מעבר לשלב ב׳ — מה זה אומר בפועל?</GuideH2>
          <GuideP>
            מעבר ל-<strong>מבחן מחוננים שלב ב׳</strong> אומר שינוי בשאלון: פחות הטמעה של "חשבון
            ובסיס" לבד, ויותר משימות הדורשות חשיבה גמישה וזיהוי דפוסים. היכרות עם הפורמט דרך
            תרגול שבועי עוזרת לילד להרגיש שולט בחומר, גם כשהשאלות ארוכות יותר.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="timeline">ציר זמן טיפוסי (דוגמה כללית)</GuideH2>
          <GuideUl>
            <li>שבועות ספורים אחרי המבחן — עיבוד נתונים ופרסום לרשויות המוסמכות.</li>
            <li>עדכון למשפחות — לרוב דרך בית הספר או פורטל; אם מתפרסם מועד חלופי או מבחן נוסף, מפרסמים גם אותו.</li>
            <li>אם התקבלתם לשלב הבא — זה הזמן לבנות תכנית תרגול לפי רמת הילד (ולא לפי לחץ חברתי).</li>
          </GuideUl>
          <GuideP>
            <strong>שימו לב:</strong> המספרים והמועדים דינמיים. נקודת האמת היא הפרסום באותה שנה
            לימודים.
          </GuideP>
        </section>

        <section className="space-y-4 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-5 bg-amber-50/40 dark:bg-amber-950/20">
          <GuideH2 id="disclaimer">דיוק מול הרשות</GuideH2>
          <GuideP>
            סמארטי מספקת כלים ל<strong>הכנה למבחני מחוננים ומצטיינים</strong> — טקסט זה אינו ייעוץ
            משפטי או מנהלי. לשאלות על זכאות, ערעורים או מועדים רשמיים, היעזרו במסמכי משרד החינוך
            ובבית הספר.
          </GuideP>
        </section>

        <section className="space-y-3">
          <GuideH2 id="cta">ממשיכים לשלב ב׳ עם סמארטי</GuideH2>
          <GuideP>
            במערכת יש סימולציות, תרגול אדפטיבי וחומרים שמכסים את המיומנויות של שלב ב׳. אפשר להתחיל
            מעמוד שלב ב׳ או ישר מהכניסה למערכת.
          </GuideP>
          <Button variant="secondary" asChild>
            <Link href="/learn">כניסה ללומדה</Link>
          </Button>
        </section>
      </MarketingArticleShell>
    </>
  );
}
