"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const DuoLottie = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [data, setData] = useState<any | null>(null);

    useEffect(() => {
        if (!ref.current) return;
        const obs = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) setIsInView(true);
        }, { rootMargin: "128px" });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView || data) return;
        import("@/public/duo.json").then((m) => setData(m.default)).catch(() => { });
    }, [isInView, data]);

    return (
        <div ref={ref} className="h-20 flex items-center">
            {data ? <Lottie animationData={data} loop className="flex items-center justify-center flex-col h-20 -mt-6 -mb-8" /> : null}
        </div>
    );
}

export default DuoLottie;