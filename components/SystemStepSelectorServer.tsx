import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";
import { SystemStepSelector } from "./system-step-selector";

export async function SystemStepSelectorServer() {
    const { userId } = await auth();

    let currentStep: number | null = null;
    let isAuthenticated = false;

    if (userId) {
        isAuthenticated = true;
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { systemStep: true },
        });
        if (user?.systemStep && [1, 2, 3].includes(user.systemStep)) {
            currentStep = user.systemStep;
        } else {
            currentStep = 1;
        }
    } else {
        currentStep = null;
    }

    return <SystemStepSelector currentStep={currentStep} isAuthenticated={isAuthenticated} />;
}


