import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type WhatsappGroupPromoProps = {
  href: string;
  className?: string;
};

/** Shared “קבוצת הורים” promo — מובייל שטוח ונקי; סיידבר דסקטופ קומפקטי (lg:). */
export function WhatsappGroupPromo({ href, className }: WhatsappGroupPromoProps) {
  return (
    <div className={cn(className)} dir="rtl">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 lg:mb-2.5 lg:text-[10px] lg:tracking-[0.18em]">
        קהילת הורים
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group flex min-h-[52px] items-center gap-3 rounded-xl border border-green-200/90 bg-white px-4 py-3 transition-colors sm:gap-3.5",
          "hover:bg-green-50/90 dark:border-green-800 dark:bg-green-950/15 dark:hover:bg-green-950/35",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
          "lg:min-h-0 lg:rounded-xl lg:border-green-200 lg:px-3 lg:py-2.5 dark:lg:border-green-800 dark:lg:bg-green-950/20"
        )}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-500 lg:size-8">
          <svg viewBox="0 0 24 24" className="size-[18px] fill-white lg:size-4" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.855L.057 23.57a.75.75 0 00.912.912l5.716-1.47A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.192-1.455l-.372-.223-3.892 1.001 1.003-3.892-.222-.373A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </span>
        <div className="min-w-0 flex-1 text-start">
          <p className="text-sm font-semibold leading-snug text-neutral-800 dark:text-slate-100 lg:text-[11px] lg:font-bold lg:leading-tight">
            קבוצת ווטסאפ להורים
          </p>
          <p className="mt-0.5 text-xs leading-snug text-neutral-600 dark:text-slate-400 lg:mt-0.5 lg:text-[10px] lg:leading-tight">
            קבוצה פתוחה לכולם · כניסה חופשית
          </p>
        </div>
        <ChevronLeft
          className="size-4 shrink-0 text-green-600 opacity-80 group-hover:opacity-100 lg:size-3.5 dark:text-green-500"
          strokeWidth={2.5}
        />
      </a>
    </div>
  );
}
