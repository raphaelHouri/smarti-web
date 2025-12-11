"use client";

import { useState, useEffect } from "react";
import { getSystemStepFromCookie, getSystemStepLabel } from "@/lib/utils";
import { trackEvent } from "@/lib/posthog";

/**
 * Simple hook to get the current system step and label from cookies
 * For client components that need immediate cookie-based values
 * Note: For server components, use the getSystemStep server action instead
 */
export function useSystemStep() {
    const [step, setStep] = useState<number>(1);
    const [label, setLabel] = useState<string>("שלב א'");

    useEffect(() => {
        const currentStep = getSystemStepFromCookie();
        setStep(currentStep);
        setLabel(getSystemStepLabel(currentStep));
    }, []);

    // Track systemStep changes
    useEffect(() => {
        if (step) {
            trackEvent("system_step_changed", {
                systemStep: step,
            });
        }
    }, [step]);

    return { step, label };
}

/**
 * Simple hook to get the current system step label from cookies
 * For client components that need immediate cookie-based values
 * Note: For server components, use the getSystemStep server action instead
 */
export function useSystemStepLabel() {
    const [label, setLabel] = useState<string>("שלב א'");

    useEffect(() => {
        const step = getSystemStepFromCookie();
        setLabel(getSystemStepLabel(step));
    }, []);

    return label;
}

