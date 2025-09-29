// actions/user.ts
"use server";

import { auth } from "@clerk/nextjs/server"; // Assuming you're using Clerk for authentication
import db from "@/db/drizzle"; // Your Drizzle DB instance
import { users, userSettings } from "@/db/schemaSmarti"; // Your Drizzle schema
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdateUserParams {
    name?: string;
    lessonClock?: boolean;
    quizClock?: boolean;
    grade_class?: string | null;
    gender?: string | null;
    avatar?: string | null;
}

export async function updateUser(params: UpdateUserParams) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Start a transaction if you need to update multiple tables atomically
    await db.transaction(async (tx) => {
        // Update user's name
        if (params.name !== undefined) {
            await tx.update(users)
                .set({ name: params.name })
                .where(eq(users.id, userId));
        }

        // Update or insert user settings
        const existingSettings = await tx.query.userSettings.findFirst({
            where: eq(userSettings.userId, userId),
        });

        if (existingSettings) {
            await tx.update(userSettings)
                .set({
                    lessonClock: params.lessonClock,
                    quizClock: params.quizClock,
                    grade_class: params.grade_class,
                    gender: params.gender,
                    avatar: params.avatar,
                })
                .where(eq(userSettings.userId, userId));
        } else {
            // If settings don't exist, create them
            await tx.insert(userSettings).values({
                userId: userId,
                lessonClock: params.lessonClock,
                quizClock: params.quizClock,
                grade_class: params.grade_class,
                gender: params.gender,
                avatar: params.avatar,
            });
        }
    });

    revalidatePath("/settings"); // Revalidate the settings page to show updated data
}