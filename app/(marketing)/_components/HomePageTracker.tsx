"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

export function HomePageTracker() {
    const { userId } = useAuth();
    const { step: systemStep } = useSystemStep();

    useEffect(() => {
        trackEvent("home_page_viewed", {
            systemStep,
            isAuthenticated: !!userId,
        });
    }, []); // Only track on mount

    return null;
}

