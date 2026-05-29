"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon, X, ChevronDown } from "lucide-react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { LearnEntryButton } from "./LearnEntryButton";
import type { NavItem } from "./NavDropdown";
import { AuthButtons } from "@/components/auth-buttons";
import { ModeToggle } from "@/components/mode-toggle";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { shouldShowAuthButtons } from "@/lib/restricted-users";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

/** מעל header (sticky z-50) — פריטי פורטל חייבים להיות גבוהים מהכול כדי למקם מול viewport */
const Z_BACKDROP = 250;
const Z_DRAWER = 251;

export function MobileMarketingNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { userId, isSignedIn } = useAuth();
  const { step: systemStep } = useSystemStep();

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setExpanded(null);
  }, []);

  /** Close drawer when step-picker dialog closes; do not close drawer on open (would unmount this button). */
  const onLearnEntryDialogOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) closeDrawer();
    },
    [closeDrawer]
  );

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

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";

  const themeMenuPrepend =
    mounted && shouldShowAuthButtons(userId) && !isSignedIn ? (
      <SignInButton mode="modal" forceRedirectUrl="/" signUpForceRedirectUrl="/">
        <DropdownMenuItem
          className="cursor-pointer"
          dir="rtl"
          onSelect={(e) => e.preventDefault()}
          onClick={() => {
            trackEvent("sign_in_started", {
              systemStep,
              source: currentPath,
              location: "mobile_nav_theme_menu",
              redirectUrl: "/learn",
            });
          }}
        >
          התחברות
        </DropdownMenuItem>
      </SignInButton>
    ) : null;

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
          {/* כותרת המגירה: לוגו · סגירה */}
          <div className="flex items-center justify-between gap-3 shrink-0 border-b border-slate-100 dark:border-slate-800 px-3 sm:px-4 py-3.5 min-h-[52px]">
            <Link
              href="/"
              onClick={closeDrawer}
              className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
            >
              <Image
                src="/smartiLogo.webp"
                alt="סמארטי — הכנה למבחני מחוננים"
                width={100}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
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
                className="border-b border-slate-100 dark:border-slate-800/80 last:border-b-0"
              >
                {item.subItems?.length ? (
                  <>
                    {/* Row: label link + chevron toggle */}
                    <div
                      className={cn(
                        "flex items-stretch transition-colors duration-150",
                        expanded === item.label
                          ? "bg-emerald-50 dark:bg-emerald-950/30"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={closeDrawer}
                        className={cn(
                          "flex-1 px-4 py-3.5 text-sm font-medium leading-snug",
                          "min-h-[48px] flex items-center transition-colors duration-150",
                          expanded === item.label
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-neutral-700 dark:text-slate-300"
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
                          "shrink-0 px-4 flex items-center justify-center min-w-[52px]",
                          "border-s border-slate-100 dark:border-slate-800 transition-colors duration-150",
                          expanded === item.label
                            ? "text-emerald-600 dark:text-emerald-400 border-s-emerald-200 dark:border-s-emerald-800/50"
                            : "text-neutral-400 dark:text-slate-500"
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200 ease-out",
                            expanded === item.label && "rotate-180"
                          )}
                          aria-hidden
                        />
                      </button>
                    </div>

                    {/* Submenu — animated height via grid trick */}
                    <div
                      id={submenuId(item.label)}
                      role="region"
                      className={cn(
                        "grid transition-all duration-200 ease-out",
                        expanded === item.label ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        {/* Accent bar */}
                        <div
                          className={cn(
                            "h-[2px] w-full bg-gradient-to-l from-emerald-400 to-green-500 transition-opacity duration-200",
                            expanded === item.label ? "opacity-100" : "opacity-0"
                          )}
                          aria-hidden
                        />
                        <div className="bg-slate-50/80 dark:bg-slate-900/60 py-1">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={closeDrawer}
                              className={cn(
                                "group flex items-center gap-2.5 px-6 py-2.5 text-sm",
                                "min-h-[44px] leading-snug transition-colors duration-100",
                                "text-neutral-600 dark:text-slate-400",
                                "hover:text-emerald-700 dark:hover:text-emerald-300",
                                "hover:bg-white/80 dark:hover:bg-slate-800/60"
                              )}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-400 transition-colors shrink-0"
                                aria-hidden
                              />
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : item.href === "/learn" ? (
                  <LearnEntryButton
                    variant="ghost"
                    className={cn(
                      "normal-case block px-4 py-3.5 text-sm font-medium text-neutral-700 dark:text-slate-300 w-full rounded-none h-auto text-right",
                      "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors min-h-[48px] justify-start"
                    )}
                    trackSource="nav_mobile"
                    onDialogOpenChange={onLearnEntryDialogOpenChange}
                  >
                    {item.learnCtaLabel ?? item.label}
                  </LearnEntryButton>
                ) : (
                  <Link
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "block px-4 py-3.5 text-sm font-medium text-neutral-700 dark:text-slate-300",
                      "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400",
                      "transition-colors min-h-[48px] flex items-center"
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Footer — auth + כניסה ללומדה + theme */}
          <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex flex-col items-center gap-3">
            <div className="w-full flex justify-center [&_div.mt-2]:mt-0 [&_div.mt-1]:mt-0">
              <AuthButtons />
            </div>
            <LearnEntryButton
              variant="secondaryOutline"
              size="sm"
              className="w-full max-w-[16rem] normal-case rounded-lg border-2 border-emerald-600 dark:border-emerald-500 bg-white/80 dark:bg-transparent text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
              trackSource="nav_mobile_footer"
              onDialogOpenChange={onLearnEntryDialogOpenChange}
            >
              כניסה ללומדה
            </LearnEntryButton>
            <ModeToggle prepend={themeMenuPrepend} />
          </div>
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
