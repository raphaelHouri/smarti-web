import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smarti.co.il";
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl,                       lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${baseUrl}/shlab-a`,          lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${baseUrl}/shlab-b`,          lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${baseUrl}/kita-gimel`,       lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${baseUrl}/misgeret-mechonanim`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/madriche-holim`,       lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/acharei-mevchan`,     lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/mitztaynim`,            lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/tarugol-ve-simulatzia`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/sheelot-dugma`,         lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${baseUrl}/faq`,                   lastModified: now, changeFrequency: "weekly",  priority: 0.85 },
    { url: `${baseUrl}/lomda`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.85 },
    { url: `${baseUrl}/shop`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/shop/book`,        lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/shop/system`,      lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/policy`,           lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
