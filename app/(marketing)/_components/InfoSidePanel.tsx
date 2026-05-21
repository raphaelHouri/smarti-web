"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Star, ChevronLeft } from "lucide-react";

import { WhatsappGroupPromo } from "./WhatsappGroupPromo";
import { cn } from "@/lib/utils";
import { homeMarketingFaq } from "../_data/homeFaq";

const sidebarFaq = homeMarketingFaq.slice(0, 5);

const APP_STORE_URL =
  "https://apps.apple.com/il/app/%D7%A1%D7%9E%D7%90%D7%A8%D7%98%D7%99-%D7%94%D7%9B%D7%A0%D7%94-%D7%9C%D7%9E%D7%91%D7%97%D7%9F-%D7%94%D7%9E%D7%97%D7%95%D7%A0%D7%A0%D7%99%D7%9D/id6462846082";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.mehunanim.mehunanima&hl=he";

/** Intrinsic pixel size of badge assets in /public/app-store (matches IHDR) */
const APPLE_STORE_BADGE = { width: 161, height: 57 } as const;
const GOOGLE_PLAY_BADGE = { width: 171, height: 57 } as const;

const trustPoints = [
  "הגוף הוותיק והמוביל בישראל להכנה למחוננים",
  "לומדה אדפטיבית + סימולציות מלאות",
  "הדרכת הורים אישית כלולה בכל תוכנית",
];

const testimonials = [
  {
    quote: "הבת שלי נכנסה לכיתת מחוננים. ממליצה בחום לכל הורה!",
    author: "רחל ב.",
    role: "אמא לתלמידת כיתה ב׳",
  },
  {
    quote: "תוך שבועיים ראינו שיפור משמעותי. הילד נהנה ומתקדם!",
    author: "יוסי מ.",
    role: "אבא לתלמיד כיתה ג׳",
  },
  {
    quote: "הבן שלי עבר את שלב א׳ בציון מדהים. תודה סמארטי!",
    author: "מיכל כ.",
    role: "אמא לתלמיד כיתה ב׳",
  },
];

