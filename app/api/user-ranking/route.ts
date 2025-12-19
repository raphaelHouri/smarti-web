import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserSystemStep } from "@/db/queries";
import { db } from "@/db";
import { userSystemStats, users } from "@/db/schemaSmarti";
import { eq, and, or, gt, lt, desc, asc } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userSystemStep = await getUserSystemStep(userId);

        // Get user's current stats
        const userStats = await db.query.userSystemStats.findFirst({
            where: and(
                eq(userSystemStats.userId, userId),
                eq(userSystemStats.systemStep, userSystemStep)
            ),
        });

        if (!userStats) {
            return NextResponse.json({
                userRank: null,
                totalUsers: 0,
            });
        }

        // Calculate user's rank
        const [{ count: higherCount }] = await db
            .select({
                count: sql<number>`cast(count(*) as int)`,
            })
            .from(userSystemStats)
            .where(
                and(
                    eq(userSystemStats.systemStep, userSystemStep),
                    or(
                        gt(userSystemStats.experience, userStats.experience),
                        and(
                            eq(userSystemStats.experience, userStats.experience),
                            lt(userSystemStats.userId, userId),
                        ),
                    ),
                ),
            );

        const userRank = higherCount + 1;

        // Get total users count
        const [{ count: totalUsers }] = await db
            .select({
                count: sql<number>`cast(count(*) as int)`,
            })
            .from(userSystemStats)
            .where(eq(userSystemStats.systemStep, userSystemStep));

        return NextResponse.json({
            userRank,
            totalUsers,
        });
    } catch (error) {
        console.error("Error fetching user ranking:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

