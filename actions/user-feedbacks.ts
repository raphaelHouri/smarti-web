"use server";

import { auth } from "@clerk/nextjs/server"; // Assuming Clerk for authentication
import db from "@/db/drizzle"; // Your Drizzle DB instance
import { feedbacks } from "@/db/schemaSmarti"; // Assuming your feedback schema is her

// Define the interface for the parameters this action will receive
interface SubmitFeedbacksParams {
    title: string;
    description: string;
    rating: "terrible" | "bad" | "ok" | "good" | "great"; // Matching the Zod enum

    screenName: string;
    identifier: string;
}

export async function submitFeedback(params: SubmitFeedbacksParams) {
    const { userId } = await auth(); // Get userId and potentially full user object

    // OPTIONAL: If feedbacks must be from an authenticated user, uncomment this.
    // If anonymous feedbacks is allowed, you can remove this check.
    if (!userId) {
        throw new Error("Unauthorized: User must be logged in to submit feedback.");
    }

    try {
        await db.insert(feedbacks).values({
            id: crypto.randomUUID(), // Generate a UUID for the primary key
            userId: userId, // Link to the user who submitted it
            screenName: params.screenName,
            identifier: params.identifier,
            rate: params.rating, // Store the rating as a string
            title: params.title,
            description: params.description,
            createdAt: new Date(), // Automatically set the createdAt timestamp
        });

        // Revalidate a path if you have a public feedback display page
        // For example, if you list recent feedback on an admin dashboard
        // revalidatePath("/admin/feedback");

        // No explicit return value needed, success is implied by no error
        return { success: true, message: "הפידבק נשלח בהצלחה!" };

    } catch (error) {
        console.error("[SUBMIT_FEEDBACK_ACTION_ERROR]", error);
        throw new Error("Failed to submit feedback.");
    }
}
