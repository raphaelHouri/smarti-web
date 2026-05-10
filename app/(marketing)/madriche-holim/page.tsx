import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP, GuideUl } from "../_components/MarketingArticleShell";

export const metadata: Metadata = buildMetadata({
  title: "מדריך הורים להכנה למבחן מחוננים — מתי, כמה ואיך | סמארטי",
  description:
    "מדריך מעשי להורים: מתי להתחיל הכנה למבחן מחוננים, כמה זמן כדאי לתרגל, איך ללחוץ פחות על הילד ומה ההבדל בין מחוננים למצטיינים. מבוסס ניסיון הוראה ותרגול במערכת סמארטי.",
  keywords: [
    "מתי להתחיל הכנה למבחן מחוננים",
    "כמה זמן להתכונן למבחן מחוננים",
    "האם להכין ילד למבחן מחוננים",
    "מה ההבדל מחוננים ומצטיינים",
    "הכנה למבחני מחוננים כיתה א ב ג",
  ],
  canonical: "https://smarti.co.il/madriche-holim",
});

const faqData = [
  {
    question: "מתי להתחיל הכנה למבחן מחוננים?",
    answer:
      "מומלץ להתחיל כ־2–3 חודשים לפני המבחן. אם המבחן נערך בסתיו של כיתה ב׳, רבים מתחילים בתרגול עדיין בקיץ — בקצב נינוח ובלי לחץ.",
  },
  {
    question: "כמה זמן ביום כדאי לתרגל?",
    answer:
      "לרוב מספיקים 20–40 דקות יום־יום, בתוספת סימולציה שבועית כשמתקרבים למועד. עדיף עקביות על פני מרתון של פעם בשבוע.",
  },
  {
    question: "האם להכין ילד למבחן מחוננים בכלל?",
    answer:
      "היכרות עם הפורמט והסוגי שאלות מפחיתה חרדה ומאפשרת לילד להציג את יכולותיו. זו לא \"עקיפת\" המערכת — אלא הכנה לגיטימית שגם משרד החינוך ממליץ עליה ברוח הזו.",
  },
  {
    question: "מה ההבדל בין מחוננים למצטיינים?",
    answer:
      "במסגרת המוכרת בישראל, מחוננים מקבלים בדרך כלל אחוזון מאוד גבוה (למשל 97+); מצטיינים מוגדרים בטווח נמוך יותר (כגון 92–96). שני המסלולים שונים בתוכן וברמת האינטנסיביות — לכל ילד מתאים מסלול אחר.",
  },
  {
    question: "איך לא לשבור מוטיבציה לפני המבחן?",
    answer:
      "חשוב להפריד בין תוצאה לערך: לשבח מאמץ, לא רק ציון. להציע הפסקות, שינה מספקת ותרגול בגובה העיניים — גם באפליקציה וגם בחוברת.",
  },
  {
    question: "כמה אחוז בדרך כלל עוברים את שלב א׳?",
    answer:
      "בסדר גודל טיפוסי, כ־15% מהנבחנים עוברים את שלב א׳; המספר משתנה בין שנים ומחוזות. אין להסיק מכך על הילד שלכם לבדו.",
  },
  {
    question: "מה ההכנה למחוננים כיתה א ב ג אומרת בפועל?",
    answer:
      "רוב הילדים נוגעים בשלב א׳ בכיתה ב׳ ובשלב ב׳ בכיתה ג׳ — אבל יש וריאציות מסלול. עקבו אחרי בית הספר ועמודי השלב באתר שלנו.",
  },
  {
    question: "איפה מתרגלים לומדה מחוננים וסימולציה?",
    answer:
      "במערכת סמארטי ובעמוד 'תרגול וסימולציה' באתר — יש שילוב של שאלות אדפטיביות ומבחנים מלאים.",
  },
];

const canonical = "https://smarti.co.il/madriche-holim";

