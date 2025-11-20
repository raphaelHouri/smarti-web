import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher(["/", "/learn(.*)", "/lesson(.*)", "/courses", "/leaderboard", "/shop", "/policy", "/shop(.*)", "/book", "/online-lesson(.*)", "/api/pay(.*)", "/api/pay2(.*)", "/api/book(.*)", "/api/webhooks(.*)"],)

export default clerkMiddleware(async (auth, req) => {
    // Skip webhook routes
    if (req.nextUrl.pathname.startsWith('/api/webhooks')) {
        return NextResponse.next();
    }

    if (!isPublicRoute(req)) {
        await auth.protect()

        // After authentication, ensure user exists in database
        // This is handled by getOrCreateUserFromGuest in pages, but we can add it here too
        // Note: This might add latency, so consider doing it in a page instead
    }

    return NextResponse.next();
})
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};