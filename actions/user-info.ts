"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

export async function getUserInfo() {
    const { userId } = await auth();
    if (!userId) {
        return { name: null, email: null, error: "Unauthorized" };
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) {
            return { name: null, email: null, error: "User not found" };
        }

        return {
            name: user.name,
            email: user.email,
            error: null
        };
    } catch (error) {
        console.error("Failed to get user info:", error);
        return { name: null, email: null, error: "Failed to load user info" };
    }
}

export async function updateUserName(name: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    if (!name || typeof name !== "string" || !name.trim()) {
        return { success: false, error: "Invalid name" };
    }

    try {
        await db.update(users)
            .set({ name: name.trim() })
            .where(eq(users.id, userId));

        return { success: true, error: null };
    } catch (error) {
        console.error("Failed to update user name:", error);
        return { success: false, error: "Failed to update name" };
    }
}

