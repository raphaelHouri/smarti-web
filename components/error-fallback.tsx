"use client";

import { useEffect } from "react";

interface ErrorFallbackProps {
    error: Error & { digest?: string };
    reset: () => void;
    title?: string;
}

export function ErrorFallback({
    error,
    reset,
    title = "משהו השתבש",
}: ErrorFallbackProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                {title}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-md">
                אירעה שגיאה בטעינת הדף. ניתן לנסות שוב או לרענן את הדף.
            </p>
            <details className="text-xs text-neutral-400 max-w-md w-full text-right">
                <summary className="cursor-pointer select-none">פרטי השגיאה</summary>
                <pre className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-auto whitespace-pre-wrap text-left">
                    {error.message}
                    {error.digest ? `\n\nDigest: ${error.digest}` : null}
                </pre>
            </details>
            <div className="flex flex-wrap gap-3 justify-center">
                <button
                    type="button"
                    onClick={() => reset()}
                    className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                    נסה שוב
                </button>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    רענן דף
                </button>
            </div>
        </div>
    );
}
