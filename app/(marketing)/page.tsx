import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Script from "next/script";

import { Clock, PenLine, BarChart2, ShieldCheck, TrendingUp } from "lucide-react";

import {
  buildMetadata,
  buildFAQJsonLd,
  buildWebSiteJsonLd,
  buildOrganizationJsonLd,
  buildSoftwareApplicationJsonLd,
} from "@/lib/seo";
import { AndroidStoreHandlerWrapper } from "@/components/android-store-handler-wrapper";
import { SystemStepHandler } from "@/components/system-step-handler";
import { HomePageTracker } from "./_components/HomePageTracker";
import { LearningPreviewDeviceStack } from "./_components/LearningPreviewDeviceStack";
import { PageTemplate } from "./_components/PageTemplate";
import { AppFeaturesGrid } from "./_components/AppFeaturesGrid";
import { HomeFAQ } from "./_components/HomeFAQ";
import { LearnEntryButton } from "./_components/LearnEntryButton";
import { SeoKnowledgeHub } from "./_components/SeoKnowledgeHub";
import { WhatsappGroupPromo } from "./_components/WhatsappGroupPromo";
import { homeMarketingFaq } from "./_data/homeFaq";
import db from "@/db/drizzle";
import { systemConfig } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

export const metadata: Metadata = buildMetadata({
  title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
  description:
    "סמארטי — הפלטפורמה המובילה להכנה למבחני מחוננים ומצטיינים לכיתות ב–ג. תרגולים אונליין, חוברות מודפסות, שיעורים פרונטליים והדרכת הורים. הכנה למבחן מחוננים שלב א ושלב ב.",
  keywords: [
    "הכנה למבחן מחוננים",
    "מחוננים ומצטיינים",
    "הכנה למחוננים",
    "הכנה למחוננים כיתה א ב ג",
  ],
  canonical: "https://smarti.co.il",
});

const baseCarouselSlides = [
  {
    title: "הכנה למבחן מחוננים שלב א׳",
    description:
      "שאלות מותאמות לכיתה ב׳ עם תרגול אדפטיבי — מתחילים מהבסיס ומתקדמים בקצב הילד",
    imageSrc: "/smarti_step1.webp",
  },
  {
    title: "הכנה למבחן מחוננים שלב ב׳",
    description:
      "חיזוק חשיבה לוגית, אנלוגיות וסדרות צורניות — ההכנה המלאה לשלב ב׳ כיתה ג׳",
    imageSrc: "/smarti_step2.webp",
  },
  {
    title: "מחוננים ומצטיינים — יחד נצליח",
    description:
      "סימולציות מלאות, חוברות מודפסות ושיעורים אונליין עם מורים מנוסים",
    imageSrc: "/smarti_step3.webp",
  },
];

const faqDataForJsonLd = homeMarketingFaq.map(({ question, answer }) => ({
  question,
  answer,
}));

const testimonials = [
  {
    name: "מיכל כהן",
    text: "הילד שלי עבר את מבחן שלב א׳ עם ציון מעולה! ההכנה עם סמארטי שינתה הכל.",
  },
  {
    name: "יוסי לוי",
    text: "פלטפורמה מדהימה — התרגולים מגוונים, הדיווחים מפורטים ותמיד יש תמיכה.",
  },
  {
    name: "רחל ברק",
    text: "בזכות סמארטי הבת שלי נכנסה לכיתת מחוננים. ממליצה בחום לכל הורה!",
  },
];

const heroHowItWorksSteps = [
  {
    Icon: Clock,
    title: "הרשמה לשלב המתאים",
    description: "בוחרים את השלב הנכון לילד",
    highlight: false,
  },
  {
    Icon: PenLine,
    title: "תרגול וסימולציות",
    description: "פותרים שאלות אמיתיות מהמבחן",
    highlight: false,
  },
  {
    Icon: BarChart2,
    title: "תרגול אדפטיבי",
    description: "מתמקדים בנושאים שצריך חיזוק",
    highlight: false,
  },
  {
    Icon: TrendingUp,
    title: "שיפור הסיכויים",
    description: "20% שיפור ב-5 תרגולים בלבד",
    highlight: true,
  },
] as const;

