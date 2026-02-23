import { auth } from "@clerk/nextjs/server";

const allowedIds = [
    "user_2egY1XnJuT5C9JUjr32CeUS38u2",
    "user_306j7eqpKh6upN8qiAHC02HsiPD",
    "user_35e887Adqg7eDDBfQ8b4bk5BOas"
]

// Whitelist of user IDs that have full access (premium features unlocked)
const fullAccessUserIds = [
    "user_35eDYYCGANyULOU1HY2N1wKWjWX",
    "user_35c1Ttp2gqRwJVHaDGqWe2errKd",
    "user_351nKgCGf2EByDpF9SLvxnRT8kY",
    "user_35kTiNLGDNW4htHyQlpdu0WLfir",
    "user_34jysbbECoozWYDtYDATELi0Xwq",
    "user_35e887Adqg7eDDBfQ8b4bk5BOas",
    "user_3856qGVJPcgdZ9fZbFVsPWxaPZ7",
    "user_38mnNDVt7QVWxrqEvSI0hokpbZL",
    "user_38mmuRyPuRvxp28mpn2V4SeAawt"

]

export const IsAdmin = async () => {
    const { userId } = await auth();
    if (!userId) return false;
    return allowedIds.includes(userId);
}

/**
 * Checks if the current user has full access (premium features unlocked)
 * @param userId - Optional userId to check. If not provided, gets from auth()
 * @returns true if user is in the whitelist, false otherwise
 */
export const hasFullAccess = async (userId?: string | null): Promise<boolean> => {
    console.log("fullAccessUserIds", userId);
    const userIdToCheck = userId ?? (await auth()).userId;
    if (!userIdToCheck) return false;
    return fullAccessUserIds.includes(userIdToCheck);
}