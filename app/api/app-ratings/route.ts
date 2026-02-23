import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { appRatingLogs } from "@/db/schemaSmarti";

// POST - Save an app rating log
export async function POST(req: Request) {
    let userId: string | null = null;

    // Try to get userId from Clerk auth
    try {
        const authResult = await auth();
        userId = authResult.userId || null;
    } catch {
        // Auth not available (mobile app request)
    }

    try {
        const body = await req.json();

        // If no userId from auth, try from body
        if (!userId) {
            userId = body.userId || null;
        }

        const { rating, feedback, deviceId, deviceType, deviceModel, appVersion, action } = body;

        // Validate required fields
        if (rating === undefined || rating === null || !action) {
            return NextResponse.json(
                { error: "Missing required fields: rating and action are required" },
                { status: 400 }
            );
        }

        // Validate rating range (0 is allowed for "dismissed" action)
        if (typeof rating !== "number" || rating < 0 || rating > 5) {
            return NextResponse.json(
                { error: "Rating must be a number between 0 and 5" },
                { status: 400 }
            );
        }

        // Validate action
        const validActions = ["rated", "store_review", "dismissed"];
        if (!validActions.includes(action)) {
            return NextResponse.json(
                { error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
                { status: 400 }
            );
        }

        const newLog = await db
            .insert(appRatingLogs)
            .values({
                userId: userId || null,
                rating,
                feedback: feedback || null,
                deviceId: deviceId || null,
                deviceType: deviceType || null,
                deviceModel: deviceModel || null,
                appVersion: appVersion || null,
                action,
            })
            .returning();

        return NextResponse.json({
            success: true,
            log: newLog[0],
            message: "Rating saved successfully",
        });
    } catch (error) {
        console.error("Error saving app rating:", error);
        return NextResponse.json(
            { error: "Failed to save rating" },
            { status: 500 }
        );
    }
}
