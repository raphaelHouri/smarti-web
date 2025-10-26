"use client";

import { useState } from "react";
import {
    BookOpen,
    Check,
    Star,
    Printer,
    Calendar,
    ShoppingCart,
    ArrowLeft,
    Download,
    FileText,
    Award,
    Shield,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BookPage() {
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchase = () => {
        setIsPurchasing(true);
        // Simulate purchase process
        setTimeout(() => {
            setIsPurchasing(false);
            // Handle actual purchase logic here
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Back Button */}
            <div className="p-4">
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shop
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Section - Product Display (60%) */}
                    <div className="lg:col-span-3">
                        {/* Main Product Card */}
                        <div className="relative bg-gray-800 rounded-2xl p-8 mb-6 shadow-2xl">
                            {/* Product Visual Container */}
                            <div className="relative h-96 bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl overflow-hidden">
                                {/* 3D Book Visualization */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        {/* Book Cover */}
                                        <div className="w-48 h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg transform rotate-3">
                                            <div className="p-6 text-white">
                                                <div className="text-center">
                                                    <h3 className="text-lg font-bold mb-2">Preparation Booklet</h3>
                                                    <div className="text-sm opacity-90">2025</div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                        Stage A
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">
                                                        Grade B
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Open Pages */}
                                        <div className="absolute top-0 left-0 w-48 h-64 bg-white rounded-lg shadow-lg transform -rotate-2">
                                            <div className="p-4">
                                                <div className="h-full bg-gray-50 rounded">
                                                    <div className="p-4">
                                                        <div className="w-8 h-8 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold mb-2">
                                                            Home Print
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="h-2 bg-blue-200 rounded"></div>
                                                            <div className="h-2 bg-green-200 rounded w-3/4"></div>
                                                            <div className="h-2 bg-yellow-200 rounded w-1/2"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Gifted Banner */}
                                <div className="absolute top-4 left-4">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                            Gifted
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Overlays */}
                            <div className="absolute top-8 left-8 flex items-center gap-3 text-white">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="font-semibold">Preparation Booklet</div>
                                    <div className="text-sm opacity-90">Grade B - Stage A</div>
                                </div>
                            </div>

                            <div className="absolute bottom-8 right-8 text-white text-2xl font-bold">
                                2025
                            </div>
                        </div>

                        {/* Page Count */}
                        <div className="flex items-center gap-3 text-gray-600">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">+115 pages</span>
                        </div>
                    </div>

                    {/* Right Section - Product Details & Purchase (40%) */}
                    <div className="lg:col-span-2">
                        {/* Header */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Most Recommended
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Preparation Booklet for{" "}
                                <span className="text-blue-600">Grade B Stage A</span>
                            </h1>
                        </div>

                        {/* Description */}
                        <div className="mb-6">
                            <p className="text-gray-600 leading-relaxed">
                                Interested in a printed preparation booklet that simulates exam conditions?
                                You can print the preparation booklet at home and start practicing.
                                The booklet includes 3 chapters: Reading Comprehension, Arithmetic,
                                and a chapter of exams. In addition, throughout the book there are
                                tips for parents and children.
                            </p>
                        </div>

                        {/* Product Attributes */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Printer className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Product Type</span>
                                </div>
                                <div className="font-semibold text-gray-900">Home Printing</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Year</span>
                                </div>
                                <div className="font-semibold text-gray-900">2025</div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                What's included in the booklet:
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    "Comprehensive Reading Comprehension Chapter",
                                    "Arithmetic Chapter with Diverse Exercises",
                                    "Exams Chapter for Practice",
                                    "Useful Tips for Parents and Children"
                                ].map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Purchase Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg border">
                            <div className="mb-4">
                                <span className="text-sm text-gray-500">Special Price</span>
                            </div>

                            <div className="text-3xl font-bold text-gray-900 mb-6">
                                $35
                            </div>

                            <button
                                onClick={handlePurchase}
                                disabled={isPurchasing}
                                className={cn(
                                    "w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2",
                                    isPurchasing
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
                                )}
                            >
                                {isPurchasing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        Purchase
                                    </>
                                )}
                            </button>

                            {/* Trust Indicators */}
                            <div className="mt-4 text-center">
                                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-3 h-3" />
                                        Secure Payment
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        Instant Delivery
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Printer className="w-3 h-3" />
                                        Home Printing
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Trust Indicators */}
                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { icon: Award, text: "Expert Created", color: "purple" },
                                { icon: Shield, text: "100% Secure", color: "green" },
                                { icon: Download, text: "Instant Access", color: "blue" }
                            ].map((item, index) => (
                                <div key={index} className="text-center">
                                    <div className={cn(
                                        "w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center",
                                        item.color === "purple" && "bg-purple-100",
                                        item.color === "green" && "bg-green-100",
                                        item.color === "blue" && "bg-blue-100"
                                    )}>
                                        <item.icon className={cn(
                                            "w-5 h-5",
                                            item.color === "purple" && "text-purple-600",
                                            item.color === "green" && "text-green-600",
                                            item.color === "blue" && "text-blue-600"
                                        )} />
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
}
