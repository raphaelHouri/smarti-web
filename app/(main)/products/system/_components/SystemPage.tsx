"use client";

import { useState, useEffect } from "react";
import type { FC } from "react";
import { ArrowLeft, Award, Check, Rocket, Shield, Star, MonitorSmartphone, BarChart3, Calendar } from "lucide-react";
import Link from "next/link";
import { cn, getProductYear } from "@/lib/utils";
import FeedbackButton from "@/components/feedbackButton";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

type SystemPageProps = { product: any | null };
const SystemPage: FC<SystemPageProps> = ({ product }) => {
    const [isLoading] = useState(false);
    const { step: systemStep } = useSystemStep();
    const dd = (product?.displayData ?? {}) as any;

    useEffect(() => {
        if (product?.id) {
            trackEvent("product_details_viewed", {
                systemStep,
                productId: product.id,
                productType: "system",
                productName: product.name,
            });
        }
    }, [product?.id, systemStep]);
    const title: string = dd.title ?? product?.name ?? "מערכת הכנה";
    const subtitle: string = product?.description ?? dd.subtitle ?? "תוכנית הכנה חודשית";
    const periodLabel: string = dd.periodLabel ?? "חודשי";
    const monthlyPrice: string = dd.monthlyPrice ?? "$40";
    const year: string = getProductYear();
    const description: string = dd.description ?? "נתיבי למידה מובנים, מבחני תרגול ואנליטיקה בזמן אמת — הכל בתוך מערכת יפה וידידותית לילדים שנועדה לשפר ביצועים בבחינות מחוננים.";
    const features: string[] = Array.isArray(dd.features) ? dd.features : [
        "שיעורי סימולציה פתוחים",
        "מבחני תרגול ובחינות",
        "אנליטיקה מותאמת אישית",
        "תמיכה באימייל",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Back + Feedback */}
            <div className="p-4 flex flex-row items-start justify-between">
                <Link href="/shop/system" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    חזרה לחנות
                </Link>
                <FeedbackButton screenName="system" />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Section - Product Display (similar to book) */}
                    <div className="lg:col-span-3">
                        <div className="relative bg-gray-800 rounded-2xl p-8 mb-6 shadow-2xl">
                            {/* Visual Container */}
                            <div className="relative h-96 bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl overflow-hidden">
                                {/* Centered Icon + Title */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* System Tile */}
                                        <div className="w-48 h-64 bg-gradient-to-br from-purple-600 to-blue-700 rounded-lg shadow-lg transform rotate-3">
                                            <div className="p-6 text-white">
                                                <div className="text-center">
                                                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                                                    <div className="text-sm opacity-90">{periodLabel}</div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold">
                                                        אונליין
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold">
                                                        כל הרמות
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dashboard Cards */}
                                        <div className="absolute -top-6 -right-10 w-44 h-28 bg-white/95 rounded-xl shadow-md backdrop-blur flex items-center justify-center gap-3 p-4">
                                            <BarChart3 className="w-6 h-6 text-purple-600" />
                                            <div className="text-xs font-medium text-gray-700">אנליטיקת התקדמות</div>
                                        </div>
                                        <div className="absolute -bottom-6 -left-10 w-44 h-28 bg-white/90 rounded-xl shadow-md backdrop-blur flex items-center justify-center gap-3 p-4">
                                            <MonitorSmartphone className="w-6 h-6 text-blue-600" />
                                            <div className="text-xs font-medium text-gray-700">כל מכשיר</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ribbon */}
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                            מחוננים
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">מומלץ ביותר</span>
                        </div>
                    </div>

                    {/* Right Section - Details & Purchase */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    עוצב על ידי מומחים
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{subtitle}</h1>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-gray-600 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        {/* Product Attributes (mirrors Book attributes) */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Rocket className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">סוג גישה</span>
                                </div>
                                <div className="font-semibold text-gray-900">מערכת אונליין</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">שנה</span>
                                </div>
                                <div className="font-semibold text-gray-900">{year}</div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">מה כלול במערכת:</h3>
                            <ul className="space-y-3">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Purchase Section */}


                        {/* Back to Shop Button */}
                        <Link
                            href="/shop/system"
                            className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 shadow-lg border text-center font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 mt-6"
                        >
                            חזרה לבחירת חבילה
                        </Link>

                        {/* Additional Trust Indicators (match Book) */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { icon: Award, text: "נוצר על ידי מומחים", color: "purple" },
                                { icon: Shield, text: "100% מאובטח", color: "green" },
                                { icon: Rocket, text: "גישה מיידית", color: "blue" },
                            ].map((item, index) => (
                                <div key={index} className="text-center">
                                    <div
                                        className={cn(
                                            "w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center",
                                            item.color === "purple" && "bg-purple-100",
                                            item.color === "green" && "bg-green-100",
                                            item.color === "blue" && "bg-blue-100"
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                "w-5 h-5",
                                                item.color === "purple" && "text-purple-600",
                                                item.color === "green" && "text-green-600",
                                                item.color === "blue" && "text-blue-600"
                                            )}
                                        />
                                    </div>
                                    <div className="text-xs font-medium text-gray-700">{item.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemPage;


