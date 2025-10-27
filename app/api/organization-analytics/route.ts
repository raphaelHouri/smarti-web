import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users, userLessonResults, organizationInfo, organizationYears } from "@/db/schemaSmarti";
import { auth } from "@clerk/nextjs/server";
import { desc, and, inArray, gte, lt } from "drizzle-orm";

/**
 * Properly parameterizes user_id for ANY inside a raw query.
 * The trick is to pass a Postgres array to the placeholder, *not* expand to multiple $n parameters.
 * So just a single $1, and pass a JS array -- pg will turn it into a Postgres array.
 */
export async function GET(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get the current user to check their managed organizations
        const currentUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
        });

        if (!currentUser || !currentUser.managedOrganization || currentUser.managedOrganization.length === 0) {
            return new NextResponse("No managed organizations found", { status: 403 });
        }

        // If user has managed organizations, they have admin-level access to those organizations
        // Fetch only their managed organizations
        const managedOrgIds = currentUser.managedOrganization || [];
        const organizationData = await db.query.organizationInfo.findMany({
            where: (org, { inArray }) => inArray(org.id, managedOrgIds),
        });

        // Fetch analytics for each organization
        const analyticsPromises = organizationData.map(async (org) => {
            // Get organization years
            const orgYears = await db.query.organizationYears.findMany({
                where: (oy, { eq }) => eq(oy.organizationId, org.id),
                orderBy: [desc(organizationYears.year)],
            });

            // Get users in this organization
            const orgYearIds = orgYears.map(y => y.id);

            // Only query if we have org years
            let orgUsers: typeof users.$inferSelect[] = [];
            if (orgYearIds.length > 0) {
                orgUsers = await db.query.users.findMany({
                    where: (u, { inArray }) => inArray(u.organizationYearId, orgYearIds),
                });
            }

            // Calculate metrics for each year
            const yearAnalytics = await Promise.all(
                orgYears.map(async (year) => {
                    const yearUsers = orgUsers.filter(u => u.organizationYearId === year.id);
                    const userIds = yearUsers.map(u => u.id);

                    let performanceData = {
                        totalLessons: 0,
                        totalQuestions: 0,
                        correctAnswers: 0,
                        averageScore: 0,
                        totalUsers: yearUsers.length,
                        activeUsers: 0,
                    };

                    if (userIds.length > 0) {
                        try {
                            const now = new Date();
                            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

                            const userLessonData = await db.query.userLessonResults.findMany({
                                where: (uls, { and, inArray, gte, lt }) =>
                                    and(
                                        inArray(uls.userId, userIds),
                                        gte(uls.createdAt, monthStart),
                                        lt(uls.createdAt, monthEnd)
                                    ),
                            });

                            const totalLessons = userLessonData.length;
                            const totalQuestions = userLessonData.reduce(
                                (sum: number, ulr: typeof userLessonResults.$inferSelect) => sum + (ulr.totalQuestions || 0),
                                0
                            );
                            const correctAnswers = userLessonData.reduce(
                                (sum: number, ulr: typeof userLessonResults.$inferSelect) => sum + (ulr.rightQuestions || 0),
                                0
                            );
                            const activeUserSet = new Set(userLessonData.map((ulr: typeof userLessonResults.$inferSelect) => ulr.userId));
                            const activeUsers = activeUserSet.size;

                            // Use the calculated data
                            performanceData.totalLessons = totalLessons;
                            performanceData.totalQuestions = totalQuestions;
                            performanceData.correctAnswers = correctAnswers;
                            performanceData.activeUsers = activeUsers;
                            performanceData.averageScore =
                                totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
                        } catch (error) {
                            console.error(`Error fetching analytics for year ${year.year}:`, error);
                        }
                    }

                    return {
                        yearId: year.id,
                        year: year.year,
                        ...performanceData,
                    };
                })
            );

            // Calculate overall stats
            const totalUsers = orgUsers.length;
            const totalExperience = orgUsers.reduce((sum, u) => sum + (u.experience || 0), 0);
            const totalGeniusScore = orgUsers.reduce((sum, u) => sum + (u.geniusScore || 0), 0);
            const averageExperience = totalUsers > 0 ? totalExperience / totalUsers : 0;
            const averageGeniusScore = totalUsers > 0 ? totalGeniusScore / totalUsers : 0;

            return {
                organizationId: org.id,
                organizationName: org.name,
                contactEmail: org.contactEmail,
                city: org.city,
                totalUsers,
                averageExperience: Math.round(averageExperience),
                averageGeniusScore: Math.round(averageGeniusScore),
                years: yearAnalytics,
            };
        });

        const analytics = await Promise.all(analyticsPromises);

        // Return analytics with a summary of managed organizations
        return NextResponse.json({
            managedOrganizations: organizationData.map(org => ({
                id: org.id,
                name: org.name,
                contactEmail: org.contactEmail,
                city: org.city,
            })),
            analytics
        });
    } catch (error) {
        console.error("Error fetching organization analytics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
