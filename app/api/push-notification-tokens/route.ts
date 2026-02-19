import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { pushNotificationTokens } from "@/db/schemaSmarti";
import { eq, and } from "drizzle-orm";
import { getUserSystemStep } from "@/db/queries";

// GET - Get user's push notification tokens
export async function GET(req: Request) {
    let userId: string | null = null;

    // Try to get userId from Clerk auth first
    const authResult = await auth();
    userId = authResult.userId || null;

    // If no userId from auth, try to get it from query params (for mobile app)
    if (!userId) {
        const { searchParams } = new URL(req.url);
        userId = searchParams.get('userId');
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized - userId required" }, { status: 401 });
    }

    const tokens = await db.query.pushNotificationTokens.findMany({
        where: eq(pushNotificationTokens.userId, userId),
        orderBy: (tokens, { desc }) => [desc(tokens.createdAt)],
    });

    return NextResponse.json({ tokens });
}

// POST - Register or update a push notification token (allows null userId)
export async function POST(req: Request) {
    let userId: string | null = null;

    // Try to get userId from Clerk auth first
    const authResult = await auth();
    userId = authResult.userId || null;

    // Parse body
    const body = await req.json();

    // If no userId from auth, try to get it from request body (for mobile app)
    if (!userId) {
        userId = body.userId || null;
    }

    // Allow creating token without userId (will be updated later via PUT)
    try {
        const { token, deviceId, deviceType, deviceName, deviceModel } = body;

        // Validate required fields
        if (!token || !deviceId || !deviceType) {
            return NextResponse.json(
                { error: "Missing required fields: token, deviceId, and deviceType are required" },
                { status: 400 }
            );
        }

        // Validate deviceType
        const validDeviceTypes = ["ios", "android", "web"];
        if (!validDeviceTypes.includes(deviceType)) {
            return NextResponse.json(
                { error: `Invalid deviceType. Must be one of: ${validDeviceTypes.join(", ")}` },
                { status: 400 }
            );
        }

        // Validate token format (Expo push tokens start with ExponentPushToken[)
        if (typeof token !== "string" || token.length < 20) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 400 }
            );
        }

        // Check if token exists for this device (with or without userId)
        const existingToken = await db.query.pushNotificationTokens.findFirst({
            where: eq(pushNotificationTokens.deviceId, deviceId),
        });

        if (existingToken) {
            // Update existing token
            const updateData: any = {
                token,
                deviceType,
                deviceName: deviceName || null,
                deviceModel: deviceModel || null,
                isActive: true,
                updatedAt: new Date(),
            };

            // Only update userId if provided
            if (userId) {
                updateData.userId = userId;
            }

            const updated = await db
                .update(pushNotificationTokens)
                .set(updateData)
                .where(eq(pushNotificationTokens.id, existingToken.id))
                .returning();

            return NextResponse.json({
                success: true,
                token: updated[0],
                message: userId ? "Token updated successfully" : "Token updated (userId will be added later)",
            });
        } else {
            // Create new token (with or without userId)
            const newToken = await db
                .insert(pushNotificationTokens)
                .values({
                    userId: userId || null, // Allow null userId
                    token,
                    deviceId,
                    deviceType,
                    deviceName: deviceName || null,
                    deviceModel: deviceModel || null,
                    isActive: true,
                })
                .returning();

            return NextResponse.json({
                success: true,
                token: newToken[0],
                message: userId ? "Token registered successfully" : "Token registered (userId will be added later)",
            });
        }
    } catch (error) {
        console.error("Error registering push notification token:", error);
        return NextResponse.json(
            { error: "Failed to register token" },
            { status: 500 }
        );
    }
}

// PUT - Update existing token with userId (for tokens created without userId)
export async function PUT(req: Request) {
    let userId: string | null = null;

    // Try to get userId from Clerk auth first
    const authResult = await auth();
    userId = authResult.userId || null;

    // Parse body
    const body = await req.json();

    // If no userId from auth, try to get it from request body
    if (!userId) {
        userId = body.userId || null;
    }

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized - userId required" }, { status: 401 });
    }

    try {
        const { token, deviceId } = body;

        if (!token || !deviceId) {
            return NextResponse.json(
                { error: "Missing required fields: token and deviceId are required" },
                { status: 400 }
            );
        }

        // Validate token format
        if (typeof token !== "string" || token.length < 20) {
            return NextResponse.json(
                { error: "Invalid token format" },
                { status: 400 }
            );
        }

        // Find token by deviceId (might not have userId yet)
        const existingToken = await db.query.pushNotificationTokens.findFirst({
            where: eq(pushNotificationTokens.deviceId, deviceId),
        });

        if (existingToken) {
            // Update existing token with userId
            const updated = await db
                .update(pushNotificationTokens)
                .set({
                    userId,
                    token, // Update token in case it changed
                    isActive: true,
                    updatedAt: new Date(),
                })
                .where(eq(pushNotificationTokens.id, existingToken.id))
                .returning();

            return NextResponse.json({
                success: true,
                token: updated[0],
                message: "Token updated with userId successfully",
            });
        } else {
            // Token doesn't exist, create new one with userId
            const newToken = await db
                .insert(pushNotificationTokens)
                .values({
                    userId,
                    token,
                    deviceId,
                    deviceType: body.deviceType || 'unknown',
                    deviceName: body.deviceName || null,
                    deviceModel: body.deviceModel || null,
                    isActive: true,
                })
                .returning();

            return NextResponse.json({
                success: true,
                token: newToken[0],
                message: "Token created successfully",
            });
        }
    } catch (error) {
        console.error("Error updating token with userId:", error);
        return NextResponse.json(
            { error: "Failed to update token" },
            { status: 500 }
        );
    }
}

// DELETE - Remove a push notification token
export async function DELETE(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { deviceId, tokenId } = body;

        // Either deviceId or tokenId must be provided
        if (!deviceId && !tokenId) {
            return NextResponse.json(
                { error: "Either deviceId or tokenId must be provided" },
                { status: 400 }
            );
        }

        let deletedCount = 0;

        if (tokenId) {
            // Delete by token ID
            const result = await db
                .delete(pushNotificationTokens)
                .where(
                    and(
                        eq(pushNotificationTokens.id, tokenId),
                        eq(pushNotificationTokens.userId, userId)
                    )
                )
                .returning();
            deletedCount = result.length;
        } else if (deviceId) {
            // Delete by device ID
            const result = await db
                .delete(pushNotificationTokens)
                .where(
                    and(
                        eq(pushNotificationTokens.deviceId, deviceId),
                        eq(pushNotificationTokens.userId, userId)
                    )
                )
                .returning();
            deletedCount = result.length;
        }

        if (deletedCount === 0) {
            return NextResponse.json(
                { error: "Token not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Token removed successfully",
        });
    } catch (error) {
        console.error("Error removing push notification token:", error);
        return NextResponse.json(
            { error: "Failed to remove token" },
            { status: 500 }
        );
    }
}

