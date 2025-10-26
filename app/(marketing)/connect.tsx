"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const ConnectJson = () => {
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
        import("@/public/connect.json").then((m) => setData(m.default)).catch(() => { });
    }, [isInView, data]);

    return (
        <div ref={ref} className="flex ml-auto mr-8 mt-44 items-center justify-center flex-col h-px] w-[500px]">
            {data ? <Lottie animationData={data} loop /> : null}
        </div>
    );
}

export default ConnectJson;