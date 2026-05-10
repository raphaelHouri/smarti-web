import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://smarti.co.il";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Traditional search crawlers
      { userAgent: "Googlebot",        allow: "/" },
      { userAgent: "Bingbot",          allow: "/" },
      { userAgent: "Applebot",         allow: "/" },
      // OpenAI — GPTBot = training; OAI-SearchBot + ChatGPT-User = search citations
      { userAgent: "GPTBot",           allow: "/" },
      { userAgent: "OAI-SearchBot",    allow: "/" },
      { userAgent: "ChatGPT-User",     allow: "/" },
      // Perplexity — both index crawler and on-demand fetch bot
      { userAgent: "PerplexityBot",    allow: "/" },
      { userAgent: "Perplexity-User",  allow: "/" },
      // Anthropic — Claude search
      { userAgent: "ClaudeBot",        allow: "/" },
      { userAgent: "anthropic-ai",     allow: "/" },
      { userAgent: "Claude-Web",       allow: "/" },
      // Common Crawl (used by many AI trainers downstream)
      { userAgent: "CCBot",            allow: "/" },
      // Catch-all for all other bots
      { userAgent: "*",                allow: "/" },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
