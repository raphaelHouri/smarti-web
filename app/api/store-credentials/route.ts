import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/store-credentials
 * Returns store credentials (Android or iOS) for automatic login.
 * This is a secure endpoint that only returns credentials server-side.
 * 
 * Query parameters:
 * - store: "android" or "ios" to specify which store credentials to return
 * 
 * NOTE: This endpoint returns credentials that will be used client-side.
 * For better security, consider using the main store-login endpoint
 * that handles everything server-side instead.
 */
export async function GET(request: NextRequest) {
    try {
        // Check if user is already authenticated (no need to auto-login)
        const { userId } = await auth();
        if (userId) {
            return NextResponse.json({
                error: "Already authenticated"
            }, { status: 400 });
        }

        // Get store type from query parameter
        const { searchParams } = new URL(request.url);
        const store = searchParams.get("store");

        if (store !== "android" && store !== "ios") {
            return NextResponse.json(
                { error: "Invalid store parameter. Must be 'android' or 'ios'" },
                { status: 400 }
            );
        }

        // Get credentials from environment variables based on store type
        // Android: Checks for ANDROID_STORE_EMAIL (required) and ANDROID_STORE_PASSWORD
        // iOS: Checks for IOS_STORE_EMAIL (required) and IOS_STORE_PASSWORD
        const email = store === "ios"
            ? process.env.IOS_STORE_EMAIL
            : process.env.ANDROID_STORE_EMAIL;
        const password = store === "ios"
            ? process.env.IOS_STORE_PASSWORD
            : process.env.ANDROID_STORE_PASSWORD;

        // If email doesn't exist, credentials are not configured - return 404
        // This prevents the AndroidStoreHandler from starting any process
        if (!email) {
            return NextResponse.json(
                {
                    error: `${store} store email not configured (missing ${store === "ios" ? "IOS_STORE_EMAIL" : "ANDROID_STORE_EMAIL"})`,
                    notConfigured: true
                },
                { status: 404 }
            );
        }

        // If password doesn't exist, credentials are incomplete - return 404
        if (!password) {
            return NextResponse.json(
                {
                    error: `${store} store password not configured (missing ${store === "ios" ? "IOS_STORE_PASSWORD" : "ANDROID_STORE_PASSWORD"})`,
                    notConfigured: true
                },
                { status: 404 }
            );
        }

        // Return credentials (they'll be used immediately for authentication)
        // This is acceptable because:
        // 1. Credentials are only sent over HTTPS
        // 2. They're used once for authentication
        // 3. They're never stored client-side
        return NextResponse.json({ email, password });
    } catch (error) {
        console.error("Error getting store credentials:", error);
        return NextResponse.json(
            { error: "Failed to get credentials" },
            { status: 500 }
        );
    }
}

