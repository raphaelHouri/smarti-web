"use server";

import { hasFullAccess } from "./admin";

/**
 * Check if user has Pro access based on subscription and system step
 * @param userSubscription - Set of ProductType subscriptions, or null if no subscriptions
 * @param systemStep - Current system step (1, 2, or 3)
 * @returns true if user has Pro access, false otherwise
 */
export async function checkIsPro(
    userSubscription: Set<string> | null,
    systemStep: number
): Promise<boolean> {
    if (!userSubscription) {
        return false;
    }
    const isFullAccess = await hasFullAccess();
    if (isFullAccess) {
        return true;
    }
    // User has access to all systems
    if (userSubscription.has("all")) {
        return true;
    }

    // User has access to system1 and is on step 1
    if (userSubscription.has("system1") && systemStep === 1) {
        return true;
    }

    // User has access to system2 and is on step 2
    if (userSubscription.has("system2") && systemStep === 2) {
        return true;
    }
    if (userSubscription.has("system3") && systemStep === 3) {
        return true;
    }

    return false;
}

