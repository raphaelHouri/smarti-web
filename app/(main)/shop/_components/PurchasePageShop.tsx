"use client";

import { useState, useEffect } from "react";
import {
    Package, Rocket, BookOpen, Video, Check, Star,
    Shield, Users, Award, Clock, HelpCircle, ArrowUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Category = "preparation" | "books";
type Period = "weekly" | "monthly" | "6months" | "onetime";

interface Plan {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badge?: string;
    badgeColor?: string;
    planType: string;
    category: Category;
    availablePeriods: Period[];
    addBookOption?: {
        price: string;
        originalPrice: string;
        savings: string;
    };
}

const categories = [
    { id: "preparation" as Category, name: "Preparation", icon: Rocket, color: "blue" },
    { id: "books" as Category, name: "Books", icon: BookOpen, color: "green" },
];

const periods = [
    { id: "weekly" as Period, name: "Weekly", description: "Short-term access" },
    { id: "monthly" as Period, name: "Monthly", description: "Most Popular", badge: "Popular" },
    { id: "6months" as Period, name: "6 Months", description: "Best Value", badge: "Best Value" },
    { id: "onetime" as Period, name: "One-Time", description: "Single purchase" },
];

const allPlans: Record<Category, Partial<Record<Period, Plan>>> = {
    preparation: {
        weekly: {
            name: "Trial Period",
            price: "$12",
            period: "week",
            description: "Test our preparation program",
            features: ["1 week access", "Basic lessons", "Progress tracking", "Community support"],
            icon: Rocket,
            color: "blue",
            planType: "prep_weekly",
            category: "preparation",
            availablePeriods: ["weekly"]
        },
        monthly: {
            name: "Standard Prep",
            price: "$40",
            period: "month",
            description: "Comprehensive monthly preparation program",
            features: ["Full month access", "All lessons unlocked", "Practice tests", "Analytics dashboard", "Email support"],
            icon: Rocket,
            color: "blue",
            planType: "prep_monthly",
            category: "preparation",
            availablePeriods: ["monthly"],
            addBookOption: {
                price: "$60",
                originalPrice: "$75",
                savings: "Save $15"
            }
        },
        "6months": {
            name: "Extended Prep",
            price: "$199",
            period: "6 months",
            description: "Long-term preparation with priority support",
            features: ["6 months full access", "All content unlocked", "Priority support", "Mock exams", "Progress reports", "Study schedule"],
            icon: Rocket,
            color: "blue",
            badge: "Save $41",
            badgeColor: "green",
            planType: "prep_6months",
            category: "preparation",
            availablePeriods: ["6months"],
            addBookOption: {
                price: "$215",
                originalPrice: "$234",
                savings: "Save $19"
            }
        },
    },
    books: {
        onetime: {
            name: "Study Books Collection",
            price: "$35",
            description: "Complete study materials in digital and physical format",
            features: ["Digital PDF (instant)", "Physical book (shipped)", "400+ practice questions", "Detailed solutions", "Study guides"],
            icon: BookOpen,
            color: "green",
            badge: "Save $5",
            badgeColor: "green",
            planType: "books_onetime",
            category: "books",
            availablePeriods: ["onetime"]
        },
    },
};

export default function PurchasePageShop() {
    const [selectedCategory, setSelectedCategory] = useState<Category>("preparation");
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planBookOptions, setPlanBookOptions] = useState<Record<string, boolean>>({});

    // Get all plans for the selected category (all time periods)
    const filteredPlans = Object.values(allPlans[selectedCategory]).filter(Boolean) as Plan[];

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
        console.log('Toggling book option for:', planType, 'Current state:', planBookOptions[planType]);
        setPlanBookOptions(prev => ({
            ...prev,
            [planType]: !prev[planType]
        }));
    };

    const getTotalPrice = (plan: Plan): string => {
        if (plan.category === "books") return plan.price;

        // For preparation plans with book option enabled
        if (plan.addBookOption && planBookOptions[plan.planType]) {
            return plan.addBookOption.price;
        }

        return plan.price;
    };

    const handlePlanSelect = (plan: Plan) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleRecommendation = () => {
        setSelectedCategory("preparation");
        setTimeout(() => {
            document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 via-60% to-blue-50 to-90% rounded-[2.5rem] shadow-xl mx-2 md:mx-0 border border-purple-100">
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
                        {/* Left side - Text content */}
                        <div className="text-center lg:text-left animate-fade-in-up">
                            <div className="mb-6">
                                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                    <span className="bg-gradient-to-r from-purple-600 via-blue-500 to-pink-500 text-transparent bg-clip-text">
                                        Choose How Your Child Learns Best!
                                    </span>
                                </h1>
                                <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                                    Flexible learning plans designed by experts to help your child excel in gifted exams
                                </p>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <div className="flex items-center gap-3 bg-white/90 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                                    <Award className="w-5 h-5 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-700">Expert Designed</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/90 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                                    <Star className="w-5 h-5 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">Proven Results</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Clean illustration area */}
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
                                    onClick={() => setSelectedCategory(cat.id)}
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
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className="text-gray-600 dark:text-gray-400">
                                                /{plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        {plan.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-6 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Add Book Option */}
                                    {plan.addBookOption && (
                                        <div className="mb-6">
                                            {/* Toggle Switch */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                        Add Study Book
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
                                                            (planBookOptions[plan.planType] ?? true) ? "translate-x-6" : "translate-x-1"
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
                                                        Includes digital + physical book
                                                    </p>
                                                    <Link
                                                        href="/book"
                                                        className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                                                    >
                                                        <BookOpen className="w-3 h-3" />
                                                        View Book Details
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Total Price Display */}
                                    {plan.addBookOption && (planBookOptions[plan.planType] ?? true) && (
                                        <div className="mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total:</span>
                                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {getTotalPrice(plan)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Button */}
                                    {plan.category === "books" ? (
                                        <Link
                                            href="/book"
                                            className={cn(
                                                "w-full py-3 rounded-lg font-medium transition-all duration-200 mt-auto flex items-center justify-center",
                                                "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
                                            )}
                                        >
                                            View Book Details
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handlePlanSelect(plan)}
                                            className={cn(
                                                "w-full py-3 rounded-lg font-medium transition-all duration-200 mt-auto",
                                                plan.badge === "Most Popular"
                                                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 shadow-md"
                                                    : "bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600"
                                            )}
                                        >
                                            Get Started
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trust Indicators */}
            <section className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Trusted by Thousands of Families
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Join the community of successful learners
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Shield, text: "100% Secure", subtext: "Safe payments", color: "green" },
                            { icon: Users, text: "10,000+ Families", subtext: "Trust our program", color: "blue" },
                            { icon: Award, text: "Expert Created", subtext: "Quality assured", color: "purple" },
                            { icon: Clock, text: "Instant Access", subtext: "Start immediately", color: "orange" },
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
            </section>

            {/* Recommendation Box */}
            <section className="py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800/50 dark:to-blue-900/50 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-700 shadow-lg">
                        <div className="w-12 h-12 mx-auto mb-4 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Not Sure Which Plan to Choose?
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">
                            We recommend starting with the <strong className="text-blue-600">Monthly Standard Prep</strong> – it's our most popular option with everything your child needs!
                        </p>

                        <button
                            onClick={handleRecommendation}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md"
                        >
                            View Recommended Plan
                        </button>
                    </div>
                </div>
            </section>

            {/* Help Section */}
            <section className="py-12 px-4 text-center">
                <div className="max-w-3xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Questions? We're Here to Help!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Our support team is ready to assist you in choosing the best plan for your child
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-md">
                            Contact Us
                        </button>
                        <button
                            onClick={scrollToTop}
                            className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2"
                        >
                            <ArrowUp className="w-4 h-4" />
                            Back to Top
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
