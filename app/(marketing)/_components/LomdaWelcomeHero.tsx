"use client";

import { ShieldCheck, Sparkles, Layers, BarChart2 } from "lucide-react";
import { LearnEntryButton } from "./LearnEntryButton";
import Image from "next/image";
import { WelcomeConfetti } from "./WelcomeConfetti";
import { WhatsappGroupPromo } from "./WhatsappGroupPromo";

const heroValueProps = [
  {
    Icon: Sparkles,
    title: "אדפטיבי באמת",
    description: "כל שאלה מתאימה את עצמה לרמת הילד — בלי לאבד תחושת הצלחה.",
  },
  {
    Icon: Layers,
    title: "סימולציות מלאות",
    description: "חוויית מבחן מקצה לקצה — טיימר, פורמט ודוח בסוף.",
  },
  {
    Icon: BarChart2,
    title: "שקיפות להורים",
    description: "גרפים שמראים בדיוק היכן הילד משתפר ומה עוד צריך חיזוק.",
  },
];

export function LomdaWelcomeHero({ whatsappGroupUrl }: { whatsappGroupUrl?: string | null }) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-background border-b border-slate-100 dark:border-slate-800" dir="rtl">
      <WelcomeConfetti />
      <div className="w-full px-4 sm:px-6 lg:pl-0 pt-12 lg:pt-20 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-12 lg:gap-0 items-center max-w-screen-3xl mx-auto">
          {/* Right side (Text & Actions) */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-right gap-6 lg:gap-8 z-10 lg:col-span-1 lg:col-start-1 lg:row-span-2 xl:col-span-2 xl:row-span-1 lg:pl-12 lg:pr-8 [1920]:pr-8 max-w-xl mx-auto lg:mx-0">
            <span className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-700 dark:bg-emerald-800 text-white text-[11px] font-bold tracking-[0.06em]">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.5} />
              הלומדה שלנו — מקצה לקצה
            </span>

            {/* Mobile Image (shown under badge) */}
            <div className="relative w-full h-[220px] sm:h-[300px] lg:hidden -my-2 flex items-center justify-center">
              <Image
                src="/lomda/cool-BG-smarti.png"
                alt="מסכי לומדת סמארטי מרהיבים"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 0vw"
                className="object-contain"
              />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-neutral-900 dark:text-slate-50 leading-[1.15] tracking-tight">
              הלומדה שלנו —
              <br className="hidden sm:block" />
              <span className="text-emerald-700 dark:text-emerald-400">כל מה שצריך כדי להגיע מוכנים.</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutral-600 dark:text-slate-400 leading-relaxed max-w-lg">
              תרגול אדפטיבי, סימולציות אמיתיות ודוחות התקדמות שקופים — בליווי קבוצת הורים פעילה
              וחוברות מודפסות שמשתלבות עם המסך.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 w-full mt-2 mx-auto lg:mx-0">
              <LearnEntryButton
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto px-12 group relative animate-bounce-few overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-100 py-3.5 text-lg"
                trackSource="lomda_hero"
              >
                כניסה ללומדה
              </LearnEntryButton>
            </div>

            {whatsappGroupUrl && (
              <div className="mt-2 w-full sm:max-w-md mx-auto lg:mx-0">
                <WhatsappGroupPromo href={whatsappGroupUrl} />
              </div>
            )}
          </div>

          {/* Features List (Dynamic Grid Placement) */}
          <ul className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 gap-4 mt-4 lg:mt-0 w-full z-10 lg:col-span-1 lg:col-start-2 lg:row-start-2 xl:col-span-5 xl:col-start-1 xl:row-start-3 lg:pl-12 lg:pr-8 [1920]:pr-8 max-w-xl mx-auto lg:max-w-none lg:mx-0 xl:pt-12">
              {heroValueProps.map((prop) => {
                const Icon = prop.Icon;
                return (
                  <li
                    key={prop.title}
                    className="flex flex-col items-center text-center lg:items-start lg:text-right gap-2 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-white/80 dark:bg-slate-900/60 px-4 py-4 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-1">
                      <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-800 dark:text-slate-100 leading-tight mb-1">{prop.title}</p>
                      <p className="text-xs text-muted-foreground leading-snug">{prop.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

          {/* Left side (Devices) */}
          <div className="relative hidden lg:flex lg:col-span-1 lg:col-start-2 lg:row-start-1 xl:col-span-3 xl:col-start-3 xl:row-span-2 w-full min-h-[400px] max-h-[70vh] h-[500px] xl:h-[min(600px,70vh)] z-0 items-center justify-center">
            {/* Center glow — fades to transparent, no edge clipping */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(55%,420px)] aspect-square pointer-events-none bg-[radial-gradient(circle,rgba(110,231,183,0.45)_0%,rgba(110,231,183,0.18)_45%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(6,78,59,0.5)_0%,rgba(6,78,59,0.2)_45%,transparent_72%)]"
              aria-hidden
            />

            {/* The stack itself */}
            <div className="relative w-full h-full">
              <Image
                src="/lomda/cool-BG-smarti.png"
                alt="מסכי לומדת סמארטי מרהיבים"
                fill
                priority
                sizes="(min-width: 1280px) 60vw, (min-width: 1024px) 50vw, 100vw"
                className="object-contain object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}