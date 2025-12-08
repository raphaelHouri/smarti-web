"use client";

import { useState, useEffect, useCallback } from "react";
import { getSystemStepFromCookie, getSystemStepLabel } from "@/lib/utils";

/**
 * Custom hook to get the current system step and label from cookies
 * @param refreshDeps - Optional dependency array to refresh when these values change
 * @returns Object with step number, label, and refresh function
 */
export function useSystemStep(refreshDeps: unknown[] = []) {
    const [step, setStep] = useState<number>(1);
    const [label, setLabel] = useState<string>("שלב א'");

    const refresh = useCallback(() => {
        const currentStep = getSystemStepFromCookie();
        setStep(currentStep);
        setLabel(getSystemStepLabel(currentStep));
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh, ...refreshDeps]);

    return { step, label, refresh };
}

/**
 * Custom hook to get the current system step label from cookies
 * Useful when you only need the label
 * @param refreshDeps - Optional dependency array to refresh when these values change
 */
export function useSystemStepLabel(refreshDeps: unknown[] = []) {
    const [label, setLabel] = useState<string>("שלב א'");

    const refresh = useCallback(() => {
        const step = getSystemStepFromCookie();
        setLabel(getSystemStepLabel(step));
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh, ...refreshDeps]);

    return label;
}

