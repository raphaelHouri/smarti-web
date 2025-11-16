"use client";

import { useState } from "react";
import type { FC } from "react";
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
import FeedbackButton from "@/components/feedbackButton";

type BookPageProps = { product: any | null };
const BookPage: FC<BookPageProps> = ({ product }) => {

    const dd = (product?.displayData ?? {}) as any;
    const title: string = dd.title ?? product?.name ?? "Preparation Booklet";
    const year: string = dd.year ?? "2025";
    const stage: string = dd.stage ?? "Stage A";
    const grade: string = dd.grade ?? "Grade B";
    const productTypeLabel: string = dd.productTypeLabel ?? "Home Printing";
    const price: string = dd.price ?? "$35";
    const features: string[] = Array.isArray(dd.features) ? dd.features : [
        "Comprehensive Reading Comprehension Chapter",
        "Arithmetic Chapter with Diverse Exercises",
        "Exams Chapter for Practice",
        "Useful Tips for Parents and Children",
    ];



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="p-4 flex flex-row items-start justify-between">
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shop
                </Link>
                <FeedbackButton screenName="book" />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="relative bg-gray-800 rounded-2xl p-8 mb-6 shadow-2xl">
                            <div className="relative h-96 bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-48 h-64 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg transform rotate-3">
                                            <div className="p-6 text-white">
                                                <div className="text-center">
                                                    <h3 className="text-lg font-bold mb-2">{title}</h3>
                                                    <div className="text-sm opacity-90">{year}</div>
                                                </div>
                                                <div className="absolute top-4 right-4">
                                                    <div className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">{stage}</div>
                                                </div>
                                                <div className="absolute bottom-4 left-4">
                                                    <div className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold">{grade}</div>
                                                </div>
                                            </div>
                                        </div>

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

                                <div className="absolute top-4 left-4">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                            Gifted
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-600">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">+115 pages</span>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    Most Recommended
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product?.description ?? (
                                    <>Preparation Booklet for <span className="text-blue-600">Grade B Stage A</span></>
                                )}
                            </h1>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 leading-relaxed">
                                Interested in a printed preparation booklet that simulates exam conditions?
                                You can print the preparation booklet at home and start practicing.
                                The booklet includes 3 chapters: Reading Comprehension, Arithmetic,
                                and a chapter of exams. In addition, throughout the book there are
                                tips for parents and children.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Printer className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Product Type</span>
                                </div>
                                <div className="font-semibold text-gray-900">{productTypeLabel}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">Year</span>
                                </div>
                                <div className="font-semibold text-gray-900">{year}</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{dd.featuresTitle ?? "What's included in the booklet:"}</h3>
                            <ul className="space-y-3">
                                {features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-lg border">
                            <div className="mb-4">
                                <span className="text-sm text-gray-500">Special Price</span>
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-6">{price}</div>

                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { icon: Award, text: "Expert Created", color: "purple" },
                                { icon: Shield, text: "100% Secure", color: "green" },
                                { icon: Download, text: "Instant Access", color: "blue" },
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

export default BookPage;

