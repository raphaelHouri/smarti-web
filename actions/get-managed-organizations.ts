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

        // Consider user as "manager/organization user" if they are assigned
        // to any organization year. This makes the manager dashboard visible
        // for all users that belong to an organization, not only explicit managers.
        return !!(currentUser?.managedOrganization && currentUser.managedOrganization.length > 0);

    } catch (error) {
        console.error("Error checking managed organizations:", error);
        return false;
    }
}
