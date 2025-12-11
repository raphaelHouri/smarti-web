"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
    Package, Rocket, BookOpen, Video, Check, Star,
    Shield, Users, Award, Clock, HelpCircle, ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import FeedbackButton from "@/components/feedbackButton";
import type { ShopPlanRecord, ShopPlansByType, PackageType } from "@/db/queries";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useBookPurchaseModal } from "@/store/use-book-purchase-modal";
import BookPurchaseModal from "@/components/modals/useBookPurchaseModal";
import { useCouponModal } from "@/store/use-coupon-modal";
import CouponModal from "@/components/modals/useCouponModal";
import { Tag } from "lucide-react";
import { getUserCoupon } from "@/actions/user-coupon";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

type Category = "system" | "books";

type Plan = {
    id: string;
    name: string;
    price: string; // formatted
    period?: string;
    description: string;
    features: string[];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
    badgeColor?: string;
    planType: string; // use id
    category: Category;
    productId?: string;
    addBookOption?: {
        price: string;
        originalPrice: string;
        savings: string;
        productId: string;
    };
};

// Derived categories from plansByType keys

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Package,
    Rocket,
    BookOpen,
    Video,
    Check,
    Star,
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

function adaptPlans(records: ShopPlanRecord[], pkgType: PackageType): Plan[] {
    return records.map((r) => {
        const dd = r.displayData ?? {};
        const iconName: string = dd.icon ?? (pkgType === "book" ? "BookOpen" : "Rocket");
        const Icon = iconMap[iconName] ?? Rocket;
        const color: string = dd.color ?? (pkgType === "book" ? "green" : "blue");
        const features: string[] = Array.isArray(dd.features) ? dd.features : [];
        const badge: string | undefined = dd.badge ?? undefined;
        const badgeColor: string | undefined = dd.badgeColor ?? undefined;
        const period = pkgType === "book" ? undefined : (r.days >= 180 ? "6 חודשים" : r.days >= 30 ? "חודש" : r.days >= 7 ? "שבוע" : undefined);

        const addBookOption = dd.addBookOption ? {
            price: String(dd.addBookOption.price ?? ""),
            originalPrice: String(dd.addBookOption.originalPrice ?? ""),
            savings: String(dd.addBookOption.savings ?? ""),
            productId: String(dd.addBookOption.productId ?? ""),
        } : undefined;

        return {
            id: r.id,
            name: r.name,
            price: formatCurrency(r.price),
            period,
            description: r.description ?? "",
            features,
            icon: Icon,
            color,
            badge,
            badgeColor,
            planType: r.id,
            category: pkgType === "book" ? "books" : "system",
            productId: Array.isArray((r as any).productsIds) && (r as any).productsIds.length > 0 ? (r as any).productsIds[0] : undefined,
            addBookOption,
        } as Plan;
    });
}