export default function MadricheHolimPage() {
  return (
    <>
      <Script
        id="ld-article-madriche"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "מדריך הורים להכנה למבחן מחוננים",
              description:
                "מתי להתחיל, כמה לתרגל, ואיך לשמור על אווירה בריאה לפני מבחני המחוננים.",
              url: canonical,
            })
          ),
        }}
      />
      <Script
        id="ld-faq-madriche"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="מדריך הורים להכנה למבחן מחוננים"
        subtitle="מתי להתחיל, כמה זמן לתרגל, ואיך לעזור לילד בלי להעמיס — על בסיס מה שעובד אצל אלפי משפחות שמשתמשות בסמארטי."
        faq={faqData}
      >
        <GuideP>
          הכנה למבחן מחוננים אינה “סוד” ולא חייבת להיות אירוע חד־פעמי. ככל שהילד מכיר את{" "}
          <strong>פורמט השאלון</strong>, את <strong>סוגי המשימות</strong> ואת{" "}
          <strong>מגבלת הזמן</strong> — כך הוא פחות נסחט ביום המבחן. המדריך הזה מסכם את השאלות
          שהורים הכי שואלים, לפני שלב א׳ ושלב ב׳.
        </GuideP>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-a">שלב א׳ — כיתה ב׳</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/shlab-b">שלב ב׳ — כיתה ג׳</Link>
          </Button>
        </div>

        <section className="space-y-4">
          <GuideH2 id="kmat-zman">כמה זמן כדאי להתכונן לפני המבחן?</GuideH2>
          <GuideP>
            טווח נוח לרוב המשפחות הוא <strong>בין שישה לשלושה חודשים</strong> לפני המועד. בתקופה הזו
            אפשר לבנות הרגל תרגול קבוע: קצת הבנת הנקרא, קצת חשבון, ולקראת הסוף — סימולציה מלאה
            באורך דומה למבחן. אם התחלתם מאוחר יותר, עדיין כדאי: גם שבועיים–שלושה של היכרות עם
            הפורמט עושים הבדל במוטיבציה ובביטחון.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="yom-yomi">מה נראה ‟יום תרגול‟ סביר?</GuideH2>
          <GuideUl>
            <li>15–20 דקות תרגול ממוקד באפליקציה או בחוברת (לפי מה שמתאים למשפחה).</li>
            <li>פעם בכמה ימים — משוב קצר: מה היה קל, מה דורש חיזוק.</li>
            <li>פעם בשבוע, כשמתקרבים למבחן — סימולציה אחת שלמדה זמן וריכוז.</li>
          </GuideUl>
        </section>

        <section className="space-y-4">
          <GuideH2 id="lahatz">לחץ, ציפיות והורים</GuideH2>
          <GuideP>
            חרדה לפני מבחן מחוננים היא טבעית — גם אצל הורים וגם אצל ילדים. כדאי לדבר בגובה העיניים:
            שהמטרה היא <strong>לתת לילד ניסיון הוגן</strong>, לא להוכיח משהו למערכת. תרגול
            עקבי מפחית הפתעות; שפה חיובית מפחיתה את תחושת האיום של היום הארוך.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="mah-she-bodedkim">מה בודקים בשלב א׳ ובשלב ב׳?</GuideH2>
          <GuideP>
            בשלב א׳ מתמקדים בדרך כלל ב<strong>הבנת הנקרא</strong>, <strong>חשבון</strong>,{" "}
            <strong>בעיות מילוליות</strong> ו<strong>סדרות</strong>. בשלב ב׳ נכנסות משימות
            קוגניטיביות נוספות — למשל אנלוגיות, חשיבה מרחבית וסדרות צורניות. אצלנו כל אחד מהמסלולים
            מקבל עמוד ייעודי עם הסברים ותרגול.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="kitot">הכנה למחוננים כיתה א ב ג — מה שווה לדעת</GuideH2>
          <GuideP>
            כשמחפשים <strong>הכנה למחוננים כיתה א ב ג</strong> מתכוונים בדרך כלל לציר הגילאים שבו נוגעים
            במבחני המסגרת: רוב התלמידים נפגשים עם <strong>מבחן מחוננים שלב א</strong> בכיתה ב׳, ועם{" "}
            <strong>מבחן מחוננים שלב ב</strong> בהמשך. חשוב לבחור תרגול לפי השלב הנוכחי — לא להרביץ
            חומר של שלב ב׳ לפני שיש בסיס חזק בשלב א׳.
          </GuideP>
        </section>

        <section className="space-y-4">
          <GuideH2 id="aron">ערכת הכנה מחוננים ולומדה</GuideH2>
          <GuideP>
            משפחות משלבות <strong>ערכת הכנה מחוננים</strong> מודפסת עם <strong>לומדה מחוננים</strong> כדי
            לקבל גיוון: מסך למשוב מיידי, דף לתזכורת בכתב. זה חלק מתוך אותה <strong>הכנה למבחני מחוננים
            ומצטיינים</strong> — ראו גם את העמוד על מצטיינים אם זה הרלוונטי לכם.
          </GuideP>
          <Button variant="default" size="sm" asChild>
            <Link href="/mitztaynim">מחוננים ומצטיינים — עמוד מסלולים</Link>
          </Button>
        </section>

        <section className="space-y-3 border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/40">
          <p className="font-medium text-neutral-800 dark:text-slate-100 text-sm sm:text-base">
            ממשיכים מהמדריך הזה לתרגול
          </p>
          <GuideP>
            בסמארטי תמצאו תרגול אדפטיבי, סימולציות וחומרי עומק לפי שלב — כדי שההכנה למבחן מחוננים
            תהיה מדודה ולא אינסופית.
          </GuideP>
          <Button variant="secondary" asChild>
            <Link href="/learn">מעבר למערכת התרגול</Link>
          </Button>
        </section>
      </MarketingArticleShell>
    </>
  );
}
