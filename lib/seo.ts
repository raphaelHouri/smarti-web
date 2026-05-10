import type { Metadata } from "next";

const SITE_URL = "https://smarti.co.il";

// ─── JSON-LD helpers ────────────────────────────────────────────────────────

export function buildFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    // SpeakableSpecification signals to AI/voice engines which selectors hold citable text
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", ".faq-answer", "article p", "details div"],
    },
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "סמארטי",
    url: SITE_URL,
    inLanguage: "he-IL",
    description: "פלטפורמה להכנה למבחני מחוננים ומצטיינים לכיתות ב–ג",
    // llms.txt for AI consumption
    significantLink: [`${SITE_URL}/llms.txt`, `${SITE_URL}/llms-full.txt`],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/learn?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    // EducationalOrganization gives Israeli search engines extra context
    "@type": ["Organization", "EducationalOrganization"],
    name: "סמארטי",
    url: SITE_URL,
    // Updated to the WebP version (15 KB instead of 1.3 MB)
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/smartiLogo.webp`,
      width: 400,
      height: 112,
    },
    foundingDate: "2023",
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    knowsAbout: [
      "הכנה למחוננים",
      "מבחני מחוננים בישראל",
      "שלב א מחוננים",
      "שלב ב מחוננים",
      "מצטיינים",
      "פדגוגיה",
      "חינוך מחוননים",
    ],
    sameAs: [
      // Add your social/directory URLs here when available, e.g.:
      // "https://www.facebook.com/smarti.co.il",
      // "https://www.linkedin.com/company/smarti-gifted",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+972-58-651-9423",
      contactType: "customer service",
      availableLanguage: "Hebrew",
      contactOption: "TollFree",
    },
  };
}

export function buildCourseJsonLd(params: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      "@type": "Organization",
      name: "סמארטי",
      url: "https://smarti.co.il",
    },
    inLanguage: "he-IL",
  };
}

export function buildArticleJsonLd(params: {
  headline: string;
  description: string;
  url: string;
  /** ISO date string e.g. "2025-10-01". Defaults to today. */
  datePublished?: string;
  dateModified?: string;
}) {
  const date = params.dateModified ?? new Date().toISOString().slice(0, 10);
  const published = params.datePublished ?? date;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    url: params.url,
    inLanguage: "he-IL",
    datePublished: published,
    dateModified: date,
    // SpeakableSpecification so voice/AI knows what to cite
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "article p", ".guide-summary"],
    },
    image: {
      "@type": "ImageObject",
      url: `${SITE_URL}/smartiLogo.webp`,
      width: 400,
      height: 112,
    },
    author: {
      "@type": "Organization",
      name: "סמארטי",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "סמארטי",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/smartiLogo.webp`,
        width: 400,
        height: 112,
      },
    },
  };
}


export type BuildMetadataParams = {
    /** Visible page title */
    title: string;
    /** Meta description for search engines */
    description: string;
    /** Optional extra keywords to append */
    keywords?: string[];
    /** Optional canonical URL for the page */
    canonical?: string;
    /** Optional social share image(s) */
    images?: string[];
};

const DEFAULT_KEYWORDS: string[] = [
    "מחוננים",
    "מצטיינים",
    "הכנה למבחני מחוננים",
    "מבחן מחוננים כיתה ב",
    "כיתה ג",
    "תרגול אונליין",
    "סימולציות",
    "חוברות תרגילים",
    "למידה מותאמת אישית",
    "הדרכת הורים",
];

const DEFAULT_OPEN_GRAPH = {
    type: "website",
    locale: "he_IL",
    siteName: "סמארטי",
};

export function buildMetadata(params: BuildMetadataParams): Metadata {
    const allKeywords = [...DEFAULT_KEYWORDS, ...(params.keywords ?? [])];
    return {
        title: params.title,
        description: params.description,
        keywords: allKeywords,
        openGraph: {
            ...DEFAULT_OPEN_GRAPH,
            title: params.title,
            description: params.description,
            images: params.images,
        },
        twitter: {
            card: "summary_large_image",
            title: params.title,
            description: params.description,
            images: params.images,
        },
        // he-IL hreflang signals to Google that this content targets Israeli Hebrew searchers
        // (google.co.il), not just generic Hebrew. x-default handles international fallback.
        alternates: params.canonical
            ? {
                canonical: params.canonical,
                languages: {
                    "he-IL": params.canonical,
                    "x-default": params.canonical,
                },
              }
            : undefined,
    };
}
