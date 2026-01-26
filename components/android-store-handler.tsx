"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useClerk } from "@clerk/nextjs";

/**
 * AndroidStoreHandler Component (supports both Android and iOS stores)
 * 
 * Automatically logs in users when ?store=android or ?store=ios query parameter is present.
 * 
 * Behavior:
 * - Checks if store credentials are configured BEFORE starting any process
 * - If ANDROID_STORE_EMAIL/IOS_STORE_EMAIL don't exist in .env → component does nothing (returns null)
 * - If credentials are configured → proceeds with automatic authentication
 * - Uses Clerk's client-side SDK for secure authentication
 * 
 * Environment Variables Required:
 * - For Android: ANDROID_STORE_EMAIL, ANDROID_STORE_PASSWORD
 * - For iOS: IOS_STORE_EMAIL, IOS_STORE_PASSWORD
 * 
 * If credentials are not configured, the component will:
 * 1. Check credentials configuration first (via API)
 * 2. If not configured (404) → immediately return null (no processing)
 * 3. Remove query parameter from URL
 * 4. Continue normally without errors
 */
export function AndroidStoreHandler() {
    const router = useRouter();
    const pathname = usePathname();
    const { isSignedIn, isLoaded } = useAuth();
    const clerk = useClerk();
    const [storeParam, setStoreParam] = useState<string | null>(null);
    const hasProcessed = useRef(false);

    // Read search params from URL on client side to avoid hydration issues
    useEffect(() => {
        if (typeof window === "undefined") return;
        
        const params = new URLSearchParams(window.location.search);
        const store = params.get("store");
        setStoreParam(store);
    }, []);

    useEffect(() => {
        // Early exit conditions - don't process if:
        // 1. No store parameter or invalid store type
        // 2. User is already signed in
        // 3. Clerk SDK not loaded
        // 4. Clerk client not available
        // 5. Already processed this request
        // 6. Store param not yet loaded from URL
        if (
            !storeParam ||
            (storeParam !== "android" && storeParam !== "ios") ||
            isSignedIn ||
            !isLoaded ||
            !clerk ||
            hasProcessed.current
        ) {
            return;
        }

        hasProcessed.current = true;

        const handleAutoLogin = async () => {
            try {
                // STEP 1: Check if credentials are configured BEFORE starting any process
                // This prevents unnecessary processing if env vars don't exist
                // 
                // For Android (store=android):
                //   - Requires ANDROID_STORE_EMAIL in .env
                //   - If ANDROID_STORE_EMAIL doesn't exist → return null (don't start process)
                //
                // For iOS (store=ios):
                //   - Requires IOS_STORE_EMAIL in .env  
                //   - If IOS_STORE_EMAIL doesn't exist → return null (don't start process)
                const credentialsResponse = await fetch(`/api/store-credentials?store=${storeParam}`, {
                    method: "GET",
                    credentials: "include",
                });

                // STEP 2: If credentials are not configured (404), stop immediately
                // The API returns 404 when ANDROID_STORE_EMAIL or IOS_STORE_EMAIL doesn't exist
                if (credentialsResponse.status === 404) {
                    // Credentials not configured - remove query param and return (don't process)
                    router.replace(pathname);
                    return;
                }

                // STEP 3: If API returns any error, stop processing
                if (!credentialsResponse.ok) {
                    router.replace(pathname);
                    return;
                }

                // STEP 4: Parse response and verify credentials exist
                const { email, password, notConfigured } = await credentialsResponse.json();

                // If credentials are missing or marked as not configured, stop processing
                if (notConfigured || !email || !password) {
                    router.replace(pathname);
                    return;
                }

                // STEP 5: Credentials are configured - proceed with authentication
                // Verify Clerk client is available before proceeding
                if (!clerk.client) {
                    router.replace(pathname);
                    return;
                }

                // STEP 6: Create sign-in attempt with credentials
                const signInAttempt = await clerk.client.signIn.create({
                    identifier: email,
                    password: password,
                });

                // Check if sign-in was successful
                if (signInAttempt.status === "complete" && signInAttempt.createdSessionId) {
                    // Set the active session to complete login
                    await clerk.setActive({ session: signInAttempt.createdSessionId });

                    // Refresh to activate the new session
                    router.refresh();

                    // Remove query parameter after successful login
                    setTimeout(() => {
                        router.replace(pathname);
                    }, 500);
                } else {
                    // Sign-in incomplete (e.g., MFA required) - remove query param and stop
                    router.replace(pathname);
                }
            } catch (error) {
                // On any error, remove query param and stop processing
                router.replace(pathname);
            }
        };

        void handleAutoLogin();
    }, [storeParam, isSignedIn, isLoaded, clerk, router, pathname]);

    return null;
}

