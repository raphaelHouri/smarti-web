"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

interface LearnPageTrackerProps {
    categoryId: string;
    categoryType?: string;
}

export function LearnPageTracker({ categoryId, categoryType }: LearnPageTrackerProps) {
    const { step: systemStep } = useSystemStep();

    useEffect(() => {
        trackEvent("learn_page_viewed", {
            systemStep,
            categoryId,
            categoryType,
        });
    }, []); // Only track on mount

    return null;
}

