import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const links = [
  { href: "/lomda", title: "הלומדה שלנו", desc: "סיור במסכים, מחירים ומידע על כל חוברת הכנה" },
  { href: "/faq", title: "שאלות ותשובות (FAQ)", desc: "מאגר מלא של שאלות נפוצות לפי נושאים" },
  { href: "/madriche-holim", title: "מדריך הורים", desc: "מתי להתחיל, כמה לתרגל ורגשות" },
  { href: "/tarugol-ve-simulatzia", title: "תרגול וסימולציה", desc: "לומדה מחוננים, סימולציה וחוברת הכנה" },
  { href: "/sheelot-dugma", title: "שאלות לדוגמה", desc: "חינם — דוגמאות ואיך להמשיך למערכת" },
  { href: "/mitztaynim", title: "מחוננים ומצטיינים", desc: "אחוזונים, הבדלים והכנה למבחן מצטיינים" },
  { href: "/acharei-mevchan", title: "אחרי המבחן", desc: "תוצאות, שלב ב׳ ומה הלאה" },
];

export function SeoKnowledgeHub() {
  return (
    <section
      className="w-full py-12 px-4 sm:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-background border-t border-slate-100 dark:border-slate-800"
      dir="rtl"
      aria-label="מדריכים והכנה למבחן מחוננים"
    >
      <div className="max-w-screen-lg mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide mb-3">
            מאגר ידע
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-slate-100 mb-3">
            מדריכים להכנה למבחני מחוננים
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            מאמרים קצרים לפי נושאי חיפוש נפוצים — תרגול, שאלות לדוגמה, סימולציה, מסלול מצטיינים ומקורות רשמיים.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative rounded-2xl border border-emerald-400 dark:border-emerald-600 bg-white dark:bg-slate-900 p-5 shadow-xl -translate-y-1 transition-all duration-200 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-xl hover:-translate-y-1.5 hover:ring-2 hover:ring-emerald-500/35 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-900"
            >
              <span className="absolute inset-y-0 right-0 w-1 rounded-r-2xl bg-emerald-400 dark:bg-emerald-500" />
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-800 dark:group-hover:text-emerald-300 break-words transition-colors">
                  {item.title}
                </p>
                <ArrowLeft className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex-shrink-0 mt-0.5 transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
