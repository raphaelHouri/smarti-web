"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import {
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Package,
  Rocket,
  Star,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import BookPurchaseModal from "@/components/modals/useBookPurchaseModal";
import type { ShopPlanRecord, ShopPlansByType } from "@/db/queries";
import { getUserCoupon } from "@/actions/user-coupon";
import { useBookPurchaseModal } from "@/store/use-book-purchase-modal";
import { trackEvent } from "@/lib/posthog";
import { shouldShowAuthButtons } from "@/lib/restricted-users";
import {
  applyCouponToPrice,
  cn,
  parsePrice,
  type SimpleCoupon,
} from "@/lib/utils";
import { useSystemStep } from "@/hooks/use-system-step";

const DEFAULT_SYSTEM_FEATURES = [
  "גישה מלאה לתכני הלומדה",
  "מבחנים וסימולציות מדומים למבחן",
  "מעקב אחר התקדמות הילד/ה",
  "תמיכה והנחיות שימוש",
];

const DEFAULT_BOOK_FEATURES = [
  "חוברת הכנה להדפסה (PDF) באיכות גבוהה",
  "תרגול ממוקד לפי נושאי המבחן",
  "מתאים להדפסה בבית או בדפוס",
  "משלוח עותק דיגיטלי למייל לאחר הרכישה",
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  Rocket,
  BookOpen,
  Video,
  Check,
  Star,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(amount);
}

type PlanView = {
  id: string;
  name: string;
  priceNum: number;
  priceFormatted: string;
  period?: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  addBookOption?: {
    price: string;
    originalPrice: string;
    savings: string;
    productId: string;
    priceNum: number;
    originalNum: number;
  };
  productId?: string;
};

function adaptSystemPlans(records: ShopPlanRecord[]): PlanView[] {
  return records.map((r) => {
    const dd = (r.displayData ?? {}) as Record<string, unknown>;
    const iconName = (dd.icon as string) ?? "Rocket";
    const Icon = iconMap[iconName] ?? Rocket;
    const rawFeatures = dd.features;
    const features = Array.isArray(rawFeatures)
      ? (rawFeatures as string[]).filter(Boolean)
      : [];
    const period =
      r.days >= 180
        ? "6 חודשים"
        : r.days >= 30
          ? "חודש"
          : r.days >= 7
            ? "שבוע"
            : undefined;

    const addOpt = dd.addBookOption as
      | {
          price?: string | number;
          originalPrice?: string | number;
          savings?: string | number;
          productId?: string;
        }
      | undefined;

    const addBookOption = addOpt
      ? {
          price: String(addOpt.price ?? ""),
          originalPrice: String(addOpt.originalPrice ?? ""),
          savings: String(addOpt.savings ?? ""),
          productId: String(addOpt.productId ?? ""),
          priceNum: parsePrice(String(addOpt.price ?? "0")),
          originalNum: parsePrice(String(addOpt.originalPrice ?? "0")),
        }
      : undefined;

    return {
      id: r.id,
      name: r.name,
      priceNum: r.price,
      priceFormatted: formatCurrency(r.price),
      period,
      description: r.description ?? "",
      features: features.length ? features : DEFAULT_SYSTEM_FEATURES,
      icon: Icon,
      addBookOption,
      productId:
        Array.isArray((r as { productsIds?: string[] }).productsIds) &&
        (r as { productsIds: string[] }).productsIds.length > 0
          ? (r as { productsIds: string[] }).productsIds[0]
          : undefined,
    };
  });
}

function bookFeaturesFromRecord(book: ShopPlanRecord | undefined): string[] {
  if (!book) return DEFAULT_BOOK_FEATURES;
  const dd = (book.displayData ?? {}) as { features?: unknown };
  if (Array.isArray(dd.features)) {
    const f = (dd.features as string[]).filter(Boolean);
    if (f.length) return f;
  }
  return DEFAULT_BOOK_FEATURES;
}