export default function PurchasePageShop({
    plansByType,
    packageType = "system",
    userInfo = { name: null, email: null }
}: {
    plansByType: ShopPlansByType;
    packageType?: PackageType;
    userInfo?: {
        name: string | null;
        email: string | null;
    };
}) {
    const { userId } = useAuth();
    const bookPurchaseModal = useBookPurchaseModal();
    const couponModal = useCouponModal();
    const router = useRouter();
    const params = useParams();
    const { step: systemStep } = useSystemStep();

    // Convert packageType to category
    const packageTypeToCategory = (pkgType: PackageType): Category => {
        return pkgType === "book" ? "books" : "system";
    };

    // Get packageType from route params
    const routePackageType = params?.packageType as string | undefined;
    const effectivePackageType: PackageType = (routePackageType === "book" || routePackageType === "system")
        ? routePackageType
        : packageType;
    const initialCategory = packageTypeToCategory(effectivePackageType);

    const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
    const [planBookOptions, setPlanBookOptions] = useState<Record<string, boolean>>({});
    const [savedCoupon, setSavedCoupon] = useState<{ id: string; code: string; type: "percentage" | "fixed"; value: number } | null>(null);

    // Sync with route params when they change
    useEffect(() => {
        const routePkgType = params?.packageType as string | undefined;
        if (routePkgType === "book" || routePkgType === "system") {
            const category = packageTypeToCategory(routePkgType);
            setSelectedCategory(category);
        }
    }, [params]);

    // Build categories from keys of plansByType
    const categories = useMemo(() => {
        const keys = Object.keys(plansByType) as PackageType[];
        return keys.map((k) => ({
            id: (k === "book" ? "books" : "system") as Category,
            name: k === "book" ? "חוברת הכנה" : "מערכת למידה",
            icon: k === "book" ? BookOpen : Rocket,
            color: k === "book" ? "green" : "blue",
        }));
    }, [plansByType]);

    const adaptedSystem = adaptPlans(plansByType.system, "system");
    const adaptedBook = adaptPlans(plansByType.book, "book");
    const adapted = [...adaptedSystem, ...adaptedBook];
    const filteredPlans = adapted.filter((p) => p.category === selectedCategory);

    // Load saved coupon function
    const loadCoupon = useCallback(() => {
        if (userId) {
            getUserCoupon()
                .then(result => {
                    if (result.coupon) {
                        setSavedCoupon(result.coupon);
                    } else {
                        setSavedCoupon(null);
                    }
                })
                .catch(err => {
                    console.error("Failed to load coupon:", err);
                    setSavedCoupon(null);
                });
        }
    }, [userId]);

    // Load coupon on mount and when userId changes
    useEffect(() => {
        loadCoupon();
    }, [loadCoupon]);

    // Track shop page view on mount
    useEffect(() => {
        trackEvent("shop_page_viewed", {
            systemStep,
            category: selectedCategory,
            packageType: effectivePackageType,
        });
    }, []); // Only on mount

    // Track category change
    useEffect(() => {
        if (selectedCategory) {
            trackEvent("shop_category_changed", {
                systemStep,
                category: selectedCategory,
                packageType: effectivePackageType,
            });
        }
    }, [selectedCategory, systemStep, effectivePackageType]);

    // Track coupon applied when coupon is loaded
    useEffect(() => {
        if (savedCoupon) {
            trackEvent("coupon_applied", {
                systemStep,
                couponCode: savedCoupon.code,
                couponType: savedCoupon.type,
                discountValue: savedCoupon.value,
            });
        }
    }, [savedCoupon, systemStep]);

    // Listen for coupon updates from CouponModal
    useEffect(() => {
        const handleCouponUpdate = () => {
            loadCoupon();
        };

        window.addEventListener('couponUpdated', handleCouponUpdate);
        return () => {
            window.removeEventListener('couponUpdated', handleCouponUpdate);
        };
    }, [loadCoupon]);

    // Initialize book options as true by default for plans that have addBookOption
    useEffect(() => {
        const initialOptions: Record<string, boolean> = {};
        filteredPlans.forEach(plan => {
            if (plan.addBookOption && !(plan.planType in planBookOptions)) {
                initialOptions[plan.planType] = true;
            }
        });
        if (Object.keys(initialOptions).length > 0) {
            setPlanBookOptions(prev => ({ ...prev, ...initialOptions }));
        }
    }, [selectedCategory]);

    const toggleBookOption = (planType: string) => {
        setPlanBookOptions(prev => ({
            ...prev,
            [planType]: !prev[planType]
        }));
    };

    // Calculate price with coupon discount
    const calculatePriceWithCoupon = (basePrice: number): number => {
        if (!savedCoupon) return basePrice;

        if (savedCoupon.type === "percentage") {
            return Math.max(0, basePrice - Math.round((basePrice * savedCoupon.value) / 100));
        } else {
            return Math.max(0, basePrice - savedCoupon.value);
        }
    };

    // Get base price number from formatted string
    const parsePrice = (priceStr: string): number => {
        return parseInt(priceStr.replace(/[^\d]/g, "")) || 0;
    };

    const getTotalPrice = (plan: Plan): string => {
        let basePrice: number;

        if (plan.category === "books") {
            basePrice = parsePrice(plan.price);
        } else if (plan.addBookOption && planBookOptions[plan.planType]) {
            basePrice = parsePrice(plan.addBookOption.price);
        } else {
            basePrice = parsePrice(plan.price);
        }

        const discountedPrice = calculatePriceWithCoupon(basePrice);
        return formatCurrency(discountedPrice);
    };

    const getOriginalPrice = (plan: Plan): number => {
        if (plan.category === "books") {
            return parsePrice(plan.price);
        } else if (plan.addBookOption && planBookOptions[plan.planType]) {
            return parsePrice(plan.addBookOption.price);
        } else {
            return parsePrice(plan.price);
        }
    };



    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCategoryChange = (category: Category) => {
        setSelectedCategory(category);
        const packageType: PackageType = category === "books" ? "book" : "system";
        trackEvent("shop_category_changed", {
            systemStep,
            category,
            packageType,
        });
        router.push(`/shop/${packageType}`, { scroll: false });
    };

    const handleRecommendation = () => {
        handleCategoryChange("system");
        setTimeout(() => {
            document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 via-60% to-blue-50 to-90% rounded-[2.5rem] shadow-xl mx-2 md:mx-0 border border-purple-100">
            <div className="flex flex-row items-start justify-between p-4">
                {/* Coupon Badge */}
                <button
                    onClick={() => couponModal.open()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm font-medium"
                >
                    <Tag className="w-4 h-4" />
                    יש קופון?
                </button>
                <FeedbackButton screenName="shop" />
            </div>
            {/* Hero Section */}
            <section className="relative overflow-hidden py-16 md:py-24 px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-10 animate-bounce" style={{ animation: 'float 6s ease-in-out infinite' }}>
                        <Star className="w-full h-full text-purple-400" />
                    </div>
                    <div className="absolute top-40 right-20 w-24 h-24 rounded-full opacity-10 animate-bounce" style={{ animationDelay: '1s', animation: 'float 8s ease-in-out infinite' }}>
                        <BookOpen className="w-full h-full text-blue-400" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* right side - Text content */}
                        <div className="text-center lg:text-left animate-fade-in-up">
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                    <span className="block w-full text-right bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 text-transparent bg-clip-text" >
                                        מגיעים הכי מוכנים למבחן המחוננים ומצטיינים!                                    </span>
                                </h1>
                                <p className="block w-full text-right text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                                    השקעה של מספר ימים יכולה להניב פירות שנים רבות קדימה, זו הנקודה שבה הילדים נמצאים היום.
                                </p>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <div className="flex items-center gap-3 bg-white/90 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">תוכנן על ידי מומחים</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/90 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                                    <Star className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">מדמה מבחן אמיתי</span>
                                </div>
                            </div>
                        </div>
                        {/* left side - Clean illustration area */}
                        <div className="relative h-64 md:h-80 animate-fade-in-right">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-900/30 rounded-2xl" />

                            {/* Simple centered icon */}
                            <div className="absolute inset-0 flex items-center justify-center animate-bounce" style={{ animation: 'float 3s ease-in-out infinite' }}>
                                <div className="text-purple-600 dark:text-purple-400">
                                    <Rocket className="w-32 h-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200",
                                        isActive && "bg-purple-600 text-white shadow-md",
                                        !isActive && "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                    )}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlans.map((plan, idx) => {
                            const Icon = plan.icon;
                            const colorMap: Record<string, string> = {
                                purple: "from-purple-500 to-purple-600",
                                blue: "from-blue-500 to-blue-600",
                                green: "from-green-500 to-green-600",
                                red: "from-red-500 to-red-600",
                            };

                            return (
                                <div
                                    key={idx}
                                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 p-6 border border-gray-200 dark:border-gray-700 transform hover:-translate-y-2 flex flex-col h-full"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {plan.badge && (
                                        <div className={cn(
                                            "absolute -top-2 -right-2 px-3 py-1 rounded-full text-sm font-bold shadow-md",
                                            plan.badgeColor === "yellow" && "bg-yellow-400 text-yellow-900",
                                            plan.badgeColor === "green" && "bg-green-500 text-white"
                                        )}>
                                            {plan.badge}
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className={cn(
                                        "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
                                        `bg-gradient-to-br ${colorMap[plan.color]}`
                                    )}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                                        {savedCoupon && (() => {
                                            const originalPrice = getOriginalPrice(plan);
                                            const discountedPrice = calculatePriceWithCoupon(originalPrice);
                                            const hasDiscount = discountedPrice < originalPrice;

                                            return (
                                                <div className="flex flex-col gap-1">
                                                    {hasDiscount && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl text-gray-500 line-through">
                                                                {formatCurrency(originalPrice)}
                                                            </span>
                                                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold rounded">
                                                                {savedCoupon.type === "percentage"
                                                                    ? `${savedCoupon.value}% הנחה`
                                                                    : `₪${savedCoupon.value} הנחה`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                            {getTotalPrice(plan)}
                                                        </span>
                                                        {plan.period && (
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                /{plan.period}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {!savedCoupon && (
                                            <>
                                                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                                    {plan.price}
                                                </span>
                                                {plan.period && (
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        /{plan.period}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {plan.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6 flex-grow">
                                        {plan.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* System Details Link for system plans */}
                                    {plan.category === "system" && (
                                        <div className="mb-4 -mt-2">
                                            <Link
                                                href={plan.productId ? `/products/system/${plan.productId}` : "/products/system"}
                                                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 dark:hover:from-purple-900/30 dark:hover:to-blue-900/30 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 font-semibold text-sm rounded-lg border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                <Rocket className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                צפה בפרטי המערכת
                                            </Link>
                                        </div>
                                    )}

                                    {/* Book Details Link for book plans */}
                                    {plan.category === "books" && (
                                        <div className="mb-4 -mt-2">
                                            <Link
                                                href={plan.productId ? `/products/book/${plan.productId}` : "/products/book"}
                                                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-semibold text-sm rounded-lg border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                צפה בפרטי החוברת
                                            </Link>
                                        </div>
                                    )}

                                    {/* Add Book Option */}
                                    {plan.addBookOption && (
                                        <div className="mb-6">
                                            {/* Toggle Switch */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        הוסף חוברת לימוד
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => toggleBookOption(plan.planType)}
                                                    className={cn(
                                                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",
                                                        (planBookOptions[plan.planType] ?? true) ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                                                            (planBookOptions[plan.planType] ?? true) ? "-translate-x-1" : "-translate-x-6"
                                                        )}
                                                    />
                                                </button>
                                            </div>

                                            {/* Book Option Details */}
                                            {(planBookOptions[plan.planType] ?? true) && (
                                                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full font-bold">
                                                            {plan.addBookOption.savings}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {plan.addBookOption.price}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through">
                                                            {plan.addBookOption.originalPrice}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                                        כולל חוברת דיגיטלית + מודפסת
                                                    </p>
                                                    <Link
                                                        href={plan.productId ? `/products/book/${plan.productId}` : "/products/book"}
                                                        className="group inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 font-semibold text-xs rounded-lg border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200 shadow-sm hover:shadow-md"
                                                    >
                                                        <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                                        צפה בפרטי החוברת
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Total Price Display */}
                                    {plan.addBookOption && (planBookOptions[plan.planType] ?? true) && (
                                        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">סה"כ:</span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {getTotalPrice(plan)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Button */}
                                    {!userId ? (
                                        <SignInButton
                                            mode="modal"
                                            forceRedirectUrl={`/shop/${effectivePackageType}`}
                                            signUpForceRedirectUrl={`/shop/${effectivePackageType}`}
                                        >
                                            <button
                                                className={cn(
                                                    "w-full py-3 rounded-lg font-medium transition-all duration-200 mt-auto",
                                                    plan.badge === "Most Popular"
                                                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md"
                                                        : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                                                )}
                                            >
                                                התחל עכשיו
                                            </button>
                                        </SignInButton>
                                    ) : (
                                        (() => {

                                            const onClick = () => {
                                                // Track plan selection
                                                const originalPrice = getOriginalPrice(plan);
                                                const discountedPrice = calculatePriceWithCoupon(originalPrice);

                                                trackEvent("plan_selected", {
                                                    systemStep,
                                                    planId: plan.id,
                                                    planName: plan.name,
                                                    planType: plan.planType,
                                                    category: plan.category,
                                                    price: originalPrice,
                                                    discountedPrice,
                                                    hasBookOption: !!plan.addBookOption,
                                                    bookOptionSelected: plan.addBookOption ? (planBookOptions[plan.planType] ?? true) : false,
                                                    couponCode: savedCoupon?.code,
                                                    couponType: savedCoupon?.type,
                                                    discountValue: savedCoupon?.value,
                                                });

                                                if (plan.category === "books") {
                                                    bookPurchaseModal.open({ planId: plan.planType, userInfo });
                                                } else if (plan.addBookOption && planBookOptions[plan.planType]) {
                                                    bookPurchaseModal.open({ planId: plan.planType, userInfo });
                                                } else {
                                                    const base = process.env.NEXT_PUBLIC_APP_URL ?? "";
                                                    const userIdParam = userId ? `&UserId=${encodeURIComponent(userId)}` : "";
                                                    const couponParam = savedCoupon ? `&CouponCode=${encodeURIComponent(savedCoupon.code)}` : "";
                                                    const url = `${base}/api/pay?PlanId=${encodeURIComponent(plan.id)}${couponParam}${userIdParam}`;
                                                    window.open(url, "_self");
                                                }
                                            };
                                            return (
                                                <button
                                                    onClick={onClick}
                                                    className={cn(
                                                        "w-full py-3 rounded-lg font-medium transition-all duration-200 mt-auto",
                                                        plan.badge === "Most Popular"
                                                            ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md"
                                                            : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                                                    )}
                                                >
                                                    התחל עכשיו
                                                </button>
                                            );
                                        })()
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            {/* <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            נבחר על ידי אלפי משפחות
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            הצטרפו לקהילת הלומדים המצליחים
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, text: "100% מאובטח", subtext: "תשלומים בטוחים", color: "green" },
                            { icon: Users, text: "10,000+ משפחות", subtext: "סומכים על התוכנית שלנו", color: "blue" },
                            { icon: Award, text: "נוצר על ידי מומחים", subtext: "איכות מובטחת", color: "purple" },
                            { icon: Clock, text: "גישה מיידית", subtext: "התחל מיד", color: "orange" },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                            >
                                <div className={cn(
                                    "w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center",
                                    item.color === "green" && "bg-green-100 dark:bg-green-900/30",
                                    item.color === "blue" && "bg-blue-100 dark:bg-blue-900/30",
                                    item.color === "purple" && "bg-purple-100 dark:bg-purple-900/30",
                                    item.color === "orange" && "bg-orange-100 dark:bg-orange-900/30"
                                )}>
                                    <item.icon className={cn(
                                        "w-6 h-6",
                                        item.color === "green" && "text-green-600",
                                        item.color === "blue" && "text-blue-600",
                                        item.color === "purple" && "text-purple-600",
                                        item.color === "orange" && "text-orange-600"
                                    )} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                    {item.text}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.subtext}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Recommendation Box */}
            {/* <section className="py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800/50 dark:to-blue-900/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="w-12 h-12 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            לא בטוחים איזו תוכנית לבחור?
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            אנו ממליצים להתחיל עם <strong className="text-blue-600">תוכנית ההכנה החודשית הסטנדרטית</strong> – זו האפשרות הפופולרית ביותר שלנו עם כל מה שהילד שלכם צריך!
                        </p>

                        <button
                            onClick={handleRecommendation}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md"
                        >
                            צפה בתוכנית המומלצת
                        </button>
                    </div>
                </div>
            </section> */}

            {/* Help Section */}
            <section className="py-12 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        יש שאלות? אנחנו כאן לעזור!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        צוות התמיכה שלנו מוכן לסייע לכם בבחירת התוכנית הטובה ביותר עבור הילד שלכם
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                        ווצאפ: <a href={`https://wa.me/972586519423`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">058-651-9423</a>
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href={`https://wa.me/972586519423?text=${encodeURIComponent("שלום, אשמח לקבל עזרה במערכת סמארטי בנושא השירותים ומוצרים...")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md inline-flex items-center justify-center"
                        >
                            צור קשר בווצאפ
                        </a>
                        <button
                            onClick={scrollToTop}
                            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2"
                        >
                            <ArrowUp className="w-4 h-4" />
                            חזרה למעלה
                        </button>
                    </div>
                </div>
            </section>
            {/* Mount Book Purchase Modal */}
            <BookPurchaseModal />
            {/* Mount Coupon Modal */}
            <CouponModal />
        </div>
    );
}
