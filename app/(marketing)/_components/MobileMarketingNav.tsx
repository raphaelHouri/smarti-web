"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MenuIcon, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem } from "./NavDropdown";

/** מעל header (sticky z-50) — פריטי פורטל חייבים להיות גבוהים מהכול כדי למקם מול viewport */
const Z_BACKDROP = 250;
const Z_DRAWER = 251;

export function MobileMarketingNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setExpanded(null);
  }, []);

  const toggle = (label: string) =>
    setExpanded((p) => (p === label ? null : label));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onEscape);

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open, closeDrawer]);

  const submenuId = useCallback((label: string) => `submenu-${label.replace(/\s+/g, "-")}`, []);

  /** פורטל ל־body — מונע מה־sticky header עם backdrop-blur ליצור containing block על fixed ולשבור מגירת מסך מלא */
  const drawerPortal =
    mounted &&
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 border-0 p-0 m-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
          style={{ zIndex: Z_BACKDROP }}
          aria-label="סגור תפריט"
          onClick={closeDrawer}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="ניווט ראשי"
          dir="rtl"
          className={cn(
            "fixed inset-y-0 right-0 left-auto flex flex-col overscroll-none outline-none shadow-2xl",
            "w-[min(22rem,calc(100dvw-1.25rem))] max-w-full",
            "bg-white dark:bg-slate-950",
            "pt-[env(safe-area-inset-top)] pb-[calc(0.5rem+env(safe-area-inset-bottom))]",
            "pr-[max(0.75rem,env(safe-area-inset-right))]"
          )}
          style={{ zIndex: Z_DRAWER }}
        >
          {/* dir=rtl על ה-aside: פריט ראשון ב-flex יושב מימין — הכותרת מלאה, X משמאל */}
          <div className="flex items-center gap-3 shrink-0 border-b border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-3.5 min-h-[52px]">
            <h2 className="flex-1 min-w-0 text-right text-lg font-bold text-neutral-700 dark:text-slate-200 leading-snug">
              תפריט
            </h2>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="סגור תפריט"
              className="shrink-0 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5 text-neutral-500" aria-hidden />
            </button>
          </div>

          <nav className="flex flex-col flex-1 min-h-0 overflow-y-auto" aria-label="קישורים">
            {items.map((item) => (
              <div
                key={`${item.href}-${item.label}`}
                className="border-b border-slate-50 dark:border-slate-800/80 last:border-b-0"
              >
                {item.subItems?.length ? (
                  <>
                    <div className="flex items-stretch">
                      <Link
                        href={item.href}
                        onClick={closeDrawer}
                        className={cn(
                          "flex-1 px-4 py-3.5 text-sm font-medium text-neutral-700 dark:text-slate-300",
                          "hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 transition-colors min-h-[48px] flex items-center leading-snug"
                        )}
                      >
                        {item.label}
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggle(item.label)}
                        aria-expanded={expanded === item.label}
                        aria-controls={submenuId(item.label)}
                        aria-label={
                          expanded === item.label
                            ? `סגור תת־תפריט ${item.label}`
                            : `פתח תת־תפריט ${item.label}`
                        }
                        className={cn(
                          "shrink-0 px-3 flex items-center justify-center min-w-[48px]",
                          "border-s border-slate-100 dark:border-slate-800",
                          "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-neutral-400 transition-transform duration-200",
                            expanded === item.label && "-rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                    </div>
                    {expanded === item.label && (
                      <div
                        id={submenuId(item.label)}
                        role="region"
                        className="bg-slate-50/95 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800"
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={closeDrawer}
                            className={cn(
                              "block px-6 py-3 text-sm text-neutral-600 dark:text-slate-400",
                              "hover:text-green-600 dark:hover:text-green-400 hover:bg-white/60 dark:hover:bg-slate-800/70",
                              "min-h-[44px] flex items-center leading-snug"
                            )}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "block px-4 py-3.5 text-sm font-medium text-neutral-700 dark:text-slate-300",
                      "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-green-600 transition-colors min-h-[48px] flex items-center"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </>,
      document.body
    );

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתח תפריט"
          aria-expanded={false}
          className="p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <MenuIcon className="w-5 h-5 text-neutral-600 dark:text-slate-300" aria-hidden />
        </button>
      )}
      {drawerPortal}
    </>
  );
}