export default async function Home() {
  const step1Config = await db.query.systemConfig.findFirst({
    where: eq(systemConfig.systemStep, 1),
    columns: { linkWhatsappGroup: true },
  });
  const whatsappGroupUrl = step1Config?.linkWhatsappGroup ?? null;

  const carouselSlides = whatsappGroupUrl
    ? [
        ...baseCarouselSlides,
        {
          title: "קבוצת הורים פתוחה בווטסאפ",
          description: "הצטרפו לאלפי הורים — עדכונים, טיפים וליווי לאורך כל ההכנה. כניסה חופשית לכולם",
          imageSrc: "/smarti_whatsapp.png",
        },
      ]
    : baseCarouselSlides;

  const heroSlot = (
    <>
      <HomePageTracker />
      <Suspense fallback={null}>
        <SystemStepHandler />
      </Suspense>
      <AndroidStoreHandlerWrapper />

      {/* Hero: full-width trust + H1; then 50/50 — devices + hero | paragraph + CTAs */}
      <div
        className="flex flex-col gap-5 [@media(max-height:820px)]:gap-4 [@media(max-height:760px)]:gap-3 w-full min-h-0 lg:pb-4 xl:pb-5"
        dir="rtl"
      >

        {/* Trust badge + Social proof — one row above H1 */}
        <div className="flex items-center justify-between gap-4 [@media(max-height:660px)]:hidden">

          {/* Right: trust badge */}
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-800 text-white text-[11px] font-bold tracking-[0.06em] flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
            הפלטפורמה המובילה בישראל להכנת מחוננים
          </span>

          {/* Left: social proof stats */}
          <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-neutral-900 dark:text-slate-50 tabular-nums leading-none">10,000+</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">הורים</span>
            </div>
            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
            <a
              href="https://play.google.com/store/apps/details?id=com.mehunanim.mehunanima&hl=gsw"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-700/70 transition"
              title="דירוג אפליקציה"
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-neutral-900 dark:text-slate-50 tabular-nums leading-none">4.9</span>
                <svg viewBox="0 0 20 20" className="w-3 h-3 fill-amber-400 flex-shrink-0">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5">דירוג</span>
            </a>

            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700" />
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-neutral-900 dark:text-slate-50 tabular-nums leading-none">15</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">שנות ניסיון</span>
            </div>
          </div>

        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-slate-50 leading-[1.15] tracking-tight max-w-[900px]">
          הכנה רצינית למבחן המחוננים,
          <br />
          <span className="text-emerald-700 dark:text-emerald-400">
            מותאמת בדיוק לילד שלכם.
          </span>
        </h1>

        {/* One column below lg; two columns from lg (text | devices) */}
        <div className="flex flex-col gap-6 w-full min-w-0 min-h-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <div className="flex flex-col gap-3 text-right min-w-0 w-full order-1">
            <p className="text-base sm:text-lg [@media(max-height:820px)]:text-sm [@media(max-height:760px)]:text-sm [@media(max-height:660px)]:hidden text-neutral-600 dark:text-slate-400 leading-relaxed">
              תרגול אדפטיבי, סימולציות אמת והדרכת הורים — כל מה שהילד צריך
              כדי לגשת למבחן שלב א׳ או שלב ב׳ בביטחון מלא.
            </p>

            {/* Primary CTA */}
            <div className="flex flex-col gap-3 w-full md:w-auto md:max-w-md [@media(max-height:660px)]:gap-2">
              <LearnEntryButton
                variant="secondary"
                size="lg"
                className="w-full md:w-auto md:min-w-[280px] group relative animate-bounce-few overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-100"
                trackSource="home_hero"
              >
                כניסה ללומדה
              </LearnEntryButton>
            </div>

          </div>

          {/* Mobile/tablet image — visible up to lg, replaces the device stack */}
          <div className="block lg:hidden relative w-full h-[220px] sm:h-[280px] md:h-[340px] order-2 -my-2" aria-hidden>
            <Image
              src="/lomda/cool-BG-smarti.png"
              alt="מסכי לומדת סמארטי"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 0vw"
              className="object-contain"
            />
          </div>

          {/* Desktop device stack — visible from lg */}
          <div
            className="hidden lg:block relative w-full min-w-0 order-2 isolate overflow-visible lg:pt-4 lg:pb-4 xl:pb-5"
            aria-hidden
          >
            <div className="relative w-full aspect-[2/1] min-h-[11rem]">
              <LearningPreviewDeviceStack variant="hero" />
            </div>
          </div>
        </div>

      </div>

      {/* Mobile: קבוצת ווטסאפ במקום „איך זה עובד” */}
      {whatsappGroupUrl ? (
        <div
          className="lg:hidden w-full mt-4 sm:mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 px-0"
          aria-label="קהילת הורים בווטסאפ"
        >
          <WhatsappGroupPromo href={whatsappGroupUrl} />
        </div>
      ) : null}

      {/* ── How it works — במובייל מוסתר כשיש קישור ווטסאפ (מוצג במקום בלוק ווטסאפ למעלה) ── */}
      <div
        className={
          whatsappGroupUrl
            ? "hidden lg:block w-full mt-4 sm:mt-5 lg:mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:pt-2"
            : "w-full mt-4 sm:mt-5 lg:mt-6 pt-3 border-t border-slate-200 dark:border-slate-700 [@media(max-height:820px)]:mt-3 [@media(max-height:820px)]:pt-2"
        }
        dir="rtl"
        aria-label="איך זה עובד"
      >
        <div className="flex flex-col gap-2 [@media(max-height:900px)]:gap-1.5 text-center">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-widest uppercase">
            איך זה עובד
          </span>
          <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-slate-50 leading-snug">
            ארבעה צעדים פשוטים עד מבחן בביטחון
          </h2>
          <div className="relative pt-1 w-full min-w-0">
            {/* Horizontal connector through icon centers (4 cols, RTL) */}
            <div
              className="absolute top-[1.625rem] sm:top-[1.75rem] left-[10%] right-[10%] sm:left-[12.5%] sm:right-[12.5%] h-px bg-gradient-to-l from-emerald-200 via-emerald-300 to-emerald-200 dark:from-emerald-800 dark:via-emerald-700 dark:to-emerald-800 pointer-events-none z-[1]"
              aria-hidden
            />
            <div className="relative z-[2] grid grid-cols-4 gap-1 sm:gap-2 md:gap-3 w-full min-w-0">
              {heroHowItWorksSteps.map((item, idx) => {
                const Icon = item.Icon;
                const stepNum = idx + 1;
                return (
                  <div
                    key={item.title}
                    className="relative flex flex-col items-center text-center gap-1 min-w-0 px-0.5"
                  >
                    <div
                      className={[
                        "relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-md z-10 bg-white dark:bg-slate-900 border-2",
                        item.highlight
                          ? "border-emerald-600 dark:border-emerald-500"
                          : "border-emerald-400 dark:border-emerald-600",
                      ].join(" ")}
                    >
                      <Icon
                        className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 dark:bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shadow-sm tabular-nums">
                        {stepNum}
                      </span>
                    </div>
                    <h3
                      className={[
                        "text-[11px] sm:text-xs font-bold leading-tight mt-0.5",
                        item.highlight
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-neutral-900 dark:text-slate-50",
                      ].join(" ")}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-neutral-600 dark:text-slate-400 leading-snug">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </>
  );

  return (
    <>
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebSiteJsonLd()) }}
      />
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganizationJsonLd()) }}
      />
      <Script
        id="ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildSoftwareApplicationJsonLd()),
        }}
      />
      <Script
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqDataForJsonLd)) }}
      />

      <PageTemplate carouselSlides={carouselSlides} heroSlot={heroSlot} whatsappGroupUrl={whatsappGroupUrl}>

        {/* ─── הצצה ללומדה ─────────────────────────────── */}
        <section
          className="relative w-full py-12 px-4 sm:px-8 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50/40 dark:from-emerald-950/40 dark:via-background dark:to-background border-y border-emerald-100 dark:border-emerald-900/40"
          dir="rtl"
          aria-label="הצצה ללומדה שלנו"
        >
          {/* decorative circle */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-100/60 dark:bg-emerald-900/10 blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/3" aria-hidden />

          <div className="relative max-w-screen-lg mx-auto flex flex-col md:flex-row items-center gap-8">
            {/* Text — right */}
            <div className="flex-1 flex flex-col gap-4 text-right">
              <span className="inline-flex self-end items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold w-fit">
                לומדה חכמה
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-slate-50">
                הצצה ללומדה שלנו
              </h2>
              <p className="text-base text-neutral-600 dark:text-slate-400 leading-relaxed">
                פלטפורמה אינטראקטיבית עם אלפי שאלות, מעקב התקדמות בזמן אמת,
                משובים מידיים ותרגולים מותאמים לכל רמה — כל מה שהילד צריך
                להכנה מושלמת.
              </p>
              <div>
                <LearnEntryButton variant="secondary" size="lg" trackSource="home_learn_preview">
                  כניסה ללומדה
                </LearnEntryButton>
              </div>
            </div>

            {/* Image — left */}
            <div className="w-full md:w-[420px] flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30">
              <div className="relative aspect-video">
                <Image
                  src="/hero.webp"
                  alt="תצוגה מקדימה של לומדת סמארטי להכנה למבחן מחוננים ומצטיינים"
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 text-emerald-600 fill-current mr-[-2px]">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SeoKnowledgeHub />

        {/* ─── מה כוללת האפליקציה + שאלות נפוצות ─────── */}
        <section className="w-full border-t border-slate-100 dark:border-slate-800" dir="rtl">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Left 2/3 — features grid */}
            <div className="lg:w-2/3 lg:mr-40">
              <AppFeaturesGrid />
            </div>
            {/* Right 1/3 — FAQ with light background */}
            <div className="lg:w-1/3 bg-emerald-50/60 dark:bg-emerald-950/20 ">
              <HomeFAQ />
            </div>
          </div>
        </section>

        {/* ─── המלצות ─────────────────────────────────── */}
        <section
          className="w-full py-12 px-4 sm:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-background border-t border-slate-100 dark:border-slate-800"
          dir="rtl"
          aria-label="המלצות לקוחות"
        >
          <div className="max-w-screen-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-800 dark:text-slate-100 mb-8 text-center">
              מה ההורים אומרים עלינו
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="relative flex flex-col gap-3 p-5 pt-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* decorative quote mark */}
                  <span className="absolute top-3 right-4 text-5xl leading-none text-emerald-200 dark:text-emerald-800 font-serif select-none" aria-hidden>
                    &ldquo;
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} viewBox="0 0 20 20" className="w-4 h-4 fill-amber-400">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed flex-1">
                    {t.text}
                  </p>
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 border-t border-slate-100 dark:border-slate-800 pt-2 mt-auto">
                    {t.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA bottom ──────────────────────────────── */}
        <section
          className="w-full py-14 px-4 text-center bg-gradient-to-br from-emerald-500 to-green-500 dark:from-emerald-700 dark:to-green-700"
          dir="rtl"
          aria-label="קריאה לפעולה"
        >
          <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              מוכנים להתחיל את ההכנה?
            </h2>
            <p className="text-sm text-white/80">
              הצטרפו לאלפי ילדים שכבר מתכוננים למבחן המחוננים עם סמארטי
            </p>
            <LearnEntryButton
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg"
              trackSource="home_footer_cta"
            >
              התחל עכשיו — בחינם
            </LearnEntryButton>
          </div>
        </section>
      </PageTemplate>
    </>
  );
}
