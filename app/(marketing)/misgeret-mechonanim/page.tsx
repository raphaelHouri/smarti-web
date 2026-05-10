import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildMetadata, buildArticleJsonLd, buildFAQJsonLd } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { MarketingArticleShell, GuideH2, GuideP } from "../_components/MarketingArticleShell";

export const metadata: Metadata = buildMetadata({
  title: "מסגרות חינוך למחוננים — מקורות רשמיים והסבר להורים | סמארטי",
  description:
    "קישורים ועקרונות ממשרד החינוך על מבחני מחוננים, שלב א׳ ושלב ב׳, וקבלה למסגרות. מידע להורים בצד תרגול בסמארטי — לא מחליף פרסום רשמי.",
  keywords: [
    "מבחן מחוננים 2026",
    "מסגרות חינוך למחוננים",
    "מבחן שלב א ושלב ב",
    "הכנה למבחן מחוננים שלב א",
  ],
  canonical: "https://smarti.co.il/misgeret-mechonanim",
});

const officialLinks = [
  {
    href: "https://parents.education.gov.il/prhnet/gifted/primary-education-frameworks/first-test-b-and-c",
    label: "מסגרת חינוך יסודית — מבחן שלבים א׳ וב׳ (אתר ההורים, משרד החינוך)",
    description: "סקירה רשמית של מסלול המבחנים והשלבים בחינוך היסודי.",
  },
  {
    href: "https://parents.education.gov.il/prhnet/gifted/primary-education-frameworks/acceptance-primary-education",
    label: "מסלולי קבלה לחינוך יסודי למחוננים",
    description: "הסבר כללי על תהליך הקבלה — לעקוב אחרי העדכון באתר.",
  },
  {
    href: "https://apps.education.gov.il/Mankal/Horaa.aspx?siduri=243",
    label: "הוראות מנכ״ל — דף siduri לדוגמה",
    description: "מסמכי הוראה מתעדכנים; בדקו את המספר והנוסח בגרסה הרלוונטית לשנה שלכם.",
  },
  {
    href: "https://meyda.education.gov.il/files/gifted/age-effect-research.pdf",
    label: "מחקר נושא השפעת גיל (PDF, משרד החינוך)",
    description: "מקור אקדמי־רשמי לדיון בהקשר גילאים ומסגרות — לקריאה ממוקדת.",
  },
];

const faqData = [
  {
    question: "למה חשוב לפתוח את הקישורים הרשמיים ולא להסתפק בבלוג?",
    answer:
      "כללי הקבלה, מועדי מבחן וזכאות משתנים. האתר של משרד החינוך ואתר ההורים הם מקור הסמכות; הבלוג שלנו עוזר להבין רגשית ולתרגל, לא להחליף הודעה מערכתית.",
  },
  {
    question: "מה סמארטי נותנת מעבר למידע רשמי?",
    answer:
      "תרגול מאות שאלות, סימולציות ומעקב התקדמות — כלומר הכנה מעשית להופעה בפועל ביום המבחן.",
  },
];

const canonical = "https://smarti.co.il/misgeret-mechonanim";

export default function MisgeretMechonanimPage() {
  return (
    <>
      <Script
        id="ld-article-misgeret"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildArticleJsonLd({
              headline: "מסגרות חינוך למחוננים — מקורות רשמיים",
              description:
                "קישורים מומלצים ממשרד החינוך לצד הסבר קצר להורים; תוספת תרגול עם סמארטי.",
              url: canonical,
            })
          ),
        }}
      />
      <Script
        id="ld-faq-misgeret"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqData)) }}
      />

      <MarketingArticleShell
        title="מסגרות חינוך למחוננים — מה אומר המשרד?"
        subtitle="כאן תמצאו מסגרת הסבר קצרה וקישורים ישירים לאתר משרד החינוך. אנחנו ממליצים לשמור את הקישורים האלה לצד ההכנה המעשית בסמארטי."
        faq={faqData}
      >
        <GuideP>
          <strong>סמארטי</strong> מתמחה ב<strong>הכנה למבחני מחוננים ומצטיינים</strong> — תרגול, משוב
          וסימולציות. <strong>החלטות רשמיות</strong> (זכאות, מועדים ומדיניות רשויות) מתפרסמות אצל
          משרד החינוך ובבית הספר. השילוב הנכון: לקרוא את המקור הרשמי, ואז להתאים לילד תרגול עקבי
          באפליקציה או בחומר המודפס.
        </GuideP>

        <section className="space-y-6">
          <GuideH2 id="links">קישורים רשמיים מומלצים</GuideH2>
          <ul className="space-y-5 list-none pr-0">
            {officialLinks.map((item) => (
              <li
                key={item.href}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-4 sm:p-5"
              >
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-700 dark:text-green-400 hover:underline break-words"
                >
                  {item.label}
                </a>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.description}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <GuideH2 id="eeat">למה זה חשוב ל־EEAT ול־SEO?</GuideH2>
          <GuideP>
            מנועי חיפוש ומנועי AI נותנים משקל ל<strong>מקורות סמכותיים</strong>. כשדף מפנה בבירור
            למשרד החינוך, קוראים יודעים שמדובר במידע שמכבד את הכללים — וזה גם נשמע טבעי בעברית,
            בלי מילוי מילות מפתח מלאכותי.
          </GuideP>
        </section>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="default" size="sm" asChild>
            <Link href="/madriche-holim">מדריך הורים</Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/acharei-mevchan">אחרי המבחן</Link>
          </Button>
        </div>

        <section className="space-y-3 border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-slate-50/50 dark:bg-slate-900/40">
          <GuideH2 id="practice">ממשיכים לתרגול</GuideH2>
          <GuideP>
            אחרי שסימנתם לעצמכם את הפרטים הרשמיים — זה הזמן לבנות הרגל תרגול: שלב א׳, שלב ב׳ או
            מסלול מצטיינים, לפי הגדרת הילד.
          </GuideP>
          <Button variant="secondary" asChild>
            <Link href="/learn">כניסה למערכת התרגול</Link>
          </Button>
        </section>
      </MarketingArticleShell>
    </>
  );
}
