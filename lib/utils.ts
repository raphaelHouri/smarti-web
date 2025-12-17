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

/**
 * Parse a formatted price string (e.g., "₪120" or "120 ש״ח") and return the numeric value
 * @param priceStr - The formatted price string
 * @returns The numeric price value
 */
export function parsePrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^\d]/g, "")) || 0;
}

export type SimpleCoupon = {
  type: "percentage" | "fixed" | "free";
  value: number;
  planId?: string | null;
};

/**
 * Apply coupon logic to a base price for a specific plan.
 * This function is pure and shared between client and server to keep pricing logic in sync.
 */
export function applyCouponToPrice(
  basePrice: number,
  coupon: SimpleCoupon | null | undefined,
  planId: string
): number {
  if (!coupon) return basePrice;

  let price = basePrice;

  switch (coupon.type) {
    case "percentage":
      price -= Math.round((price * coupon.value) / 100);
      break;

    case "fixed":
      if (coupon.planId && coupon.planId === planId) {
        price = price - coupon.value;
      }
      // If coupon is for another plan, leave price as basePrice (no effect)
      break;

    case "free":
      if (coupon.planId && coupon.planId === planId) {
        price = 0;
      }
      // If coupon is for another plan, leave price as basePrice (no effect)
      break;

    default:
      break;
  }

  return Math.max(price, 0);
}

export async function calculateAmount(
  plan: typeof plans.$inferSelect,
  couponId: string | null,
  bookIncluded: boolean
) {
  let price = plan.price;
  if (bookIncluded) {
    const bookPriceStr = (plan.displayData as { addBookOption?: { price?: string; productId?: string } } | null)?.addBookOption?.price;
    if (bookPriceStr) {
      price += parsePrice(bookPriceStr);
    }
  }

  if (!couponId) {
    return Math.max(price, 0);
  }

  const coupon = await getCoupon({ id: couponId });
  if (!coupon) {
    return Math.max(price, 0);
  }

  return applyCouponToPrice(
    price,
    {
      type: coupon.type as SimpleCoupon["type"],
      value: coupon.value,
      planId: coupon.planId,
    },
    plan.id,
  );
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
    return "שלב ב'";
  }
  if (step === 3) {
    return "כיתה ב' - שלב ג'";
  }
  return "שלב א'";
}

/**
 * Get default system step based on current month
 * Step 2 for December-April (months 12, 1, 2, 3, 4)
 * Step 1 for other months
 * @returns Default system step (1 or 2)
 */
export function getDefaultSystemStep(): 1 | 2 {
  const currentMonth = new Date().getMonth() + 1;
  return (currentMonth >= 12 || currentMonth <= 4) ? 2 : 1;
}

/**
 * Get system step from cookie (client-side only)
 * @returns System step (1, 2, or 3), defaults to 1
 */
export function getSystemStepFromCookie(): number {
  if (typeof document === "undefined") return 1;
  const cookies = document.cookie.split("; ");
  const stepCookie = cookies.find((cookie) => cookie.startsWith("systemStep="));
  if (stepCookie) {
    const stepValue = stepCookie.split("=")[1];
    const stepNumber = Number(stepValue);
    if ([1, 2, 3].includes(stepNumber)) {
      return stepNumber;
    }
  }
  return 1;
}
