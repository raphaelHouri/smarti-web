"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { initPostHog, identifyUser, setUserProperties } from "@/lib/posthog";
import { useSystemStep } from "@/hooks/use-system-step";

/**
 * PostHog Provider Component
 * Initializes PostHog and identifies users when they log in
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: userLoaded } = useUser();
    const { step: systemStep } = useSystemStep();

    useEffect(() => {
        // Initialize PostHog on mount
        initPostHog();
    }, []);

    useEffect(() => {
        if (!userLoaded) return;

        if (user) {
            // Identify user when logged in
            identifyUser(user.id, {
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName || user.firstName || undefined,
                systemStep,
            });

            // Set systemStep as user property
            setUserProperties({ systemStep });
        }
    }, [user, userLoaded, systemStep]);

    // Update systemStep property when it changes
    useEffect(() => {
        if (userLoaded && user) {
            setUserProperties({ systemStep });
        }
    }, [systemStep, user, userLoaded]);

    return <>{children}</>;
}

