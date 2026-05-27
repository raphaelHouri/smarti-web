import Script from "next/script";

import { buildSiteNavigationJsonLd } from "@/lib/seo";
import { marketingSiteNavLinks } from "../_data/marketingNav";

/**
 * Emits `SiteNavigationElement` JSON-LD on every marketing page. This mirrors
 * the visible primary nav in structured data and helps Google understand which
 * pages are top-level Sitelink candidates for brand queries on smarti.co.il.
 *
 * Server-rendered: no client JS, the script is in the initial HTML.
 */
export function MarketingSiteNavJsonLd() {
  const jsonLd = buildSiteNavigationJsonLd(marketingSiteNavLinks);
  return (
    <Script
      id="ld-site-navigation"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
