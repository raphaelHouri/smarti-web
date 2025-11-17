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
import { cn, getProductYear } from "@/lib/utils";
import Link from "next/link";
import FeedbackButton from "@/components/feedbackButton";
import Image from "next/image";

type BookPageProps = { product: any | null };
const BookPage: FC<BookPageProps> = ({ product }) => {

    const dd = (product?.displayData ?? {}) as any;
    const title: string = dd.title ?? product?.name ?? "חוברת הכנה";
    const year: string = getProductYear();
    const stage: string = dd.stage ?? "שלב א'";
    const grade: string = dd.grade ?? "כיתה ב'";
    const productTypeLabel: string = dd.productTypeLabel ?? "הדפסה ביתית";
    const price: string = dd.price ?? "$35";
    const productType: string = product?.productType ?? "bookStep1";
    const imageSrc: string = `/${productType}.png`;
    const examplePdfSrc: string = `/${productType}_example.pdf`;
    const pages: number = dd.pages ?? 115;
    const description: string = dd.description ?? "מעוניינים בחוברת הכנה מודפסת המדמה תנאי בחינה? תוכלו להדפיס את חוברת ההכנה בבית ולהתחיל לתרגל. החוברת כוללת 3 פרקים: הבנת הנקרא, חשבון, ופרק בחינות. בנוסף, לאורך הספר יש טיפים להורים וילדים.";
    const features: string[] = Array.isArray(dd.features) ? dd.features : [
        "פרק הבנת הנקרא מקיף",
        "פרק חשבון עם תרגילים מגוונים",
        "פרק בחינות לתרגול",
        "טיפים שימושיים להורים וילדים",
    ];



    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="p-4 flex flex-row items-start justify-between">
                <Link
                    href="/shop/book"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    חזרה לחנות
                </Link>
                <FeedbackButton screenName="book" />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="relative bg-gray-800 rounded-2xl p-8 mb-6 shadow-2xl">
                            <div className="relative h-120 bg-gradient-to-br from-blue-900 to-slate-700 rounded-xl overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        <Image
                                            src={imageSrc}
                                            alt={title}
                                            width={600}
                                            height={750}
                                            className="object-contain max-w-full max-h-full"
                                            priority
                                        />
                                    </div>
                                </div>

                                <div className="absolute top-4 left-4">
                                    <div className="bg-white px-3 py-1 rounded-full shadow-md">
                                        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                                            מחוננים
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-600">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium">+{pages} עמודים</span>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Star className="w-4 h-4" />
                                    הכי מומלץ
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product?.description ?? (
                                    <>חוברת הכנה ל<span className="text-blue-600">כיתה ב' שלב א'</span></>
                                )}
                            </h1>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 leading-relaxed">
                                {description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Printer className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">סוג מוצר</span>
                                </div>
                                <div className="font-semibold text-gray-900">{productTypeLabel}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-sm border">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500">שנה</span>
                                </div>
                                <div className="font-semibold text-gray-900">{year}</div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">{dd.featuresTitle ?? "מה כלול בחוברת:"}</h3>
                            <ul className="space-y-3">
                                {features.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <a
                            href={examplePdfSrc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 bg-white border-2 border-blue-500 text-blue-600 rounded-xl p-4 shadow-md font-medium hover:bg-blue-50 transition-all duration-200 mb-4"
                        >
                            <FileText className="w-5 h-5" />
                            צפה בדוגמה (PDF)
                        </a>

                        <Link
                            href="/shop/book"
                            className="block w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 shadow-lg border text-center font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
                        >
                            חזרה לבחירת חבילה
                        </Link>

                        <div className="mt-6 grid grid-cols-3 gap-4">
                            {[
                                { icon: Award, text: "נוצר על ידי מומחים", color: "purple" },
                                { icon: Shield, text: "100% מאובטח", color: "green" },
                                { icon: Download, text: "גישה מיידית", color: "blue" },
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

