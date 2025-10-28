import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users, userLessonResults, organizationInfo, organizationYears } from "@/db/schemaSmarti";
import { auth } from "@clerk/nextjs/server";
import { desc, and, inArray, gte, lt, eq } from "drizzle-orm";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ organizationId: string }> }
) {
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

        const { organizationId } = await params;
        // Verify the user has access to this organization
        if (!currentUser.managedOrganization.includes(organizationId)) {
            return new NextResponse("Access denied", { status: 403 });
        }

        // Get organization years
        const orgYears = await db.query.organizationYears.findMany({
            where: (oy, { eq }) => eq(oy.organizationId, organizationId),
            orderBy: [desc(organizationYears.year)],
        });

        const orgYearIds = orgYears.map(y => y.id);

        // Get all users in this organization
        const orgUsers = orgYearIds.length > 0 ? await db.query.users.findMany({
            where: (u, { inArray }) => inArray(u.organizationYearId, orgYearIds),
        }) : [];

        // Calculate current month
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        // Get performance metrics for each user
        const usersWithMetrics = await Promise.all(
            orgUsers.map(async (user) => {
                const userIds = [user.id];

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
                    (sum, ulr) => sum + (ulr.totalQuestions || 0),
                    0
                );
                const correctAnswers = userLessonData.reduce(
                    (sum, ulr) => sum + (ulr.rightQuestions || 0),
                    0
                );
                const averageScore = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

                return {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    experience: user.experience,
                    geniusScore: user.geniusScore,
                    totalLessons,
                    totalQuestions,
                    correctAnswers,
                    averageScore: Math.round(averageScore * 10) / 10,
                };
            })
        );

        return NextResponse.json({
            users: usersWithMetrics,
            totalUsers: usersWithMetrics.length,
        });
    } catch (error) {
        console.error("Error fetching organization users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
