import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getDefaultSystemStep } from '@/lib/utils';

const isPublicRoute = createRouteMatcher(["/", "/learn(.*)", "/lesson(.*)", "/courses", "/leaderboard", "/shop", "/policy", "/shop(.*)", "/book", "/online-lesson(.*)", "/api/pay(.*)", "/api/pay2(.*)", "/api/book(.*)", "/api/android-store-login", "/api/store-credentials", "/api/system-config/public", "/api/push-notification-tokens(.*)", "/contact(.*)", "/manifest(.*)", "/manifest.json", "/sign-in(.*)"],)

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }

    // Initialize systemStep cookie for all users (guests and authenticated) if it doesn't exist
    const response = NextResponse.next();
    const systemStepCookie = req.cookies.get('systemStep');

    if (!systemStepCookie || !['1', '2', '3'].includes(systemStepCookie.value)) {
        const defaultStep = getDefaultSystemStep();
        response.cookies.set('systemStep', defaultStep.toString(), {
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/',
            sameSite: 'lax',
        });
    }

    return response;
})
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};