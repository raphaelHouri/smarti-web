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
          "group relative flex items-center gap-3.5 rounded-2xl p-3.5 sm:p-4 overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-[#25D366] to-[#128C7E] dark:from-[#1DA851] dark:to-[#0F7669]",
          "hover:shadow-lg hover:shadow-[#25D366]/25 hover:-translate-y-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950",
          "lg:gap-3 lg:rounded-xl lg:p-3"
        )}
      >
        {/* Decorative background glow */}
        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-150"></div>
        
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#128C7E] shadow-sm transition-transform duration-300 group-hover:scale-110 lg:size-9">
          <svg viewBox="0 0 24 24" className="size-6 fill-current lg:size-5" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.855L.057 23.57a.75.75 0 00.912.912l5.716-1.47A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22a9.944 9.944 0 01-5.192-1.455l-.372-.223-3.892 1.001 1.003-3.892-.222-.373A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </div>

        <div className="min-w-0 flex-1 text-start">
          <p className="text-sm font-bold leading-snug text-white sm:text-base lg:text-xs lg:leading-tight">
            קבוצת ווטסאפ להורים
          </p>
          <p className="mt-0.5 text-xs leading-snug text-green-50 opacity-90 lg:mt-0.5 lg:text-[10px] lg:leading-tight">
            קבוצה פתוחה לכולם · כניסה חופשית
          </p>
        </div>

        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 group-hover:-translate-x-1 lg:size-6">
          <ChevronLeft className="size-4 lg:size-3" strokeWidth={2.5} />
        </div>
      </a>
    </div>
  );
}
