import type { Metadata } from "next";

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
