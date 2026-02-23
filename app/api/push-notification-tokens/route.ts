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

        // Validate token format - must be a valid Expo push token
        if (
            typeof token !== "string" ||
            !token.startsWith("ExponentPushToken[") ||
            !token.endsWith("]")
        ) {
            return NextResponse.json(
                { error: `Invalid token format. Expected ExponentPushToken[...], got: ${typeof token === 'string' ? token.substring(0, 30) : typeof token}` },
                { status: 400 }
            );
        }

        // 1. Look for existing record by deviceId
        let existingToken = await db.query.pushNotificationTokens.findFirst({
            where: eq(pushNotificationTokens.deviceId, deviceId),
        });

        // 2. If not found by deviceId, check by token value (Expo tokens are unique per device)
        if (!existingToken) {
            existingToken = await db.query.pushNotificationTokens.findFirst({
                where: eq(pushNotificationTokens.token, token),
            });
        }

        if (existingToken) {
            // Check if anything actually changed — if not, don't touch the record
            const isSameToken = existingToken.token === token;
            const isSameUserId = existingToken.userId === (userId || null);
            const isSameDeviceId = existingToken.deviceId === deviceId;
            const isActive = existingToken.isActive === true;

            if (isSameToken && isSameUserId && isSameDeviceId && isActive) {
                // Nothing changed — return existing record without updating
                return NextResponse.json({
                    success: true,
                    token: existingToken,
                    message: "Token already exists, no changes needed",
                    changed: false,
                });
            }

            // Something changed — update only what's needed
            const updateData: any = {
                token,
                deviceId, // Update deviceId in case we found by token value
                deviceType,
                deviceName: deviceName || null,
                deviceModel: deviceModel || null,
                isActive: true,
                updatedAt: new Date(),
            };

            // Only update userId if provided (don't overwrite existing userId with null)
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
                message: "Token updated successfully",
                changed: true,
            });
        } else {
            // No existing record — upsert to handle race conditions safely
            // If a concurrent request inserts first, the unique constraint on
            // token will trigger the onConflict update instead of failing.
            const upserted = await db
                .insert(pushNotificationTokens)
                .values({
                    userId: userId || null,
                    token,
                    deviceId,
                    deviceType,
                    deviceName: deviceName || null,
                    deviceModel: deviceModel || null,
                    isActive: true,
                })
                .onConflictDoUpdate({
                    target: pushNotificationTokens.token,
                    set: {
                        deviceId,
                        deviceType,
                        deviceName: deviceName || null,
                        deviceModel: deviceModel || null,
                        isActive: true,
                        updatedAt: new Date(),
                        ...(userId ? { userId } : {}),
                    },
                })
                .returning();

            return NextResponse.json({
                success: true,
                token: upserted[0],
                message: "Token registered successfully",
                changed: true,
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

        // Validate token format - must be a valid Expo push token
        if (
            typeof token !== "string" ||
            !token.startsWith("ExponentPushToken[") ||
            !token.endsWith("]")
        ) {
            return NextResponse.json(
                { error: `Invalid token format. Expected ExponentPushToken[...], got: ${typeof token === 'string' ? token.substring(0, 30) : typeof token}` },
                { status: 400 }
            );
        }

        // Find token by deviceId first, then by token value
        let existingToken = await db.query.pushNotificationTokens.findFirst({
            where: eq(pushNotificationTokens.deviceId, deviceId),
        });

        if (!existingToken) {
            existingToken = await db.query.pushNotificationTokens.findFirst({
                where: eq(pushNotificationTokens.token, token),
            });
        }

        if (existingToken) {
            // Check if anything actually changed
            const isSameToken = existingToken.token === token;
            const isSameUserId = existingToken.userId === userId;
            const isActive = existingToken.isActive === true;

            if (isSameToken && isSameUserId && isActive) {
                return NextResponse.json({
                    success: true,
                    token: existingToken,
                    message: "Token already exists, no changes needed",
                    changed: false,
                });
            }

            // Update only what changed
            const updated = await db
                .update(pushNotificationTokens)
                .set({
                    userId,
                    token,
                    deviceId,
                    isActive: true,
                    updatedAt: new Date(),
                })
                .where(eq(pushNotificationTokens.id, existingToken.id))
                .returning();

            return NextResponse.json({
                success: true,
                token: updated[0],
                message: "Token updated with userId successfully",
                changed: true,
            });
        } else {
            // Token doesn't exist — upsert to handle race conditions safely
            const upserted = await db
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
                .onConflictDoUpdate({
                    target: pushNotificationTokens.token,
                    set: {
                        userId,
                        deviceId,
                        isActive: true,
                        updatedAt: new Date(),
                    },
                })
                .returning();

            return NextResponse.json({
                success: true,
                token: upserted[0],
                message: "Token registered successfully",
                changed: true,
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
// Supports both Clerk auth (web) and deviceId-based auth (mobile app)
export async function DELETE(req: Request) {
    let userId: string | null = null;

    // Try to get userId from Clerk auth first
    try {
        const authResult = await auth();
        userId = authResult.userId || null;
    } catch {
        // Auth not available (mobile app request)
    }

    try {
        const body = await req.json();
        const { deviceId, tokenId } = body;

        // If no userId from auth, try from body (for mobile app)
        if (!userId) {
            userId = body.userId || null;
        }

        // Either deviceId or tokenId must be provided
        if (!deviceId && !tokenId) {
            return NextResponse.json(
                { error: "Either deviceId or tokenId must be provided" },
                { status: 400 }
            );
        }

        let deletedCount = 0;

        if (tokenId && userId) {
            // Delete by token ID (requires userId for security)
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
            // Delete by device ID — deviceId is unique per device so it's safe
            // This allows the mobile app to delete its own token without Clerk auth
            const result = await db
                .delete(pushNotificationTokens)
                .where(
                    eq(pushNotificationTokens.deviceId, deviceId)
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
            deletedCount,
        });
    } catch (error) {
        console.error("Error removing push notification token:", error);
        return NextResponse.json(
            { error: "Failed to remove token" },
            { status: 500 }
        );
    }
}

