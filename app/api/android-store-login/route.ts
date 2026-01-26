import { NextRequest, NextResponse } from "next/server";
import { createClerkClient } from "@clerk/backend";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/android-store-login
 * Automatically authenticates with Android store credentials when store=android parameter is present.
 * This endpoint should only be called from the client-side AndroidStoreHandler component.
 * 
 * Uses Clerk's backend SDK (@clerk/backend) to create a sign-in and session token.
 */
export async function GET(request: NextRequest) {
    try {
        // Check if user is already authenticated
        const { userId: currentUserId } = await auth();
        if (currentUserId) {
            // User is already authenticated, return success
            return NextResponse.json({
                success: true,
                alreadyAuthenticated: true,
                userId: currentUserId
            });
        }

        // Get credentials from environment variables (server-side only)
        const email = process.env.ANDROID_STORE_EMAIL;
        const password = process.env.ANDROID_STORE_PASSWORD;
        const clerkSecretKey = process.env.CLERK_SECRET_KEY || process.env.NEXT_PUBLIC_CLERK_SECRET_KEY;

        if (!email || !password) {
            console.error("Android store credentials not configured");
            return NextResponse.json(
                { error: "Android store login not configured" },
                { status: 500 }
            );
        }

        if (!clerkSecretKey) {
            console.error("CLERK_SECRET_KEY not configured");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // Create Clerk client using @clerk/backend (same as the script uses)
        const clerk = createClerkClient({ secretKey: clerkSecretKey });

        // Use Clerk's REST API directly to create a sign-in
        // We need to use the frontend API endpoint
        const clerkFrontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API ||
            process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.split('_')[1] ||
            'clerk.dev';

        // Create sign-in attempt using Clerk's REST API
        const signInResponse = await fetch(`https://${clerkFrontendApi}/v1/client/sign_ins`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}`,
            },
            body: JSON.stringify({
                identifier: email,
                password: password,
                strategy: "password",
            }),
        });

        if (!signInResponse.ok) {
            const errorData = await signInResponse.json().catch(() => ({}));
            console.error("Clerk sign-in API error:", errorData);
            return NextResponse.json(
                { error: "Authentication failed" },
                { status: 401 }
            );
        }

        const signInData = await signInResponse.json();

        // Check if sign-in was successful
        if (signInData.status === "complete" && signInData.created_session_id) {
            // Return the session ID and let Clerk's middleware handle session management
            // For Next.js with Clerk, the session is managed automatically through middleware
            // We just need to ensure the session ID is properly set

            // Create response with success and session information
            const response = NextResponse.json({
                success: true,
                userId: signInData.user_id,
                sessionId: signInData.created_session_id,
                // Note: For automatic login, we may need to redirect to Clerk's sign-in
                // or use a different approach to set the session cookie
                // Clerk's middleware should handle this automatically
            });

            // Try to get the session token from the sign-in response if available
            // Some Clerk API versions include the token in the sign-in response
            if (signInData.session_token) {
                response.cookies.set("__session", signInData.session_token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 7, // 7 days
                });
            } else if (signInData.client) {
                // If we have a client object, try to extract token from there
                // This varies by Clerk API version
                const clientSessionToken = signInData.client?.sessions?.[0]?.last_active_token;
                if (clientSessionToken) {
                    response.cookies.set("__session", clientSessionToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: 60 * 60 * 24 * 7,
                    });
                }
            }

            return response;
        }

        // Sign-in incomplete (might need additional steps like MFA)
        return NextResponse.json(
            {
                error: "Sign-in incomplete",
                status: signInData.status
            },
            { status: 401 }
        );
    } catch (error) {
        console.error("Android store auto-login error:", error);

        // Don't expose sensitive error details to client
        return NextResponse.json(
            { error: "Authentication failed" },
            { status: 500 }
        );
    }
}

