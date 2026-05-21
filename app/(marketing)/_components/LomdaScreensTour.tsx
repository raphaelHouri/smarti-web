import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { lomdaScreens } from "../_data/lomdaScreens";

export function LomdaScreensTour() {
  return (
    <section
      id="screens"
      className="w-full py-20 px-4 sm:px-8 bg-gradient-to-b from-slate-50/70 to-white dark:from-slate-900/40 dark:to-background border-t border-slate-100 dark:border-slate-800 overflow-hidden"
      dir="rtl"
      aria-label="סיור במסכי הלומדה"
    >
      <div className="max-w-screen-xl mx-auto">
        <header className="flex flex-col items-center text-center gap-3 mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide">
            סיור במערכת
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-slate-50 tracking-tight">
            כל המסכים בלומדה — בפירוט
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mt-2">
            מה רואים מהרגע שנכנסים: בחירת נושא, תרגול אדפטיבי, סימולציה, דוחות התקדמות וטבלאות דירוג מובילים.
          </p>
        </header>

        <div className="flex flex-col gap-24 lg:gap-32">
          {lomdaScreens.map((screen, index) => {
            const imageOnRight = index % 2 === 0;
            return (
              <article
                key={screen.id}
                id={screen.id}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center",
                  (screen.secondaryImageSrcDesktop || screen.secondaryImageSrcMobile) && "group"
                )}
              >
                {/* Images Section */}
                <div className={cn("lg:col-span-7", imageOnRight ? "lg:order-2" : "lg:order-1")}>
                  <div className="relative w-full">
                    {/* Desktop Browser Mockup (Hidden on mobile) */}
                    <div className="hidden lg:block relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 shadow-2xl shadow-slate-200/50">
                      {/* Browser header */}
                      <div className="absolute top-0 w-full h-8 bg-slate-100/80 backdrop-blur flex items-center px-4 gap-2 z-40 border-b border-slate-200/80 pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                      </div>
                      
                      <div className={cn(
                        "absolute top-8 bottom-0 w-full z-20 transition-opacity duration-700 ease-in-out bg-white",
                        screen.secondaryImageSrcDesktop && "group-hover:opacity-0"
                      )}>
                        <Image
                          src={screen.imageSrcDesktop}
                          alt={screen.alt}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                        />
                      </div>
                      
                      {/* Secondary image for desktop if available */}
                      {screen.secondaryImageSrcDesktop && (
                        <div className="absolute top-8 bottom-0 w-full z-10 bg-white pointer-events-none">
                          <Image
                            src={screen.secondaryImageSrcDesktop}
                            alt={`${screen.alt} נוסף`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Mobile Phone Mockup (Hidden on desktop) */}
                    <div className="block lg:hidden relative w-full max-w-[280px] mx-auto aspect-[9/19.5] rounded-[2.5rem] overflow-hidden border-[6px] border-slate-900 bg-slate-900 shadow-xl">
                      <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-40 rounded-b-2xl w-[40%] mx-auto pointer-events-none"></div>
                      <div className={cn(
                        "absolute inset-0 bg-white overflow-hidden rounded-[2rem] z-20 transition-opacity duration-700 ease-in-out",
                        screen.secondaryImageSrcMobile && "group-hover:opacity-0"
                      )}>
                        <Image
                          src={screen.imageSrcMobile}
                          alt={screen.alt}
                          fill
                          className="object-contain"
                          sizes="(max-width: 1024px) 80vw, 0vw"
                        />
                      </div>
                      
                      {/* Secondary image for mobile if available */}
                      {screen.secondaryImageSrcMobile && (
                        <div className="absolute inset-0 bg-white overflow-hidden rounded-[2rem] z-10 pointer-events-none">
                          <Image
                            src={screen.secondaryImageSrcMobile}
                            alt={`${screen.alt} נוסף`}
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className={cn("lg:col-span-5", imageOnRight ? "lg:order-1" : "lg:order-2")}>
                  <div className="flex flex-col gap-4 text-right">
                    <div className="inline-flex items-center w-fit px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                      <span className="text-xs font-extrabold tracking-wide text-emerald-600">
                        מסך {index + 1} מתוך {lomdaScreens.length}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 dark:text-slate-50 leading-tight tracking-tight mt-2">
                      {screen.title}
                    </h3>
                    <p className="text-base sm:text-lg text-neutral-600 dark:text-slate-400 leading-relaxed mt-2">
                      {screen.description}
                    </p>
                    
                    <div className="h-px w-12 bg-slate-200 my-4"></div>
                    
                    <ul className="flex flex-col gap-3 mt-2">
                      {screen.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-3 text-base text-neutral-700 dark:text-slate-300"
                        >
                          <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                            <Check
                              className="w-3.5 h-3.5 text-emerald-600"
                              strokeWidth={3}
                              aria-hidden
                            />
                          </div>
                          <span className="leading-snug font-medium">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
