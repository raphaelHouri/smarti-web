import { auth } from "@clerk/nextjs/server";

const allowedIds = [
    "user_2egY1XnJuT5C9JUjr32CeUS38u2",
    "user_306j7eqpKh6upN8qiAHC02HsiPD"
]

// Whitelist of user IDs that have full access (premium features unlocked)
const fullAccessUserIds = [
    "user_35eDYYCGANyULOU1HY2N1wKWjWX",
    "user_35c1Ttp2gqRwJVHaDGqWe2errKd",
    "user_351nKgCGf2EByDpF9SLvxnRT8kY",
    "user_34jysbbECoozWYDtYDATELi0Xwq",

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
    const userIdToCheck = userId ?? (await auth()).userId;
    if (!userIdToCheck) return false;
    return fullAccessUserIds.includes(userIdToCheck);
}