export function InfoSidePanel({ whatsappGroupUrl }: { whatsappGroupUrl?: string | null }) {
  const [idx, setIdx] = useState(0);
  const [openFaqKey, setOpenFaqKey] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 3500);
    return () => clearInterval(id);
  }, []);

  const t = testimonials[idx];

  return (
    <aside
      className="flex flex-col h-full min-h-0 bg-slate-50/60 dark:bg-slate-900/40 border-l border-slate-200 dark:border-slate-700 overflow-hidden lg:overflow-visible"
      dir="rtl"
    >
      {/* ── Why Smarti ── */}
      <div className="px-4 pt-5 pb-5 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/15 [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-3 [@media(max-height:660px)]:pt-2 [@media(max-height:660px)]:pb-2">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-[0.18em] uppercase mb-3 [@media(max-height:660px)]:mb-2">
          למה סמארטי?
        </p>
        <ul className="flex flex-col gap-2.5 [@media(max-height:760px)]:gap-1.5">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
              <span className="text-xs text-neutral-700 dark:text-slate-300 leading-snug">
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── FAQ — clean info card ── */}
      <div className="px-4 pt-5 pb-5 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/15 [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-3 [@media(max-height:660px)]:pt-2 [@media(max-height:660px)]:pb-2">
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tracking-[0.18em] uppercase mb-3 lg:text-[10px] [@media(max-height:660px)]:mb-2">
          שאלות נפוצות
        </p>

        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          {sidebarFaq.map(({ question, answer, href }, i) => {
            const dest = href ?? "/faq";
            const isOpen = openFaqKey === question;
            const panelId = `sidebar-faq-panel-${i}`;
            const triggerId = `sidebar-faq-trigger-${i}`;
            return (
              <div key={question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={triggerId}
                  onClick={() => setOpenFaqKey(isOpen ? null : question)}
                  className="flex w-full items-start justify-between gap-2 px-4 py-3.5 text-right hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group lg:px-3 lg:py-2.5 [@media(max-height:660px)]:px-2.5 [@media(max-height:660px)]:py-1.5"
                >
                  <span className="text-sm text-neutral-700 dark:text-slate-300 leading-snug group-hover:text-neutral-900 dark:group-hover:text-slate-100 line-clamp-2 min-w-0 lg:text-[11px] [@media(max-height:660px)]:line-clamp-1 [@media(max-height:660px)]:text-xs">
                    {question}
                  </span>
                  <ChevronLeft
                    className={cn(
                      "w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:text-emerald-600 lg:h-3 lg:w-3",
                      isOpen && "-rotate-90"
                    )}
                    strokeWidth={2.2}
                    aria-hidden
                  />
                </button>
                {isOpen ? (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="px-4 pb-2.5 pt-0 [@media(max-height:660px)]:px-2.5 [@media(max-height:660px)]:pb-2 lg:px-3"
                  >
                    <p className="text-sm text-neutral-600 dark:text-slate-400 leading-relaxed line-clamp-3 lg:line-clamp-2 lg:text-[10px] [@media(max-height:660px)]:line-clamp-2 [@media(max-height:660px)]:text-xs">
                      {answer}
                    </p>
                    <Link
                      href={dest}
                      className="mt-1.5 inline-flex items-center gap-0.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:underline lg:text-[10px]"
                    >
                      למידע המלא
                      <ChevronLeft className="w-4 h-4 lg:h-3 lg:w-3" strokeWidth={2.2} />
                    </Link>
                  </div>
                ) : null}
              </div>
            );
          })}

          {/* Footer link */}
          <Link
            href="/faq"
            className="flex items-center justify-center gap-1 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors lg:px-3 lg:py-2 lg:text-[11px]"
          >
            <span>לכל השאלות</span>
            <ChevronLeft className="w-4 h-4 lg:h-3 lg:w-3" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {whatsappGroupUrl ? (
        <div className="hidden lg:block px-4 pt-4 pb-4 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/15 [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-3 [@media(max-height:700px)]:hidden">
          <WhatsappGroupPromo href={whatsappGroupUrl} />
        </div>
      ) : null}

      {/* ── App download — clean card (hidden on very short viewports to avoid clipping) ── */}
      <div className="px-4 pt-5 pb-5 border-b border-slate-200 dark:border-slate-700 bg-emerald-50/50 dark:bg-emerald-950/15 [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-3 [@media(max-height:700px)]:hidden">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-[0.18em] uppercase mb-3">
          הורדת האפליקציה
        </p>

        <div className="flex items-start gap-3 mb-3">
          <Image
            src="/smartiIcon.webp"
            alt="סמארטי"
            width={40}
            height={40}
            className="rounded-lg flex-shrink-0 border border-slate-200 dark:border-slate-700"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-800 dark:text-slate-100 leading-tight">
              סמארטי — הכנה למחוננים
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
              תרגול בכל מקום, גם ללא אינטרנט. זמין ל־iOS ול־Android.
            </p>
          </div>
        </div>

        {/* Store links — theme-aware badges (light vs dark artwork), size matches image width */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full rounded-lg px-1.5 py-1 bg-white dark:bg-neutral-900 ring-1 ring-slate-200 dark:ring-slate-600 shadow-sm hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900"
          >
            <Image
              src="/app-store/apple-black.png"
              alt="הורדה ב-App Store"
              width={APPLE_STORE_BADGE.width}
              height={APPLE_STORE_BADGE.height}
              className="object-contain object-center h-auto w-[min(100%,161px)] dark:hidden"
              sizes="(max-width: 360px) 45vw, 161px"
            />
            <Image
              src="/app-store/apple.png"
              alt="הורדה ב-App Store"
              width={APPLE_STORE_BADGE.width}
              height={APPLE_STORE_BADGE.height}
              className="object-contain object-center h-auto w-[min(100%,161px)] hidden dark:block"
              sizes="(max-width: 360px) 45vw, 161px"
            />
          </a>
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full rounded-lg px-1.5 py-1 bg-white dark:bg-neutral-900 ring-1 ring-slate-200 dark:ring-slate-600 shadow-sm hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900"
          >
            <Image
              src="/app-store/google-black.png"
              alt="הורדה ב-Google Play"
              width={GOOGLE_PLAY_BADGE.width}
              height={GOOGLE_PLAY_BADGE.height}
              className="object-contain object-center h-auto w-[min(100%,171px)] dark:hidden"
              sizes="(max-width: 360px) 48vw, 171px"
            />
            <Image
              src="/app-store/google.png"
              alt="הורדה ב-Google Play"
              width={GOOGLE_PLAY_BADGE.width}
              height={GOOGLE_PLAY_BADGE.height}
              className="object-contain object-center h-auto w-[min(100%,171px)] hidden dark:block"
              sizes="(max-width: 360px) 48vw, 171px"
            />
          </a>
        </div>
      </div>

      {/* ── Testimonial carousel ── */}
      <div className="px-4 pt-5 pb-5 flex flex-col gap-3 min-h-0 flex-1 bg-emerald-50/50 dark:bg-emerald-950/15 [@media(max-height:760px)]:px-3 [@media(max-height:760px)]:pt-3 [@media(max-height:760px)]:pb-3 [@media(max-height:660px)]:gap-2 [@media(max-height:660px)]:pt-2 [@media(max-height:660px)]:pb-2">
        <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-[0.18em] uppercase [@media(max-height:660px)]:mb-0">
          מה הורים אומרים
        </p>

        {/* Card — natural height; parent hero grows on lg so quotes are not clipped */}
        <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 [@media(max-height:660px)]:p-2 flex flex-col">
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xs text-neutral-700 dark:text-slate-300 leading-relaxed flex-1">
            {t.quote}
          </p>
          <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-2 mt-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex-shrink-0">
              {t.author[0]}
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-800 dark:text-slate-100 leading-none">{t.author}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{t.role}</p>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`המלצה ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === idx
                  ? "bg-emerald-600 dark:bg-emerald-500 w-5 h-1.5"
                  : "bg-slate-300 dark:bg-slate-600 w-1.5 h-1.5 hover:bg-slate-400 dark:hover:bg-slate-500"
                }`}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
