"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getOrCreateUserSystemStats } from "@/db/queries";

function validateStep(step: number): 1 | 2 | 3 {
    if (![1, 2, 3].includes(step)) {
        throw new Error("Invalid system step");
    }
    return step as 1 | 2 | 3;
}

export async function setUserSystemStep(step: number) {
    const validStep = validateStep(step);
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    await db
        .update(users)
        .set({ systemStep: validStep })
        .where(eq(users.id, userId));

    // Initialize user system stats for this step if it doesn't exist
    await getOrCreateUserSystemStats(userId, validStep);

    (await cookies()).set("systemStep", String(validStep), { path: "/", maxAge: 60 * 60 * 24 * 365 });

    revalidatePath("/");
    revalidatePath("/learn");
    revalidatePath("/online-lesson");
    revalidatePath("/practice");
    revalidatePath("/leaderboard");
    revalidatePath("/quests");
    revalidatePath("/settings");
}

export async function setGuestSystemStep(step: number) {
    const validStep = validateStep(step);
    (await cookies()).set("systemStep", String(validStep), { path: "/", maxAge: 60 * 60 * 24 * 365 });

    revalidatePath("/");
    revalidatePath("/learn");
    revalidatePath("/online-lesson");
    revalidatePath("/practice");
    revalidatePath("/leaderboard");
    revalidatePath("/quests");
    revalidatePath("/settings");
}


