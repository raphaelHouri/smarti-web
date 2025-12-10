// actions/user.ts
"use server";

import { auth } from "@clerk/nextjs/server"; // Assuming you're using Clerk for authentication
import db from "@/db/drizzle"; // Your Drizzle DB instance
import { users, userSettings } from "@/db/schemaSmarti"; // Your Drizzle schema
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserSystemStep } from "@/db/queries";

interface UpdateUserParams {
    name?: string;
    lessonClock?: boolean;
    quizClock?: boolean;
    grade_class?: string | null;
    gender?: string | null;
    avatar?: string | null;
}

const ALLOWED_AVATARS = [
    "/smarti_avatar.png",
    "/boy_avatar.png",
    "/girl_avatar.png",
    "/dragon_avatar.png",
] as const;

type AllowedAvatar = (typeof ALLOWED_AVATARS)[number];

function sanitizeAvatar(input: string | null | undefined): AllowedAvatar | undefined {
    if (!input) return undefined;
    return (ALLOWED_AVATARS as readonly string[]).includes(input) ? (input as AllowedAvatar) : undefined;
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

    // Get current system step
    const systemStep = await getUserSystemStep(userId);

    // Update or insert user settings
    const existingSettings = await db.query.userSettings.findFirst({
        where: and(
            eq(userSettings.userId, userId),
            eq(userSettings.systemStep, systemStep)
        ),
    });

    const avatarValue = sanitizeAvatar(params.avatar);

    if (existingSettings) {
        const updateData: Partial<typeof userSettings.$inferInsert> = {};
        if (params.lessonClock !== undefined) updateData.lessonClock = params.lessonClock;
        if (params.quizClock !== undefined) updateData.quizClock = params.quizClock;
        if (params.grade_class !== undefined) updateData.grade_class = params.grade_class ?? null;
        if (params.gender !== undefined) updateData.gender = params.gender ?? null;
        if (avatarValue !== undefined) updateData.avatar = avatarValue;

        if (Object.keys(updateData).length > 0) {
            await db.update(userSettings)
                .set(updateData)
                .where(and(
                    eq(userSettings.userId, userId),
                    eq(userSettings.systemStep, systemStep)
                ));
        }
    } else {
        // If settings don't exist, create them
        const insertData: typeof userSettings.$inferInsert = {
            id: crypto.randomUUID(),
            userId: userId,
            systemStep: systemStep,
        };
        if (params.lessonClock !== undefined) insertData.lessonClock = params.lessonClock;
        if (params.quizClock !== undefined) insertData.quizClock = params.quizClock;
        if (params.grade_class !== undefined) insertData.grade_class = params.grade_class ?? null;
        if (params.gender !== undefined) insertData.gender = params.gender ?? null;
        if (avatarValue !== undefined) insertData.avatar = avatarValue;

        await db.insert(userSettings).values(insertData);
    }

    revalidatePath("/settings"); // Revalidate the settings page to show updated data
}