"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

/**
 * Server action to get the current system step
 * Reads from user database first, then falls back to cookie
 */
export async function getSystemStep(): Promise<number> {
    const { userId } = await auth();

    if (userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { systemStep: true },
        });
        if (user?.systemStep && [1, 2, 3].includes(user.systemStep)) {
            return user.systemStep;
        }
    }

    const cookieValue = (await cookies()).get("systemStep")?.value;
    const cookieNumber = cookieValue ? Number(cookieValue) : NaN;
    if ([1, 2, 3].includes(cookieNumber)) {
        return cookieNumber;
    }

    return 1; // default
}

