import Link from "next/link";
import { CheckCircle2, ChevronLeft } from "lucide-react";

const facts = [
  "אנחנו הגוף הגדול והוותיק ביותר בארץ שמכין תלמידים למבחני המחוננים",
  "אחוזי הצלחה גבוהים מאוד — מכינים כבר הרבה שנים ברציפות",
  "היחידים שמרוכזים בטיפוח הילדים והמוקדים סביב עולמם",
];

const articles = [
  {
    title: "מתי להתחיל הכנה למבחן מחוננים?",
    excerpt: "קיץ לפני כיתה ב — כ-3 חודשים מראש הוא הזמן האידיאלי",
    href: "/shlab-a#info",
  },
  {
    title: "מה ההבדל בין מחוננים למצטיינים?",
    excerpt: "מחוננים = אחוזון 97+, מצטיינים = אחוזון 92–96",
    href: "/shlab-a#info",
  },
  {
    title: "כמה אחוז עוברים מבחן מחוננים?",
    excerpt: "כ-15% שלב א׳, כ-3% סיווג סופי כמחוננים",
    href: "/shlab-b#info",
  },
];

export function InfoSidePanel() {
  return (
    <aside
      className="flex flex-col h-full bg-gradient-to-b from-emerald-50/80 to-slate-50/60 dark:from-emerald-950/30 dark:to-slate-900/80 border-l border-emerald-100 dark:border-emerald-900/50"
      dir="rtl"
    >
      {/* הידעת */}
      <div className="px-4 pt-5 pb-4">
        <p className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-3 tracking-widest uppercase">
          <CheckCircle2 className="w-3 h-3" />
          הידעת?
        </p>
        <ul className="flex flex-col gap-3">
          {facts.map((fact, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-[11px] sm:text-xs text-neutral-600 dark:text-slate-400 leading-snug"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              {fact}
            </li>
          ))}
        </ul>
      </div>

      <div className="h-px bg-emerald-100 dark:bg-emerald-900/40 mx-4" />

      {/* Articles */}
      <div className="px-4 pt-4 pb-2 flex-1">
        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-3 tracking-widest uppercase">
          מאמרים
        </p>
        <ul className="flex flex-col gap-3.5">
          {articles.map((article, i) => (
            <li key={i}>
              <Link
                href={article.href}
                className="group flex flex-col gap-0.5 no-underline"
              >
                <span className="text-[11px] sm:text-xs font-bold text-neutral-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {article.title}
                </span>
                <span className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                  {article.excerpt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 pb-5">
        <Link
          href="/shlab-a"
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
        >
          לכל המאמרים
          <ChevronLeft className="w-3 h-3" />
        </Link>
      </div>
    </aside>
  );
}
