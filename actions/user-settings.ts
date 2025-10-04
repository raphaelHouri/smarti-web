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
    const { userId } = await auth();

    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Update user's name
    if (params.name !== undefined) {
        await db.update(users)
            .set({ name: params.name })
            .where(eq(users.id, userId));
    }

    // Update or insert user settings
    const existingSettings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId),
    });

    if (existingSettings) {
        const updateData = Object.fromEntries(
            Object.entries({
                lessonClock: params.lessonClock,
                quizClock: params.quizClock,
                grade_class: params.grade_class,
                gender: params.gender,
                avatar: params.avatar,
            }).filter(([_, value]) => value !== undefined)
        );

        if (Object.keys(updateData).length > 0) {
            await db.update(userSettings)
                .set(updateData)
                .where(eq(userSettings.userId, userId));
        }
    } else {
        // If settings don't exist, create them
        await db.insert(userSettings).values({
            id: crypto.randomUUID(), // Generate a unique ID for the new record
            userId: userId,
            lessonClock: params.lessonClock,
            quizClock: params.quizClock,
            grade_class: params.grade_class,
            gender: params.gender,
            avatar: params.avatar,
        });
    }

    revalidatePath("/settings"); // Revalidate the settings page to show updated data
}