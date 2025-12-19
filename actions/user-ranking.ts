"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserSystemStep } from "@/db/queries";
import db from "@/db/drizzle";
import { userSystemStats } from "@/db/schemaSmarti";
import { eq, and, or, gt, lt } from "drizzle-orm";
import { sql } from "drizzle-orm";

export async function getUserRanking() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                userRank: null,
                totalUsers: 0,
            };
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
            return {
                userRank: null,
                totalUsers: 0,
            };
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

        return {
            userRank,
            totalUsers,
        };
    } catch (error) {
        console.error("Error fetching user ranking:", error);
        return {
            userRank: null,
            totalUsers: 0,
        };
    }
}

