/**
 * List of user IDs that should have certain features hidden
 * These users will not see:
 * - Clerk authentication buttons (sign in/sign up)
 * - PWA download prompt
 * - Certain menu items (shop, book, online lessons, contact)
 */
export const RESTRICTED_USER_IDS: readonly string[] = [
    "user_3856qGVJPcgdZ9fZbFVsPWxaPZ7",
    "user_38mmuRyPuRvxp28mpn2V4SeAawt"
] as const;

/**
 * Check if a user ID is in the restricted users list
 * @param userId - The user ID to check (can be null/undefined for guests)
 * @returns true if the user should have features hidden, false otherwise
 */
export function isUserRestricted(userId: string | null | undefined): boolean {
    if (!userId) {
        return false; // Guests are not restricted
    }
    return RESTRICTED_USER_IDS.includes(userId);
}

/**
 * Check if a user should see Clerk authentication buttons
 * @param userId - The user ID to check
 * @returns true if the user should see auth buttons, false otherwise
 */
export function shouldShowAuthButtons(userId: string | null | undefined): boolean {
    return !isUserRestricted(userId);
}

/**
 * Check if a user should see PWA install prompt
 * @param userId - The user ID to check
 * @returns true if the user should see PWA prompt, false otherwise
 */
export function shouldShowPWAPrompt(userId: string | null | undefined): boolean {
    return !isUserRestricted(userId);
}

/**
 * List of menu item hrefs that should be hidden for restricted users
 */
const RESTRICTED_MENU_ITEMS: readonly string[] = [
    '/shop',           // חנות השירותים (Shop/Services)
    '/shop/book',      // חוברות מבחנים / חוברת הכנה (Preparation Booklet)
    '/online-lesson',  // שיעורי אונליין (Online Lessons)
    '/contact',        // צור קשר (Contact)
] as const;

/**
 * Check if a menu item should be shown for a user
 * @param href - The href/path of the menu item
 * @param userId - The user ID to check
 * @returns true if the menu item should be shown, false otherwise
 */
export function shouldShowMenuItem(href: string, userId: string | null | undefined): boolean {
    // If user is not restricted, show all items
    if (!isUserRestricted(userId)) {
        return true;
    }

    // If user is restricted, hide restricted menu items
    return !RESTRICTED_MENU_ITEMS.includes(href);
}

