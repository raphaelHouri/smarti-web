"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LottieJson = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                setIsInView(true);
            }
        }, { rootMargin: "128px" });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView || data) return;
        // Lazy-load animation JSON only when visible
        import("@/public/duolingo.json").then((mod) => setData(mod.default)).catch(() => { });
    }, [isInView, data]);

    return (
        <div ref={containerRef} className="flex items-center justify-center flex-col h-60">
            {data ? (
                <Lottie animationData={data} loop={true} className="flex items-center justify-center flex-col h-80 -mt-6 -mb-12" />
            ) : null}
        </div>
    );
}

export default LottieJson;