export default function MobilePricingClient({
  plansByType,
  userInfo = { name: null, email: null },
}: {
  plansByType: ShopPlansByType;
  userInfo?: { name: string | null; email: string | null };
}) {
  const { userId } = useAuth();
  const canShowAuthButtons = shouldShowAuthButtons(userId);
  const bookPurchaseModal = useBookPurchaseModal();
  const { step: systemStep } = useSystemStep();

  const systemPlans = useMemo(
    () => adaptSystemPlans(plansByType.system ?? []),
    [plansByType.system],
  );

  const bookFallback = plansByType.book?.[0];

  const popularIndex = useMemo(() => {
    if (systemPlans.length >= 3) return 2;
    if (systemPlans.length === 0) return 0;
    return systemPlans.length - 1;
  }, [systemPlans.length]);

  const plansWithPopular = useMemo(
    () =>
      systemPlans.map((p, i) => ({
        ...p,
        isPopular: i === popularIndex,
      })),
    [systemPlans, popularIndex],
  );

  const defaultSelectedId =
    plansWithPopular[popularIndex]?.id ?? plansWithPopular[0]?.id ?? "";

  const [selectedPlanId, setSelectedPlanId] = useState(defaultSelectedId);
  const [isBookletAdded, setIsBookletAdded] = useState(true);
  const [isSystemDetailsOpen, setIsSystemDetailsOpen] = useState(false);
  const [isBookletDetailsOpen, setIsBookletDetailsOpen] = useState(false);
  const [savedCoupon, setSavedCoupon] = useState<{
    id: string;
    code: string;
    type: SimpleCoupon["type"];
    value: number;
    planId?: string | null;
  } | null>(null);

  useEffect(() => {
    if (
      defaultSelectedId &&
      !systemPlans.some((p) => p.id === selectedPlanId)
    ) {
      setSelectedPlanId(defaultSelectedId);
    }
  }, [defaultSelectedId, selectedPlanId, systemPlans]);

  const loadCoupon = useCallback(() => {
    if (!userId) {
      setSavedCoupon(null);
      return;
    }
    getUserCoupon()
      .then((result) => {
        setSavedCoupon(result.coupon ?? null);
      })
      .catch(() => setSavedCoupon(null));
  }, [userId]);

  useEffect(() => {
    loadCoupon();
  }, [loadCoupon]);

  useEffect(() => {
    const onCouponUpdated = () => loadCoupon();
    window.addEventListener("couponUpdated", onCouponUpdated);
    return () => window.removeEventListener("couponUpdated", onCouponUpdated);
  }, [loadCoupon]);

  const selectedPlan = useMemo(
    () => plansWithPopular.find((p) => p.id === selectedPlanId),
    [plansWithPopular, selectedPlanId],
  );

  const bookletPricing = useMemo(() => {
    if (!selectedPlan) return null;
    if (selectedPlan.addBookOption) {
      const savingsLabel =
        selectedPlan.addBookOption.savings?.trim() ||
        (selectedPlan.addBookOption.originalNum > selectedPlan.addBookOption.priceNum
          ? `חסוך ${formatCurrency(
              selectedPlan.addBookOption.originalNum -
                selectedPlan.addBookOption.priceNum,
            )}!`
          : "הנחה!");
      return {
        kind: "bundle" as const,
        displayPrice: selectedPlan.addBookOption.price,
        originalPrice: selectedPlan.addBookOption.originalPrice,
        savingsLabel,
        productId: selectedPlan.addBookOption.productId,
      };
    }
    if (bookFallback) {
      const p = bookFallback.price;
      return {
        kind: "book" as const,
        displayPrice: formatCurrency(p),
        originalPrice: formatCurrency(p),
        savingsLabel: null as string | null,
        productId:
          Array.isArray((bookFallback as { productsIds?: string[] }).productsIds) &&
          (bookFallback as { productsIds: string[] }).productsIds.length > 0
            ? (bookFallback as { productsIds: string[] }).productsIds[0]
            : undefined,
        bookPriceNum: p,
      };
    }
    return null;
  }, [selectedPlan, bookFallback]);

  const bookFeaturesList = useMemo(
    () => bookFeaturesFromRecord(bookFallback),
    [bookFallback],
  );

  const calculatePriceWithCoupon = useCallback(
    (basePrice: number, planId: string): number => {
      if (!savedCoupon) return basePrice;
      const couponForCalc: SimpleCoupon = {
        type: savedCoupon.type,
        value: savedCoupon.value,
        planId: savedCoupon.planId,
      };
      return applyCouponToPrice(basePrice, couponForCalc, planId);
    },
    [savedCoupon],
  );

  const baseTotalNum = useMemo(() => {
    if (!selectedPlan) return 0;
    if (!isBookletAdded || !bookletPricing) {
      return selectedPlan.priceNum;
    }
    if (bookletPricing.kind === "bundle") {
      const addon =
        selectedPlan.addBookOption?.priceNum ??
        parsePrice(String(bookletPricing.displayPrice ?? "0"));
      return selectedPlan.priceNum + addon;
    }
    return selectedPlan.priceNum + (bookletPricing.bookPriceNum ?? 0);
  }, [selectedPlan, isBookletAdded, bookletPricing]);

  const totalNum = useMemo(() => {
    if (!selectedPlan) return 0;
    return calculatePriceWithCoupon(baseTotalNum, selectedPlan.id);
  }, [baseTotalNum, calculatePriceWithCoupon, selectedPlan]);

  const totalFormatted = formatCurrency(totalNum);

  const canPurchaseWithBooklet =
    !!selectedPlan &&
    isBookletAdded &&
    !!bookletPricing &&
    (selectedPlan.addBookOption !== undefined ||
      bookletPricing.kind === "book");

  const handleCta = () => {
    if (!selectedPlan) return;

    const originalPrice = baseTotalNum;
    const discountedPrice = calculatePriceWithCoupon(
      originalPrice,
      selectedPlan.id,
    );
    const isFreePurchase = !!savedCoupon && discountedPrice === 0;

    trackEvent("plan_selected", {
      systemStep,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      source: "/temp/shop",
      price: originalPrice,
      discountedPrice,
      hasBookOption: !!bookletPricing,
      bookOptionSelected: isBookletAdded,
      couponCode: savedCoupon?.code,
      isFreePurchase,
    });

    if (!userId && canShowAuthButtons) return;

    if (!userId && !canShowAuthButtons) return;

    if (canPurchaseWithBooklet) {
      bookPurchaseModal.open({ planId: selectedPlan.id, userInfo });
      return;
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const userIdParam = userId ? `&UserId=${encodeURIComponent(userId)}` : "";
    const couponParam = savedCoupon
      ? `&CouponCode=${encodeURIComponent(savedCoupon.code)}`
      : "";
    const route = isFreePurchase ? "/api/pay2/free" : "/api/pay2";
    const url = `${base}${route}?PlanId=${encodeURIComponent(selectedPlan.id)}${couponParam}${userIdParam}`;
    window.open(url, "_self");
  };

  if (systemPlans.length === 0) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
      >
        <p className="text-neutral-700 mb-4">
         לא נמצאו מסלולים זמינים לשלב הנוכחי. נסו שוב מאוחר יותר או עברו לחנות
          המלאה.
        </p>
        <Link
          href="/shop/system"
          className="text-emerald-600 font-semibold underline"
        >
          מעבר לחנות
        </Link>
        <BookPurchaseModal />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50/50 text-neutral-900 p-2 lg:p-6">
      <div className="max-w-md lg:max-w-7xl mx-auto min-h-screen lg:min-h-0 bg-white rounded-[2.5rem] shadow-xl border border-slate-200 relative pb-32 lg:pb-12 lg:pt-12 lg:flex lg:flex-row lg:gap-8 lg:items-start lg:px-6 overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 animate-bounce" style={{ animation: 'float 6s ease-in-out infinite' }}>
                <Star className="w-full h-full text-emerald-300" />
            </div>
            <div className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animation: 'float 8s ease-in-out infinite' }}>
                <BookOpen className="w-full h-full text-slate-300" />
            </div>
        </div>

        <div className="flex-1 w-full relative z-10">
          <header className="px-4 pt-8 pb-6 lg:pt-0 lg:pb-8 text-center lg:text-right">
            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold text-neutral-900 leading-tight mb-3">
              מערכת למידה דינמית - בחרו את המסלול המתאים לכם
            </h1>
            <p className="text-sm lg:text-base text-neutral-600 max-w-3xl">
              כל התוכניות כוללות את ערכת הלמידה המקצועית שלנו, הכוללת עשרות ערכות חשיבה, מבחנים מקיפים, וסביבת תרגול המכינה את ילדכם ביסודיות לקראת מבחן שלב ב'. מותאם ללמידה כחוויה שילדים מחכים לה בכל יום.
            </p>
          </header>

          <div className="px-3 lg:px-0 flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 items-stretch">
          {plansWithPopular.map((plan) => {
            const Icon = plan.icon;
            const isActive = plan.id === selectedPlanId;
            return (
              <div key={plan.id} className="relative flex flex-col h-full">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setIsSystemDetailsOpen(false);
                  }}
                  className={cn(
                    "w-full text-right rounded-2xl p-4 lg:p-6 transition-all flex-1 flex flex-col relative",
                    isActive
                      ? "border-2 border-emerald-500 bg-emerald-50/20 shadow-md"
                      : "border border-slate-200 bg-white hover:border-slate-300 shadow-sm",
                  )}
                >
                  {plan.isPopular && (
                    <span className="absolute -top-3 lg:-top-3 right-4 lg:right-1/2 lg:translate-x-1/2 rounded-full bg-[#fbbf24] text-yellow-900 text-xs lg:text-sm font-bold px-3 py-1 shadow-sm whitespace-nowrap">
                      הכי פופולרי
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-center lg:text-center lg:w-full">
                    <div className="flex-1 min-w-0 lg:w-full lg:flex lg:flex-col lg:items-center lg:mt-4">
                      <div className="font-bold text-base lg:text-xl text-neutral-900">
                        {plan.name}
                      </div>
                      <div className="mt-2 text-lg lg:text-4xl font-extrabold text-neutral-900 tabular-nums">
                        {plan.priceFormatted}
                      </div>
                      {plan.isPopular && (
                        <div className="hidden lg:block text-xs font-bold text-neutral-600 mt-1">
                          (המשתלם ביותר פר יום!)
                        </div>
                      )}
                    </div>
                    {/* Choose plan button for desktop */}
                    <div className="hidden lg:flex w-full mt-4 justify-center">
                       <div className={cn(
                          "px-6 py-2 rounded-full border text-sm font-bold transition-colors w-3/4",
                          isActive
                            ? "border-transparent bg-emerald-100 text-emerald-700"
                            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                        )}>
                          בחר מסלול
                       </div>
                    </div>
                    {/* Icon for mobile */}
                    <div
                      className={cn(
                        "shrink-0 w-11 h-11 lg:hidden rounded-xl flex items-center justify-center",
                        isActive
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* Remove desktop always visible features from here (moved to summary) */}

                  {isActive && (
                    <div className="absolute top-3 right-3 lg:hidden text-emerald-600">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                  )}
                  {isActive && (
                    <div className="hidden lg:flex absolute top-4 left-4 text-emerald-600 bg-white rounded-full p-0.5 shadow-sm">
                      <Check className="w-5 h-5" strokeWidth={3} />
                    </div>
                  )}
                </button>

                {/* Mobile Accordion */}
                {isActive && (
                  <div className="mt-2 border border-slate-100 rounded-xl overflow-hidden bg-white lg:hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-emerald-700 bg-slate-50/80"
                      onClick={() =>
                        setIsSystemDetailsOpen((v) => !v)
                      }
                    >
                      <span>צפה בפרטי המערכת</span>
                      <ChevronDown
                        className={cn(
                          "w-5 h-5 transition-transform",
                          isSystemDetailsOpen && "rotate-180",
                        )}
                      />
                    </button>
                    {isSystemDetailsOpen && (
                      <ul className="grid grid-cols-2 gap-2 px-3 pb-3 pt-1 text-xs text-neutral-700">
                        {plan.features.slice(0, 6).map((f) => (
                          <li
                            key={f}
                            className="flex gap-1.5 items-start bg-slate-50 rounded-lg p-2"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {bookletPricing && selectedPlan && (
          <section className="mt-6 mx-3 lg:mx-0 rounded-2xl border border-emerald-100 overflow-hidden bg-emerald-50/20 shadow-sm">
            <div className="p-4 lg:p-6">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-red-500 shadow-sm relative">
                  <FileText className="w-6 h-6" />
                  <span className="text-[9px] font-bold absolute bottom-1">PDF</span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h2 className="text-base lg:text-lg font-bold text-neutral-900 leading-tight">
                    שדרוג לחבילת פרימיום - הוספת חוברת לימוד (אופציונלי)
                  </h2>
                  <p className="text-sm text-neutral-600 mt-1 mb-4">
                    העניקו לילדכם יתרון אמיתי עם ערכת ההכנה שלנו — חווית לימוד חכמה, מהנה ומותאמת לילדים.
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isBookletAdded}
                      onClick={() => setIsBookletAdded((v) => !v)}
                      className={cn(
                        "relative shrink-0 inline-flex h-7 w-12 items-center rounded-full transition-colors border-2",
                        isBookletAdded ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-200",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                          isBookletAdded ? "-translate-x-1" : "-translate-x-6",
                        )}
                      />
                    </button>
                    
                    <div className="flex items-baseline gap-2">
                      <span className="text-emerald-600 font-bold">מחיר מוזל: <span className="text-xl">{bookletPricing.displayPrice}</span></span>
                      {bookletPricing.kind === "bundle" &&
                        bookletPricing.originalPrice &&
                        bookletPricing.displayPrice !==
                          bookletPricing.originalPrice && (
                          <span className="text-sm text-slate-400 mr-2">
                            מחיר רגיל: <span className="line-through">{bookletPricing.originalPrice}</span>
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden bg-white mt-6 shadow-sm">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-neutral-700"
                  onClick={() => setIsBookletDetailsOpen((v) => !v)}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    צפה בפרטי החוברת
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isBookletDetailsOpen && "rotate-180",
                    )}
                  />
                </button>
                {isBookletDetailsOpen && (
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 px-4 pb-4 text-xs lg:text-sm text-neutral-600">
                    {bookFeaturesList.slice(0, 6).map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 items-start"
                      >
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        <p className="text-center text-xs text-slate-500 px-6 mt-8 lg:mb-8">
          <Link href="/shop/system" className="text-emerald-600 font-medium hover:underline">
            חנות מלאה
          </Link>
          {" · "}
          <Link href="/policy" className="text-emerald-600 font-medium hover:underline">
            מדיניות
          </Link>
        </p>
        </div> {/* End of Plans Left side (in RTL right side) */}

        {/* Desktop Order Summary Panel */}
        <aside className="hidden lg:flex flex-col w-[360px] shrink-0 sticky top-12 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
              <Rocket className="w-6 h-6" />
            </div>
            <h2 className="text-[1.35rem] font-extrabold text-neutral-900 leading-tight">
              סיכום המסלול שלך -
              <br />
              <span className="text-emerald-600 text-xl font-bold">עד המבחן</span>
            </h2>
          </div>
          
          
          <div className="mb-6 flex-1">
            <h3 className="font-bold text-neutral-900 text-base mb-2">המסלול כולל:</h3>
            <p className="text-sm text-neutral-500 mb-4">
              תרגולים ומבחנים לתרגול במחשב ובפלאפון לקראת מבחן שלב ב'
            </p>
            <ul className="flex flex-col gap-3 text-[13px] text-neutral-700">
              {selectedPlan?.features.slice(0, 6).map((f) => (
                <li key={f} className="flex gap-2.5 items-start">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={3} />
                  <span className="leading-tight">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="pt-5 border-t border-slate-100 mb-6 bg-slate-50/50 -mx-6 px-6 pb-2">
            <h4 className="font-bold text-neutral-900 mb-3 text-sm">סיכום לתשלום</h4>
            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between text-neutral-600">
                <span>{selectedPlan?.name || "מסלול"}:</span>
                <span className="font-medium tabular-nums text-neutral-900">{selectedPlan?.priceFormatted}</span>
              </div>
              
              {isBookletAdded && bookletPricing && (
                <div className="flex justify-between text-neutral-600">
                  <span>חוברת (אופציונלי):</span>
                  <span className="font-medium tabular-nums text-neutral-900">{bookletPricing.displayPrice}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200/60 font-bold text-neutral-900">
              <span className="text-base">סך הכל (כולל):</span>
              <span className="text-xl tabular-nums">
                {totalFormatted}
              </span>
            </div>
          </div>

          {!userId && canShowAuthButtons ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/temp/shop"
              signUpForceRedirectUrl="/temp/shop"
            >
              <button
                type="button"
                onClick={() =>
                  trackEvent("sign_in_started", {
                    systemStep,
                    source: "/temp/shop",
                    location: "desktop_shop_summary",
                  })
                }
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 shadow-lg shadow-emerald-200/50 text-lg transition-transform hover:-translate-y-0.5"
              >
                התחל עכשיו
              </button>
            </SignInButton>
          ) : !userId && !canShowAuthButtons ? (
            <button
              type="button"
              disabled
              className="w-full rounded-2xl bg-slate-300 text-slate-500 font-bold px-6 py-4 cursor-not-allowed text-lg"
            >
              התחל עכשיו
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCta}
              className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-4 shadow-lg shadow-emerald-200/50 text-lg transition-transform hover:-translate-y-0.5"
            >
              התחל עכשיו
            </button>
          )}
        </aside>
      </div> {/* End of main wrapper */}

      <footer
        className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden justify-center border-t border-slate-200 bg-white/95 backdrop-blur-md"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="w-full max-w-md flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col items-start min-w-0">
            <span className="text-xs text-slate-500 font-medium">
              סכום סופי:
            </span>
            <span className="text-xl font-extrabold text-neutral-900 tabular-nums truncate">
              {totalFormatted}
            </span>
          </div>

          {!userId && canShowAuthButtons ? (
            <SignInButton
              mode="modal"
              forceRedirectUrl="/temp/shop"
              signUpForceRedirectUrl="/temp/shop"
            >
              <button
                type="button"
                onClick={() =>
                  trackEvent("sign_in_started", {
                    systemStep,
                    source: "/temp/shop",
                    location: "mobile_shop_footer",
                  })
                }
                className="shrink-0 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 shadow-lg shadow-emerald-200/50 text-sm sm:text-base"
              >
                התחל עכשיו
              </button>
            </SignInButton>
          ) : !userId && !canShowAuthButtons ? (
            <button
              type="button"
              disabled
              className="shrink-0 rounded-2xl bg-slate-300 text-slate-500 font-bold px-6 py-3 cursor-not-allowed text-sm"
            >
              התחל עכשיו
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCta}
              className="shrink-0 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 shadow-lg shadow-emerald-200/50 text-sm sm:text-base"
            >
              התחל עכשיו
            </button>
          )}
        </div>
      </footer>

      <BookPurchaseModal />
    </div>
  );
}
