"use client";

import posthog from "posthog-js";
import { useEffect } from "react";

/**
 * Initialize PostHog client-side
 * Should only be called in client components
 */
export function initPostHog() {
    if (typeof window === "undefined") return;

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (!posthogKey) {
        console.warn("PostHog key not found. Analytics will not be tracked.");
        return;
    }

    if (!posthog.__loaded) {
        posthog.init(posthogKey, {
            api_host: posthogHost,
            loaded: (posthog) => {
                if (process.env.NODE_ENV === "development") {
                    console.log("PostHog initialized");
                }
            },
            // Capture pageviews automatically
            capture_pageview: true,
            // Capture pageleaves automatically
            capture_pageleave: true,
            // Enable autocapture for better insights
            autocapture: true,
            // Respect user privacy - don't capture sensitive data
            respect_dnt: true,
            // Disable session recording by default (can be enabled per user)
            disable_session_recording: false,
            // Persist user across sessions
            persistence: "localStorage+cookie",
        });
    }
}

/**
 * Identify a user in PostHog
 * Call this when user logs in or when user data changes
 */
export function identifyUser(userId: string, properties?: {
    email?: string;
    name?: string;
    systemStep?: number;
    [key: string]: any;
}) {
    if (typeof window === "undefined") return;

    posthog.identify(userId, properties);
}

/**
 * Reset PostHog user (call on logout)
 */
export function resetPostHog() {
    if (typeof window === "undefined") return;

    posthog.reset();
}

/**
 * Track a custom event with systemStep automatically included
 */
export function trackEvent(
    eventName: string,
    properties?: {
        systemStep?: number;
        [key: string]: any;
    }
) {
    if (typeof window === "undefined") return;

    // Get systemStep from cookie if not provided
    const systemStep = properties?.systemStep ?? getSystemStepFromCookie();

    posthog.capture(eventName, {
        ...properties,
        systemStep,
        timestamp: new Date().toISOString(),
    });
}

/**
 * Get systemStep from cookie (client-side)
 */
function getSystemStepFromCookie(): number {
    if (typeof document === "undefined") return 1;

    const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("systemStep="))
        ?.split("=")[1];

    if (!cookieValue) return 1;

    const step = Number(cookieValue);
    return [1, 2, 3].includes(step) ? step : 1;
}

/**
 * Set user properties (including systemStep)
 */
export function setUserProperties(properties: {
    systemStep?: number;
    [key: string]: any;
}) {
    if (typeof window === "undefined") return;

    const systemStep = properties.systemStep ?? getSystemStepFromCookie();

    posthog.setPersonProperties({
        ...properties,
        systemStep,
    });
}

/**
 * Get PostHog instance (for advanced usage)
 */
export function getPostHog() {
    if (typeof window === "undefined") return null;
    return posthog;
}

