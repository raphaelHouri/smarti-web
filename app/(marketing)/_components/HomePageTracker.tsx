"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

export function HomePageTracker() {
    const { userId } = useAuth();
    const { step: systemStep } = useSystemStep();
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per page load
        if (!hasTracked.current) {
        trackEvent("home_page_viewed", {
            systemStep,
            isAuthenticated: !!userId,
        });
            hasTracked.current = true;
        }
    }, [systemStep, userId]);

    return null;
}

