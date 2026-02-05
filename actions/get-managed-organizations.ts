"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

export async function hasManagedOrganizations(): Promise<boolean> {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return false;
        }

        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        return !!(currentUser?.managedOrganization && currentUser.managedOrganization.length > 0);
    } catch (error) {
        console.error("Error checking managed organizations:", error);
        return false;
    }
}
