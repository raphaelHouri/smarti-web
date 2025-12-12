"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import tapAnimationData from "@/public/tap.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface TapAnimationProps {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export const TapAnimation = ({ className = "", size = "md" }: TapAnimationProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    return (
        <div className={`${sizeClasses[size]} ${className}`}>
            <Lottie
                animationData={tapAnimationData}
                loop={true}
                className="w-full h-full"
            />
        </div>
    );
};

