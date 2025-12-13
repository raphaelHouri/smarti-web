"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface ContactAnimationProps {
    section?: "contact" | "group";
}

const ContactAnimation = ({ section = "contact" }: ContactAnimationProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isInView, setIsInView] = useState(false);
    const [data, setData] = useState<any | null>(null);
    const [currentSection, setCurrentSection] = useState(section);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) setIsInView(true);
        }, { rootMargin: "128px" });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Reset data when section changes
    useEffect(() => {
        if (currentSection !== section) {
            setCurrentSection(section);
            setData(null);
        }
    }, [section, currentSection]);

    useEffect(() => {
        if (!isInView) return;
        if (section === "group") {
            import("@/public/group.json").then((m) => setData(m.default)).catch(() => { });
        } else {
            import("@/public/customer-support.json").then((m) => setData(m.default)).catch(() => { });
        }
    }, [isInView, section]);

    return (
        <div ref={containerRef} className="flex items-center justify-center flex-col h-40 -mt-6 -mb-6">
            {data ? <Lottie animationData={data} loop className="flex items-center justify-center flex-col h-40 -mt-6 -mb-6" /> : null}
        </div>
    );
}

export default ContactAnimation;

