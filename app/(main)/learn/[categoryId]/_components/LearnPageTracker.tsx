"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

interface LearnPageTrackerProps {
    categoryId: string;
    categoryType?: string;
}

export function LearnPageTracker({ categoryId, categoryType }: LearnPageTrackerProps) {
    const { step: systemStep } = useSystemStep();
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per page load
        if (!hasTracked.current && categoryId) {
        trackEvent("learn_page_viewed", {
            systemStep,
            categoryId,
            categoryType,
        });
            hasTracked.current = true;
        }
    }, [systemStep, categoryId, categoryType]);

    return null;
}

