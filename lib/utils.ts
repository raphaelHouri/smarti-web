import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import React from "react"
import { plans } from "@/db/schemaSmarti";
import { getCoupon } from "@/db/queries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL!}${path}`;
}


// 1) Tiny 32-bit hash (FNV-1a) → deterministic seed from any string
export function fnv1a(str: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  // keep as unsigned 32-bit
  return h >>> 0;
}

// 2) Small seeded RNG (xorshift32)
function makeRng(seed: number) {
  let x = seed || 123456789;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296; // [0,1)
  };
}

// 3) Seeded Fisher–Yates
export function seededShuffle<T>(arr: T[], seed: number) {
  const a = arr.slice();
  const rand = makeRng(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Render text while forcing $...$ delimited segments (formulas) to LTR.
// Example: "שלום $x+y=2$ איך" -> Hebrew RTL text with LTR formula segment
export function renderTextWithLTRFormulas(text: string): React.ReactNode[] {
  const parts = String(text ?? "").split(/\$/);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return React.createElement(
        'span',
        { key: `f-${index}`, dir: 'ltr', className: 'inline-block whitespace-nowrap ' },
        part
      );
    }
    return React.createElement(React.Fragment, { key: `t-${index}` }, part);
  });
}

export async function calculateAmount(
  plan: typeof plans.$inferSelect,
  couponId: string | null,
  bookIncluded: boolean
) {
  let price = plan.price;
  if (bookIncluded) {
    price += (plan.displayData as { bookPrice?: number } | null)?.bookPrice ?? 0;
  }

  if (couponId) {
    const coupon = await getCoupon({ id: couponId });
    if (coupon) {
      switch (coupon.type) {
        case "percentage":
          price -= Math.round((price * coupon.value) / 100);
          break;
        case "fixed":
          price = coupon.value;
          break;
        default:
          break;
      }
    }
  }

  return Math.max(price, 0);
}

/**
 * Get the year from product displayData with a default fallback
 * @param displayData - The displayData object from the product
 * @returns The year as a string, defaults to current year
 */
export function getProductYear(): string {
  const now = new Date();
  let yearString: string;
  if (now.getMonth() >= 0 && now.getMonth() < 5) {
    yearString = `${now.getFullYear() - 1} - ${now.getFullYear()}`;
  } else {
    yearString = `${now.getFullYear()} - ${now.getFullYear() + 1}`;
  }
  return yearString;
}

export function getSystemStepLabel(step: number | null): string {
  if (step === 2) {
    return "כיתה ב' - שלב ב'";
  }
  if (step === 3) {
    return "כיתה ב' - שלב ג'";
  }
  return "כיתה ב' - שלב א'";
}
