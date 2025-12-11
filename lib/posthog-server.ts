import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;

/**
 * Get or create PostHog client instance (server-side)
 */
function getPostHogClient(): PostHog | null {
    if (typeof window !== "undefined") {
        // This is client-side, return null
        return null;
    }

    if (posthogClient) {
        return posthogClient;
    }

    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

    if (!posthogKey) {
        console.warn("PostHog key not found. Server-side analytics will not be tracked.");
        return null;
    }

    posthogClient = new PostHog(posthogKey, {
        host: posthogHost,
        flushAt: 1, // Flush immediately for server-side events
        flushInterval: 0,
    });

    return posthogClient;
}

/**
 * Track an event server-side
 */
export function trackServerEvent(
    userId: string,
    eventName: string,
    properties?: {
        systemStep?: number;
        [key: string]: any;
    }
) {
    const client = getPostHogClient();
    if (!client) return;

    try {
        client.capture({
            distinctId: userId,
            event: eventName,
            properties: {
                ...properties,
                timestamp: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("PostHog server-side tracking error:", error);
    }
}

/**
 * Identify a user server-side
 */
export function identifyServerUser(
    userId: string,
    properties?: {
        email?: string;
        name?: string;
        systemStep?: number;
        [key: string]: any;
    }
) {
    const client = getPostHogClient();
    if (!client) return;

    try {
        client.identify({
            distinctId: userId,
            properties,
        });
    } catch (error) {
        console.error("PostHog server-side identify error:", error);
    }
}

/**
 * Shutdown PostHog client (call on app shutdown)
 */
export async function shutdownPostHog() {
    if (posthogClient) {
        await posthogClient.shutdown();
        posthogClient = null;
    }
}

