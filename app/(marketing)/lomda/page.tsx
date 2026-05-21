import Script from "next/script";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";

import db from "@/db/drizzle";
import { systemConfig } from "@/db/schemaSmarti";
import {
  getAllActivePlansForMarketing,
  type MarketingPlansByTypeAndStep,
} from "@/db/queries";
import {
  buildMetadata,
  buildFAQJsonLd,
  buildBreadcrumbJsonLd,
  buildCourseJsonLd,
} from "@/lib/seo";

import { LearnEntryButton } from "../_components/LearnEntryButton";
import { AppFeaturesGrid } from "../_components/AppFeaturesGrid";
import { LomdaPricingSection } from "../_components/LomdaPricingSection";
import { LomdaScreensTour } from "../_components/LomdaScreensTour";
import { LomdaPrepBooks } from "../_components/LomdaPrepBooks";
import { LomdaFaqSection } from "../_components/LomdaFaqSection";
import { LomdaWelcomeHero } from "../_components/LomdaWelcomeHero";
import { lomdaFaq } from "../_data/lomdaFaq";

const SITE_URL = "https://smarti.co.il";
const PAGE_URL = `${SITE_URL}/lomda`;

export const metadata: Metadata = buildMetadata({
  title: "הלומדה שלנו | סמארטי — מסכים, מחירים וחוברות הכנה למחוננים",
  description:
    "סיור מלא בלומדת סמארטי להכנה למבחני מחוננים: כל המסכים, מסלולי מנוי ומחירים שקופים, חוברות הכנה לכל שלב, קבוצת הורים בווטסאפ ושאלות נפוצות.",
  keywords: [
    "לומדה מחוננים",
    "מחירי הכנה למחוננים",
    "מסלולי לומדה",
    "חוברת הכנה מחוננים",
    "הצצה ללומדה",
    "לומדה סמארטי",
  ],
  canonical: PAGE_URL,
});

const emptyMarketingPlans: MarketingPlansByTypeAndStep = { system: {}, book: {} };

async function loadLomdaPageData(): Promise<{
  whatsappGroupUrl: string | null;
  marketingPlans: MarketingPlansByTypeAndStep;
  dbError: boolean;
}> {
  try {
    const [step1Config, marketingPlans] = await Promise.all([
      db.query.systemConfig.findFirst({
        where: eq(systemConfig.systemStep, 1),
        columns: { linkWhatsappGroup: true },
      }),
      getAllActivePlansForMarketing(),
    ]);
    return {
      whatsappGroupUrl: step1Config?.linkWhatsappGroup ?? null,
      marketingPlans,
      dbError: false,
    };
  } catch (err) {
    console.error("[LomdaPage] Database error (page will render without live pricing/WhatsApp from DB):", err);
    return {
      whatsappGroupUrl: null,
      marketingPlans: emptyMarketingPlans,
      dbError: true,
    };
  }
}

export default async function LomdaPage() {
  const { whatsappGroupUrl, marketingPlans, dbError } = await loadLomdaPageData();

  const faqJsonLd = buildFAQJsonLd(
    lomdaFaq.map(({ question, answer }) => ({ question, answer })),
  );
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "בית", url: SITE_URL },
    { name: "הלומדה שלנו", url: PAGE_URL },
  ]);
  const courseJsonLd = buildCourseJsonLd({
    name: "הלומדה של סמארטי — הכנה למבחני מחוננים ומצטיינים",
    description:
      "לומדה אדפטיבית עם אלפי שאלות, סימולציות מלאות וחוברות הכנה לכל שלב במבחני מחוננים בישראל.",
    url: PAGE_URL,
  });

  return (
    <div className="flex flex-col w-full min-w-0">
      <Script
        id="ld-lomda-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Script
        id="ld-lomda-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id="ld-lomda-course"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
    
      <LomdaWelcomeHero whatsappGroupUrl={whatsappGroupUrl} />

      <section
        className="w-full"
        dir="rtl"
        aria-label="מה כוללת הלומדה"
      >
        <AppFeaturesGrid />
      </section>

      {dbError ? (
        <div
          className="mx-4 sm:mx-8 my-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 px-4 py-3 text-sm text-amber-900 dark:text-amber-100 text-center"
          role="status"
          dir="rtl"
        >
          <p className="font-medium">לא הצלחנו לטעון כרגע מחירים מהשרת.</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            ניתן לראות מסלולים עדכניים ב־
            <Link href="/shop" className="font-bold underline underline-offset-2 mx-0.5">
              החנות
            </Link>
            או לנסות שוב בעוד רגע.
          </p>
        </div>
      ) : null}

      <LomdaScreensTour />

      <LomdaPricingSection plans={marketingPlans} />

      <LomdaPrepBooks plans={marketingPlans} />

      <LomdaFaqSection />

      <section
        className="w-full py-14 px-4 text-center bg-gradient-to-br from-emerald-500 to-green-500 dark:from-emerald-700 dark:to-green-700"
        dir="rtl"
        aria-label="קריאה לכניסה ללומדה"
      >
        <div className="max-w-screen-sm mx-auto flex flex-col items-center gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            מוכנים להיכנס ללומדה?
          </h2>
          <p className="text-sm text-white/85 leading-relaxed">
            בחירת שלב מתאים, התחלת תרגול מיידית, ומעקב התקדמות עבור ההורים — הכול במקום אחד.
          </p>
          <LearnEntryButton
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg"
            trackSource="lomda_footer"
          >
            התחל עכשיו
          </LearnEntryButton>
        </div>
      </section>
    </div>
  );
}
