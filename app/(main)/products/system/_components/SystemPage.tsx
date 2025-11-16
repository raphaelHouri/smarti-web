"use client";

import { useState } from "react";
import type { FC } from "react";
import { ArrowLeft, Award, Check, Rocket, Shield, Star, MonitorSmartphone, BarChart3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import FeedbackButton from "@/components/feedbackButton";

type SystemPageProps = { product: any | null };
const SystemPage: FC<SystemPageProps> = ({ product }) => {
    const [isLoading] = useState(false);
    const dd = (product?.displayData ?? {}) as any;
    const title: string = dd.title ?? product?.name ?? "Preparation System";
    const subtitle: string = product?.description ?? dd.subtitle ?? "Monthly Preparation Program";
    const periodLabel: string = dd.periodLabel ?? "Monthly";
    const monthlyPrice: string = dd.monthlyPrice ?? "$40";
    const features: string[] = Array.isArray(dd.features) ? dd.features : [
        "mock lessons unlocked",
        "Practice tests & exams",
        "Personalized analytics",
        "Email support",
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Back + Feedback */}
            <div className="p-4 flex flex-row items-start justify-between">
                <Link href="/shop/system" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shop
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
                                                        Online
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="bg-white text-purple-600 px-2 py-1 rounded text-xs font-bold">
                                                        All Levels
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dashboard Cards */}
                                        <div className="absolute -top-6 -right-10 w-44 h-28 bg-white/95 rounded-xl shadow-md backdrop-blur flex items-center justify-center gap-3 p-4">
                                            <BarChart3 className="w-6 h-6 text-purple-600" />
                                            <div className="text-xs font-medium text-gray-700">Progress Analytics</div>
                                        </div>
                                        <div className="absolute -bottom-6 -left-10 w-44 h-28 bg-white/90 rounded-xl shadow-md backdrop-blur flex items-center justify-center gap-3 p-4">
                                            <MonitorSmartphone className="w-6 h-6 text-blue-600" />
                                            <div className="text-xs font-medium text-gray-700">Any Device</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Ribbon */}
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                            Gifted
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtitle */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">Most Recommended</span>
                        </div>
                    </div>

                    {/* Right Section - Details & Purchase */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Award className="w-4 h-4" />
                                    Expert Designed
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{subtitle}</h1>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-gray-600 leading-relaxed">
                                Structured learning paths, practice tests, and real-time analytics — all inside
                                a beautiful, kid-friendly system built to improve gifted exam performance.
                            </p>
                        </div>

                        {/* Product Attributes (mirrors Book attributes) */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Rocket className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Access Type</span>
                                </div>
                                <div className="font-semibold text-gray-900">Online System</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Period</span>
                                </div>
                                <div className="font-semibold text-gray-900">Monthly</div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">What's included in the system:</h3>
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
                        <div className="bg-white rounded-xl p-6 shadow-lg border">
                            <div className="mb-2">
                                <span className="text-sm text-gray-500">Monthly Price</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-6">{monthlyPrice}</div>
                            <Link href="/shop/system" className={cn(
                                "w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2",
                                "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 shadow-lg hover:shadow-xl"
                            )}>
                                Choose Plan
                            </Link>
                            <div className="mt-4 text-center">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Secure Payment
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        Proven Results
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Trust Indicators (match Book) */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { icon: Award, text: "Expert Created", color: "purple" },
                                { icon: Shield, text: "100% Secure", color: "green" },
                                { icon: Rocket, text: "Instant Access", color: "blue" },
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


