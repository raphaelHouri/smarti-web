"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavSubItem = { label: string; href: string };

export type NavItem = {
  label: string;
  href: string;
  subItems?: NavSubItem[];
};

export function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  if (!item.subItems?.length) {
    return (
      <Link
        href={item.href}
        className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <div className="flex items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80">
        <Link
          href={item.href}
          className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors px-2 py-2 rounded-r-lg whitespace-nowrap"
        >
          {item.label}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={`nav-${item.href.replace(/\W/g, "")}`}
          aria-label={`פתח תפריט ${item.label}`}
          className="p-2 rounded-l-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[36px] flex items-center justify-center"
        >
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-neutral-400 transition-transform duration-200",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      </div>

      {open && (
        <div
          id={`nav-${item.href.replace(/\W/g, "")}`}
          role="menu"
          className={cn(
            "absolute top-full right-0 mt-2 z-[110]",
            "min-w-[212px] max-w-[calc(100vw-2rem)]",
            "max-h-[min(22rem,calc(100vh-6rem))] overflow-y-auto overscroll-contain",
            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1.5"
          )}
          dir="rtl"
        >
          {item.subItems.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center px-4 py-2.5 text-sm text-neutral-600 dark:text-slate-400",
                "hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-green-600 dark:hover:text-green-400",
                "transition-colors break-words"
              )}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
