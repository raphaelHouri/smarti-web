"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";

interface ErrorFallbackProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
}

export function ErrorFallback({
    error,
    reset,
    title = "אוי לא, משהו השתבש!",
}: ErrorFallbackProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-6 bg-neutral-50 dark:bg-neutral-900">
            <div className="relative w-32 h-32 animate-bounce">
                <Image
                    src="/mascot_sad.svg"
                    alt="Sad Mascot"
                    fill
                    className="object-contain drop-shadow-md"
                />
            </div>
            
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                    {title}
                </h2>
                <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-md">
                    נראה שיש לנו תקלה קטנה בטעינת הדף. אל דאגה, אפשר לנסות שוב או פשוט לרענן את הדף.
                </p>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-2">
                <Button
                    variant="primary"
                    size="lg"
                    onClick={() => reset()}
                    className="gap-2"
                >
                    <RotateCcw className="w-5 h-5" />
                    נסה שוב
                </Button>
                <Button
                    variant="default"
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    רענן דף
                </Button>
            </div>

            <details className="text-xs text-neutral-400 max-w-md w-full text-right mt-8 group">
                <summary className="cursor-pointer select-none hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors inline-flex items-center gap-1">
                    <span className="group-open:hidden">▼</span>
                    <span className="hidden group-open:inline">▲</span>
                    פרטי השגיאה (למפתחים)
                </summary>
                <pre className="mt-3 p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-auto whitespace-pre-wrap text-left shadow-sm">
                    <code className="text-rose-500 dark:text-rose-400 font-mono">
                        {error.message}
                    </code>
                    {error.digest && (
                        <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700 text-neutral-500">
                            Digest: {error.digest}
                        </div>
                    )}
                </pre>
            </details>
        </div>
    );
}
