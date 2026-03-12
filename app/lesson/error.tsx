"use client";

export default function LessonError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h2 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
                משהו השתבש
            </h2>
            <button
                onClick={() => reset()}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
                נסה שוב
            </button>
        </div>
    );
}
