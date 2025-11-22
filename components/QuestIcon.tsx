"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface QuestIconProps {
    animationPath: string;
    className?: string;
    width?: number;
    height?: number;
    loop?: boolean;
}

const QuestIcon = ({
    animationPath,
    className = "",
    width = 40,
    height = 40,
    loop = true
}: QuestIconProps) => {
    const [animationData, setAnimationData] = useState<any | null>(null);

    useEffect(() => {
        // Fetch JSON from public folder at runtime
        fetch(animationPath)
            .then((response) => response.json())
            .then((data) => {
                setAnimationData(data);
            })
            .catch(() => {
                // Fallback to empty state if animation fails to load
            });
    }, [animationPath]);

    if (!animationData) {
        return (
            <div
                className={className}
                style={{ width, height }}
            />
        );
    }

    return (
        <div className={className} style={{ width, height }}>
            <Lottie
                animationData={animationData}
                loop={loop}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default QuestIcon;

