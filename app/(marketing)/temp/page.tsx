import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Script from "next/script";
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  Award,
  ClipboardList,
  Sparkles,
  LineChart,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  FileText,
  ExternalLink,
  MessageCircle,
  Users,
  Lock,
} from "lucide-react";

import {
  buildMetadata,
  buildFAQJsonLd,
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
} from "@/lib/seo";
import { StepPickerModal } from "../_components/StepPickerModal";
import { LearnEntryButton } from "../_components/LearnEntryButton";
import { SystemStepHandler } from "@/components/system-step-handler";
import { AndroidStoreHandlerWrapper } from "@/components/android-store-handler-wrapper";
import { MarketingAuthButtons } from "@/components/marketing-auth-buttons";
import { Button } from "@/components/ui/button";
import { getUserSystemStep } from "@/db/queries";

import { HomePageTracker } from "../_components/HomePageTracker";
import { LearningPreviewDeviceStack } from "../_components/LearningPreviewDeviceStack";
import { AppFeaturesGrid } from "../_components/AppFeaturesGrid";
import { HomeFAQ } from "../_components/HomeFAQ";
import { SeoKnowledgeHub } from "../_components/SeoKnowledgeHub";
import { homeMarketingFaq } from "../_data/homeFaq";

// Temp page is excluded from search engines so it doesn't compete with /
export const metadata: Metadata = {
  ...buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים (Temp)",
    description:
      "גרסת בדיקה לעמוד הבית. הפלטפורמה המובילה להכנה למבחני מחוננים ומצטיינים לכיתות ב–ג.",
  }),
  robots: { index: false, follow: false },
};

const faqDataForJsonLd = homeMarketingFaq.map(({ question, answer }) => ({
  question,
  answer,
}));

const trustStats = [
  { value: "10,000+", label: "ילדים הוכנו איתנו" },
  { value: "15%", label: "אחוז המעבר הארצי לשלב א׳" },
  { value: "97+", label: "אחוזון לסיווג כמחונן" },
  { value: "15", label: "שנות ניסיון פדגוגי" },
];

const howItWorks = [
  {
    icon: ClipboardList,
    title: "הרשמה ואבחון רמה",
    description:
      "המערכת מאתרת את נקודות החוזק והחולשה של הילד תוך כמה דקות ובונה מסלול אישי.",
  },
  {
    icon: Sparkles,
    title: "תרגול אדפטיבי יומי",
    description:
      "שאלות בקצב המותאם לילד — קלות יותר כשצריך, מאתגרות יותר כשהוא מוכן.",
  },
  {
    icon: LineChart,
    title: "סימולציות ומעקב",
    description:
      "סימולציות מלאות בתנאי מבחן ודוחות שבועיים להורים — שקיפות מלאה לאורך הדרך.",
  },
];

const testimonials = [
  {
    name: "מיכל כהן",
    context: "אמא לילד בכיתה ב׳, מודיעין",
    outcome: "עבר את שלב א׳ באחוזון 96",
    text: "הילד שלי עבר את מבחן שלב א׳ עם ציון מעולה. ההכנה האדפטיבית עם סמארטי עשתה את ההבדל — הוא הגיע למבחן בטוח ורגוע.",
  },
  {
    name: "יוסי לוי",
    context: "אבא לילדה בכיתה ג׳, חיפה",
    outcome: "התקבלה לכיתת מצטיינים",
    text: "התרגולים מגוונים, הדוחות מפורטים ותמיד יש למי לפנות. ראיתי בעיניים את ההתקדמות שלה שבוע אחרי שבוע.",
  },
  {
    name: "רחל ברק",
    context: "אמא לתלמידת כיתה ב׳, רעננה",
    outcome: "נכנסה לכיתת מחוננים",
    text: "בזכות סמארטי הבת שלי נכנסה לכיתת מחוננים. ההדרכה להורים הייתה משמעותית לא פחות מהתרגול עצמו.",
  },
];

