import {
  BookOpen,
  BookText,
  Video,
  BarChart2,
  Trophy,
  Users,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "תרגולים אונליין",
    description: "אלפי שאלות אדפטיביות מותאמות לרמת הילד",
  },
  {
    icon: BookText,
    title: "חוברות מבחנים",
    description: "סימולציות מודפסות לשלב א׳ ולשלב ב׳",
  },
  {
    icon: Video,
    title: "שיעורים אונליין",
    description: "מפגשים פרונטליים עם מורים מנוסים",
  },
  {
    icon: BarChart2,
    title: "מעקב התקדמות",
    description: "דוחות ביצועים מפורטים להורים ולילדים",
  },
  {
    icon: Trophy,
    title: "לוח דירוגים",
    description: "מוטיבציה גבוהה דרך גיימיפיקציה וניקוד",
  },
  {
    icon: Users,
    title: "הדרכת הורים",
    description: "מדריכים ומפגשים ייעודיים להורים",
  },
];

export function AppFeaturesGrid() {
  return (
    <section className="py-10 px-4 sm:px-6" dir="rtl">
      <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-7 text-center">
        מה כוללות תוכניות ההכנה שלנו?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group flex flex-col items-center text-center gap-2.5 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/60 dark:to-green-900/40 flex items-center justify-center flex-shrink-0 group-hover:from-emerald-100 group-hover:to-green-200 dark:group-hover:from-emerald-900/60 transition-colors">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-bold text-neutral-700 dark:text-slate-200 leading-snug">
                {f.title}
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
