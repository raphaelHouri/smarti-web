"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnEntryButton } from "./LearnEntryButton";
import type { NavItem } from "../_data/types";

export type { NavItem, NavSubItem } from "../_data/types";

export function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Click-outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 80);
  }, [clearTimers]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, [clearTimers]);

  // ── Plain link (no submenu) ──────────────────────────────────────────────
  if (!item.subItems?.length) {
    if (item.href === "/learn") {
      return (
        <LearnEntryButton
          variant="ghost"
          className="normal-case text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap h-auto"
          trackSource="nav_desktop"
        >
          {item.label}
        </LearnEntryButton>
      );
    }
    return (
      <Link
        href={item.href}
        className="text-sm font-medium text-neutral-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
      >
        {item.label}
      </Link>
    );
  }

  // ── Item with submenu ────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      className="relative shrink-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger — unified pill with label + chevron */}
      <div
        className={cn(
          "flex items-center rounded-lg transition-colors duration-150",
          open
            ? "bg-emerald-50 dark:bg-emerald-950/40"
            : "hover:bg-slate-100 dark:hover:bg-slate-800/80"
        )}
      >
        {/* Label navigates to the parent page */}
        <Link
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "text-sm font-medium px-3 py-2 whitespace-nowrap transition-colors duration-150 rounded-r-lg",
            open
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-neutral-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
          )}
        >
          {item.label}
        </Link>

        {/* Chevron — toggles the dropdown */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={`nav-${item.href.replace(/\W/g, "")}`}
          aria-label={`${open ? "סגור" : "פתח"} תפריט ${item.label}`}
          className={cn(
            "pl-1.5 pr-2.5 py-2 rounded-l-lg flex items-center justify-center transition-colors duration-150",
            open
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-neutral-400 dark:text-slate-500 hover:text-emerald-500 dark:hover:text-emerald-400"
          )}
        >
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 transition-transform duration-200 ease-out",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>
      </div>

      {/* Dropdown panel — always in DOM, animated via opacity + translate */}
      <div
        id={`nav-${item.href.replace(/\W/g, "")}`}
        role="menu"
        aria-hidden={!open}
        className={cn(
          // positioning
          "absolute top-[calc(100%+6px)] right-0 z-[110]",
          "min-w-[210px] max-w-[calc(100vw-2rem)]",
          // surface
          "bg-white dark:bg-slate-900",
          "border border-slate-200/80 dark:border-slate-700/80",
          "rounded-xl shadow-xl shadow-slate-900/10 dark:shadow-slate-950/50",
          "overflow-hidden",
          // animation
          "transition-all duration-200 ease-out origin-top",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto visible"
            : "opacity-0 -translate-y-2 pointer-events-none invisible"
        )}
        dir="rtl"
      >
        {/* Emerald accent bar */}
        <div
          className="h-[3px] w-full bg-gradient-to-l from-emerald-400 to-green-500"
          aria-hidden
        />

        <div className="py-1.5">
          {item.subItems.map((sub) => (
            <Link
              key={sub.href}
              href={sub.href}
              role="menuitem"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 px-4 py-2.5 text-sm",
                "text-neutral-600 dark:text-slate-400",
                "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                "hover:text-emerald-700 dark:hover:text-emerald-300",
                "transition-colors duration-100"
              )}
            >
              {/* Small bullet indicator */}
              <span
                className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-emerald-400 dark:group-hover:bg-emerald-500 transition-colors duration-100 shrink-0"
                aria-hidden
              />
              {sub.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
