// app/settings/_components/AvatarSelector.tsx
"use client";

import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class concatenation

interface AvatarSelectorProps {
    value: string; // Current selected avatar path (e.g., "/avatars/man.svg")
    onValueChange: (newValue: string) => void;
    avatars: { src: string; alt: string }[];
}

export function AvatarSelector({ value, onValueChange, avatars }: AvatarSelectorProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {avatars.map((avatar) => (
                <div
                    key={avatar.src}
                    className={cn(
                        "relative w-24 h-24 rounded-full border-4 cursor-pointer overflow-hidden transition-all duration-200",
                        "flex items-center justify-center bg-gray-50 dark:bg-gray-700",
                        value === avatar.src
                            ? "border-blue-500 ring-2 ring-blue-500 scale-105"
                            : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400"
                    )}
                    onClick={() => onValueChange(avatar.src)}
                >
                    <Image
                        src={avatar.src}
                        alt={avatar.alt}
                        width={64} // Adjust size as needed
                        height={64} // Adjust size as needed
                        className="object-contain"
                    />
                    {value === avatar.src && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                            <svg className="h-8 w-8 text-blue-800 dark:text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}