const productHighlights = [
  "אלפי שאלות אדפטיביות בכל הנושאים של המבחן",
  "סימולציות מלאות בתנאי אמת לשלב א׳ ושלב ב׳",
  "דוחות התקדמות שבועיים להורים — בלי הפתעות",
  "ליווי פדגוגי והדרכת הורים אישית",
];

const WHATSAPP_URL =
  "https://wa.me/972586519423?text=" +
  encodeURIComponent("שלום, אשמח לקבל מידע על ההכנה למבחן מחוננים");

const officialSources = [
  {
    icon: BookOpen,
    title: "מסגרות שלב א׳ ושלב ב׳",
    description: "מידע רשמי על מבחן שלב א׳ ושלב ב׳ באתר הורים של משרד החינוך",
    href: "https://parents.education.gov.il/prhnet/gifted/primary-education-frameworks/first-test-b-and-c",
  },
  {
    icon: FileText,
    title: "מסלול קבלה לחינוך יסודי",
    description: "תהליך הקבלה הרשמי לחינוך מחוננים בבית הספר היסודי",
    href: "https://parents.education.gov.il/prhnet/gifted/primary-education-frameworks/acceptance-primary-education",
  },
  {
    icon: ExternalLink,
    title: "הוראת מנכ״ל — מסגרות מחוננים",
    description: "הוראת מנכ״ל משרד החינוך הקובעת את כללי המסגרות (siduri=243)",
    href: "https://apps.education.gov.il/Mankal/Horaa.aspx?siduri=243",
  },
  {
    icon: FileText,
    title: "מחקר age-effect — משרד החינוך",
    description: "מחקר ממשלתי על השפעת גיל הילד על תוצאות מבחן המחוננים (PDF)",
    href: "https://meyda.education.gov.il/files/gifted/age-effect-research.pdf",
  },
];

const credentials = [
  {
    icon: GraduationCap,
    title: "15 שנות ניסיון פדגוגי",
    description:
      "אלפי ילדים, שלוש מהדורות מבחן והתאמה מתמדת לפורמט המעודכן של משרד החינוך.",
  },
  {
    icon: LineChart,
    title: "גישה מבוססת נתונים",
    description:
      "כל שאלה נמדדת על סמך אלפי תשובות; הלומדה מתאימה את רמת הקושי אוטומטית לכל ילד.",
  },
  {
    icon: Users,
    title: "תוכנית אישית להורים",
    description:
      "ליווי והדרכת הורים אישיים — כי הורה מעורב משפיע על ההצלחה לא פחות מהתרגול.",
  },
];

const privacyBullets = [
  "ללא שיתוף נתונים עם צד ג׳",
  "נתוני התקדמות גלויים רק להורים",
  "אפשר למחוק חשבון בכל עת",
];

