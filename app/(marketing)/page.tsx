import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Script from "next/script";

import { buildMetadata, buildFAQJsonLd, buildWebSiteJsonLd, buildOrganizationJsonLd } from "@/lib/seo";
import { SystemStepTabs } from "@/components/system-step-tabs";
import { SystemStepHandler } from "@/components/system-step-handler";
import { AndroidStoreHandlerWrapper } from "@/components/android-store-handler-wrapper";
import { MarketingAuthButtons } from "@/components/marketing-auth-buttons";
import { Button } from "@/components/ui/button";
import { getUserSystemStep } from "@/db/queries";

import { HomePageTracker } from "./_components/HomePageTracker";
import { PageTemplate } from "./_components/PageTemplate";
import { AppFeaturesGrid } from "./_components/AppFeaturesGrid";
import { HomeFAQ } from "./_components/HomeFAQ";
import { SeoKnowledgeHub } from "./_components/SeoKnowledgeHub";
import { homeMarketingFaq } from "./_data/homeFaq";

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

const carouselSlides = [
  {
    title: "הכנה למבחן מחוננים שלב א׳",
    description:
      "שאלות מותאמות לכיתה ב׳ עם תרגול אדפטיבי — מתחילים מהבסיס ומתקדמים בקצב הילד",
    imageSrc: "/smarti_step1.png",
  },
  {
    title: "הכנה למבחן מחוננים שלב ב׳",
    description:
      "חיזוק חשיבה לוגית, אנלוגיות וסדרות צורניות — ההכנה המלאה לשלב ב׳ כיתה ג׳",
    imageSrc: "/smarti_step2.png",
  },
  {
    title: "מחוננים ומצטיינים — יחד נצליח",
    description:
      "סימולציות מלאות, חוברות מודפסות ושיעורים אונליין עם מורים מנוסים",
    imageSrc: "/smarti_step3.png",
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

export default async function Home() {
  const { userId } = await auth();
  const currentStep = await getUserSystemStep(userId);

  const heroSlot = (
    <>
      <HomePageTracker />
      <Suspense fallback={null}>
        <SystemStepHandler />
      </Suspense>
      <AndroidStoreHandlerWrapper />

      <div className="flex flex-col items-center gap-y-5 w-full max-w-[420px]">
        <Suspense fallback={null}>
          <SystemStepTabs isAuthenticated={!!userId} initialStep={currentStep} />
        </Suspense>

        <MarketingAuthButtons />

        {!userId && (
          <>
            <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
            <Button variant="primaryOutline" size="lg" className="w-full" asChild>
              <Link href="/learn">המשך כאורח</Link>
            </Button>
          </>
        )}
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
        id="ld-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFAQJsonLd(faqDataForJsonLd)) }}
      />

      <PageTemplate carouselSlides={carouselSlides} heroSlot={heroSlot}>

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
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-slate-50">
                הצצה ללומדה שלנו
              </h2>
              <p className="text-base text-neutral-600 dark:text-slate-400 leading-relaxed">
                פלטפורמה אינטראקטיבית עם אלפי שאלות, מעקב התקדמות בזמן אמת,
                משובים מידיים ותרגולים מותאמים לכל רמה — כל מה שהילד צריך
                להכנה מושלמת.
              </p>
              <div>
                <Button variant="secondary" size="lg" asChild>
                  <Link href="/learn">כניסה ללומדה</Link>
                </Button>
              </div>
            </div>

            {/* Image — left */}
            <div className="w-full md:w-[420px] flex-shrink-0 rounded-2xl overflow-hidden shadow-xl border border-emerald-100 dark:border-emerald-900/50 bg-white dark:bg-slate-900 ring-1 ring-emerald-200/50 dark:ring-emerald-800/30">
              <div className="relative aspect-video">
                <Image
                  src="/hero.png"
                  alt="תצוגה מקדימה של לומדת סמארטי להכנה למבחן מחוננים ומצטיינים"
                  fill
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
        <section className="w-full max-w-screen-lg mx-auto" dir="rtl">
          <div className="flex flex-col lg:flex-row">
            {/* Right 2/3 — features grid */}
            <div className="flex-1 lg:w-2/3 border-b lg:border-b-0 lg:border-l border-slate-100 dark:border-slate-800">
              <AppFeaturesGrid />
            </div>
            {/* Left 1/3 — FAQ */}
            <div className="lg:w-1/3">
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-800 dark:text-slate-100 mb-8 text-center">
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              מוכנים להתחיל את ההכנה?
            </h2>
            <p className="text-sm text-white/80">
              הצטרפו לאלפי ילדים שכבר מתכוננים למבחן המחוננים עם סמארטי
            </p>
            <Button
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg"
              asChild
            >
              <Link href="/learn">התחל עכשיו — בחינם</Link>
            </Button>
          </div>
        </section>
      </PageTemplate>
    </>
  );
}
