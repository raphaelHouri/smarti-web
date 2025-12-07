import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(["/", "/learn(.*)", "/lesson(.*)", "/courses", "/leaderboard", "/shop", "/policy", "/shop(.*)", "/book", "/online-lesson(.*)", "/api/pay(.*)", "/api/pay2(.*)", "/api/book(.*)", "/manifest(.*)", "/manifest.json"],)

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect()
    }
})
export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};