export default async function TempHome() {
  const { userId } = await auth();
  const currentStep = await getUserSystemStep(userId);

  return (
    <>
      <Script
        id="ld-website-temp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd()) }}
      />
      <Script
        id="ld-org-temp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
      <Script
        id="ld-faq-temp"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqDataForJsonLd)) }}
      />

      <HomePageTracker />
      <Suspense fallback={null}>
        <SystemStepHandler />
      </Suspense>
      <AndroidStoreHandlerWrapper />

      <div className="flex flex-col w-full min-w-0" dir="rtl">
        {/* ═══════════ 1. HERO — static, focused, one promise ═══════════ */}
        <section
          className="relative w-full bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-emerald-950/20 dark:via-background dark:to-background border-b border-slate-100 dark:border-slate-800 overflow-x-clip overflow-y-visible lg:overflow-visible"
          aria-label="ברוכים הבאים לסמארטי"
        >
          <div
            className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3"
            aria-hidden
          />
          <div className="relative max-w-screen-xl mx-auto px-4 sm:px-8 py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              {/* Text column */}
              <div className="flex flex-col gap-5 text-right order-2 lg:order-1">
                <span className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  הפלטפורמה המובילה בישראל להכנת מחוננים
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-slate-50 leading-tight">
                  הכנה רצינית למבחן המחוננים
                  <span className="block text-emerald-600 dark:text-emerald-400 mt-2">
                    שמותאמת בדיוק לילד שלכם
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-neutral-600 dark:text-slate-400 leading-relaxed max-w-xl">
                  תרגול אדפטיבי, סימולציות בתנאי אמת והדרכת הורים — כל מה שהילד
                  שלכם צריך כדי להגיע למבחן שלב א׳ או שלב ב׳ בביטחון.
                </p>

                {/* Inline trust bar */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-neutral-700 dark:text-slate-300">
                      4.9
                    </span>
                  </div>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                  <span>
                    <strong className="text-neutral-800 dark:text-slate-100">10,000+</strong> הורים סומכים עלינו
                  </span>
                  <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                  <span>
                    <strong className="text-neutral-800 dark:text-slate-100">15</strong> שנות ניסיון
                  </span>
                </div>

                {/* Step picker — the product entry point */}
                <div className="mt-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-3 tracking-wide">
                    באיזה שלב הילד שלכם?
                  </p>
                  <Suspense fallback={null}>
                    <StepPickerModal isAuthenticated={!!userId} initialStep={currentStep} />
                  </Suspense>
                  <div className="mt-3 flex flex-col gap-2">
                    <MarketingAuthButtons />
                    {!userId && (
                      <LearnEntryButton
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-emerald-700 h-auto font-normal"
                        trackSource="temp_guest"
                      >
                        המשך כאורח ללא הרשמה
                      </LearnEntryButton>
                    )}
                  </div>
                </div>
              </div>

              {/* Image column — hero + device fan (lg+ only) */}
              <div className="order-1 lg:order-2 relative overflow-visible">
                <div className="relative w-full aspect-[4/3] isolate overflow-visible">
                  <div className="absolute inset-0 z-10 rounded-2xl overflow-hidden shadow-2xl border border-emerald-100 dark:border-emerald-900/40 bg-white dark:bg-slate-900">
                    <Image
                      src="/hero.webp"
                      alt="לומדת סמארטי להכנה למבחני מחוננים ומצטיינים"
                      fill
                      sizes="(max-width: 1024px) 100vw, 600px"
                      className="object-cover"
                      priority
                    />
                  </div>
                  <div className="hidden lg:block absolute inset-0 z-20">
                    <LearningPreviewDeviceStack variant="hero" />
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 right-4 sm:right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-100 dark:border-slate-800">
                  <Award className="w-5 h-5 text-emerald-500" />
                  <div className="text-right">
                    <p className="text-xs font-bold text-neutral-800 dark:text-slate-100 leading-tight">
                      מומלץ ע״י הורים ומורים
                    </p>
                    <p className="text-[10px] text-muted-foreground">15 שנות ניסיון פדגוגי</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 2. TRUST STRIP — full-width stats ═══════════ */}
        <section
          className="w-full bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800"
          aria-label="סמארטי במספרים"
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-8 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {trustStats.map((stat) => (
                <div key={stat.label} className="text-center flex flex-col gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                    {stat.value}
                  </span>
                  <span className="text-xs sm:text-sm text-neutral-600 dark:text-slate-400 leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 3. PROBLEM → SOLUTION ═══════════ */}
        <section className="w-full bg-white dark:bg-background py-14 sm:py-20 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
              למה זה חשוב
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50 leading-snug">
              מבחן המחוננים הוא הזדמנות חד-פעמית.
              <br />
              הכנה נכונה משנה את התוצאה.
            </h2>
            <p className="text-base text-neutral-600 dark:text-slate-400 leading-relaxed">
              סוג השאלות במבחן שונה ממה שילדים פוגשים בבית הספר — חשיבה לוגית,
              אנלוגיות, סדרות צורניות וכישורי שפה ברמה גבוהה. אצלנו הילד שלכם
              מתרגל בדיוק את סוגי השאלות האלה, בקצב שלו, עם משוב מקצועי.
            </p>
          </div>
        </section>

        {/* ═══════════ 4. FEATURES GRID — full width, on white ═══════════ */}
        <section className="w-full bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-screen-xl mx-auto">
            <AppFeaturesGrid />
          </div>
        </section>

        {/* ═══════════ 5. HOW IT WORKS — 3 numbered steps ═══════════ */}
        <section
          className="w-full bg-white dark:bg-background py-14 sm:py-20 px-4 sm:px-8"
          aria-label="איך זה עובד"
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase mb-3 block">
                איך זה עובד
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
                שלושה צעדים פשוטים להכנה מקצועית
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
              {/* Connecting line on desktop (RTL: right-to-left) */}
              <div
                className="hidden md:block absolute top-8 right-[16.66%] left-[16.66%] h-px bg-gradient-to-l from-emerald-200 via-emerald-300 to-emerald-200 dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-800"
                aria-hidden
              />

              {howItWorks.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="relative flex flex-col items-center text-center gap-3"
                  >
                    <div className="relative w-16 h-16 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-400 dark:border-emerald-600 flex items-center justify-center shadow-md z-10">
                      <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                        {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-slate-50 mt-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══════════ 6. AUTHORITY SOURCES — official Ministry links ═══════════ */}
        <section
          className="w-full bg-white dark:bg-background border-b border-slate-100 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-8"
          dir="rtl"
          aria-label="מקורות רשמיים של משרד החינוך"
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase mb-3 block">
                שקיפות ומקורות
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
                מבוססים על המקורות הרשמיים
              </h2>
              <p className="mt-3 text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
                סמארטי מתייחסת למקורות הרשמיים של משרד החינוך — מסגרות, מסלולי קבלה ומחקרים — כדי שתמיד תדעו שאתם מקבלים מידע מדויק.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {officialSources.map((source) => {
                const Icon = source.icon;
                return (
                  <a
                    key={source.href}
                    href={source.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        מקור רשמי
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                    <p className="font-bold text-sm text-neutral-800 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 leading-snug transition-colors">
                      {source.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {source.description}
                    </p>
                  </a>
                );
              })}
            </div>

            <p className="mt-6 text-center text-[11px] text-muted-foreground">
              אנו מפנים למקורות הרשמיים לצורך מידע בלבד. סמארטי אינה גוף ממשלתי ואינה קשורה רשמית למשרד החינוך.
            </p>
          </div>
        </section>

        {/* ═══════════ 7. PRODUCT PREVIEW — screenshot + highlights, no fake play ═══════════ */}
        <section
          className="w-full bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800 py-14 sm:py-20 px-4 sm:px-8"
          aria-label="הצצה ללומדה"
        >
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Text side */}
            <div className="flex flex-col gap-5 text-right">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
                הצצה ללומדה
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50 leading-snug">
                לומדה אינטראקטיבית שמתאימה את עצמה לכל ילד
              </h2>
              <ul className="flex flex-col gap-3 mt-2">
                {productHighlights.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-neutral-700 dark:text-slate-300 leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-3">
                <LearnEntryButton variant="secondary" size="lg" trackSource="temp_preview">
                  כניסה ללומדה
                </LearnEntryButton>
              </div>
            </div>

            {/* Image side — hero screenshot + staggered device frames (animated) */}
            <div className="relative w-full overflow-visible px-2 sm:px-4 lg:px-6 pt-6 sm:pt-8">
              <div className="relative mx-auto w-full max-w-[580px] lg:max-w-[620px] isolate overflow-visible">
                <div className="relative z-10 aspect-video rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <Image
                    src="/hero.webp"
                    alt="תצוגה מקדימה של לומדת סמארטי להכנה למבחן מחוננים"
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-cover"
                  />
                </div>
                <LearningPreviewDeviceStack variant="productPreview" />
                <p className="relative z-10 text-xs text-muted-foreground mt-3 text-center">
                  צילום מסך מתוך הלומדה
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ 8. CREDENTIALS / PEDAGOGY — E-E-A-T ═══════════ */}
        <section
          className="w-full bg-white dark:bg-background py-14 sm:py-20 px-4 sm:px-8"
          dir="rtl"
          aria-label="הצוות הפדגוגי של סמארטי"
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase mb-3 block">
                מי עומד מאחורי הלומדה
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
                למה הורים בוחרים בסמארטי
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {credentials.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex flex-col gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-lg font-bold text-neutral-900 dark:text-slate-50">
                        {item.title}
                      </h3>
                      <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-10 text-center text-xs text-muted-foreground max-w-xl mx-auto leading-relaxed">
              בהובלת הצוות הפדגוגי של סמארטי — מומחים בהכנה למבחני מחוננים ומצטיינים עם ניסיון של שנים בעבודה עם ילדים והורים.
            </p>
          </div>
        </section>

        {/* ═══════════ 9. TESTIMONIALS — enriched with grade + city + outcome ═══════════ */}
        <section
          className="w-full bg-white dark:bg-background py-14 sm:py-20 px-4 sm:px-8"
          aria-label="המלצות הורים"
        >
          <div className="max-w-screen-xl mx-auto">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase mb-3 block">
                המלצות
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
                הורים מספרים על החוויה
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
              {testimonials.map((t) => (
                <article
                  key={t.name}
                  className="relative flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-slate-300 leading-relaxed flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex flex-col gap-1">
                    <p className="text-sm font-bold text-neutral-900 dark:text-slate-100">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.context}</p>
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
                      ✓ {t.outcome}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 10. FAQ — full width, not split ═══════════ */}
        <section className="w-full bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-8">
            <HomeFAQ />
          </div>
        </section>

        {/* ═══════════ 11. SEO KNOWLEDGE HUB — moved below FAQ ═══════════ */}
        <SeoKnowledgeHub />

        {/* ═══════════ 12. PRIVACY + CONTACT BAND ═══════════ */}
        <section
          className="w-full bg-slate-50/80 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800 py-12 sm:py-16 px-4 sm:px-8"
          dir="rtl"
          aria-label="פרטיות ויצירת קשר"
        >
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-start">
            {/* Privacy column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-slate-50">
                  הפרטיות של הילדים שלכם מוגנת
                </h2>
              </div>
              <ul className="flex flex-col gap-2.5 mt-1">
                {privacyBullets.map((point) => (
                  <li key={point} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-neutral-700 dark:text-slate-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-slate-50">
                  יש שאלות? הצוות הפדגוגי לרשותכם
                </h2>
              </div>
              <div className="flex flex-wrap gap-3 mt-1">
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" asChild>
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    שלחו הודעה בווטסאפ
                  </a>
                </Button>
                <Button size="sm" variant="secondaryOutline" asChild>
                  <Link href="/faq">כל השאלות והתשובות</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                זמן מענה ממוצע: כמה שעות בימי חול.
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════ 13. FINAL CTA — the only saturated emerald block ═══════════ */}
        <section
          className="w-full py-16 sm:py-20 px-4 text-center bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-700 dark:to-green-800"
          aria-label="קריאה לפעולה"
        >
          <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-5">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              מוכנים להתחיל את ההכנה?
            </h2>
            <p className="text-base text-white/90 max-w-md">
              הצטרפו לאלפי הורים שמכינים את הילדים שלהם למבחן המחוננים עם
              סמארטי — בלי לחץ, עם תוצאות.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <LearnEntryButton
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg px-8"
                trackSource="temp_footer"
              >
                התחילו עכשיו — בחינם
              </LearnEntryButton>
              <Button
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 font-semibold"
                asChild
              >
                <Link href="/faq" className="inline-flex items-center gap-1">
                  עוד שאלות?
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
