"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const OnlineLessonAnimation = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) setIsInView(true);
        }, { rootMargin: "128px" });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView || data) return;
        import("@/public/online-lessons.json").then((m) => setData(m.default)).catch(() => { });
    }, [isInView, data]);

    return (
        <div ref={containerRef} className="flex items-center justify-center flex-col h-52 -mt-6 -mb-12">
            {data ? <Lottie animationData={data} loop className="flex items-center justify-center flex-col h-42 -mt-6 -mb-12" /> : null}
        </div>
    );
}

export default OnlineLessonAnimation;

