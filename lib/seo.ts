import type { Metadata } from "next";

// ─── JSON-LD helpers ────────────────────────────────────────────────────────

export function buildFAQJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
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
    url: "https://smarti.co.il",
    inLanguage: "he-IL",
    description: "פלטפורמה להכנה למבחני מחוננים ומצטיינים לכיתות ב–ג",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://smarti.co.il/learn?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "סמארטי",
    url: "https://smarti.co.il",
    logo: "https://smarti.co.il/smartiLogo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+972-58-651-9423",
      contactType: "customer service",
      availableLanguage: "Hebrew",
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
  dateModified?: string;
}) {
  const date = params.dateModified ?? new Date().toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.headline,
    description: params.description,
    url: params.url,
    inLanguage: "he-IL",
    dateModified: date,
    author: {
      "@type": "Organization",
      name: "סמארטי",
      url: "https://smarti.co.il",
    },
    publisher: {
      "@type": "Organization",
      name: "סמארטי",
      url: "https://smarti.co.il",
      logo: {
        "@type": "ImageObject",
        url: "https://smarti.co.il/smartiLogo.png",
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
        alternates: params.canonical
            ? { canonical: params.canonical }
            : undefined,
    };
}
