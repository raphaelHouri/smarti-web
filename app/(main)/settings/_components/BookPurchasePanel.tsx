"use client";

import { useState } from "react";
import { BookOpen, Check, Copy, Download, KeyRound } from "lucide-react";
import { toast } from "sonner";

export type BookPurchaseDetail = {
    productId: string;
    studentName: string;
    filename: string;
    gcsBucket: string;
    vatId: string;
    validUntil: Date | string;
    generated: boolean;
    product?: { name: string } | null;
};

interface BookPurchasePanelProps {
    book: BookPurchaseDetail;
}

function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat("he-IL", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export function BookPurchasePanel({ book }: BookPurchasePanelProps) {
    const [copied, setCopied] = useState(false);
    const downloadLink = `https://storage.googleapis.com/${book.gcsBucket}/${book.filename}`;

    const handleCopyPassword = async () => {
        try {
            await navigator.clipboard.writeText(book.vatId);
            setCopied(true);
            toast.success("הסיסמה הועתקה ללוח");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("שגיאה בהעתקת הסיסמה");
        }
    };

    return (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-4 dark:border-indigo-800 dark:bg-indigo-950/30">
            <div className="mb-3 flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="text-sm font-semibold">פרטי החוברת</span>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-x-6 gap-y-1 text-muted-foreground">
                    <span>שם התלמיד: {book.studentName}</span>
                    <span>בתוקף עד: {formatDate(book.validUntil)}</span>
                </div>

                {book.generated ? (
                    <a
                        href={downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                        <Download className="h-4 w-4" />
                        הורדת החוברת
                    </a>
                ) : (
                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                        הקובץ בהכנה — נסו שוב בעוד מספר דקות
                    </p>
                )}

                <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                    <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                        <KeyRound className="h-4 w-4" />
                        <span className="text-xs font-medium">סיסמה לפתיחת הקובץ</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <code className="rounded bg-gray-100 px-2 py-1 font-mono text-base tracking-wide text-neutral-800 dark:bg-gray-800 dark:text-slate-100">
                            {book.vatId}
                        </code>
                        <button
                            type="button"
                            onClick={() => void handleCopyPassword()}
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    הועתק
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    העתק
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
