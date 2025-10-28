import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { users, organizationYears, userWrongQuestions, questions, lessonCategory } from "@/db/schemaSmarti";
import { and, eq, inArray, sql } from "drizzle-orm";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ organizationId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { organizationId: orgId } = await ctx.params;
        const url = new URL(_req.url);
        const organizationYearId = url.searchParams.get("organizationYearId");

        // Authorization: ensure user manages this org
        const currentUser = await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, userId),
        });
        if (!currentUser || !currentUser.managedOrganization?.includes(orgId)) {
            return new NextResponse("Access denied", { status: 403 });
        }

        // Resolve org years (optionally filtered)
        const orgYears = await db.query.organizationYears.findMany({
            where: (oy, { and, eq }) =>
                and(
                    eq(oy.organizationId, orgId),
                    organizationYearId ? eq(oy.id, organizationYearId) : sql`true`
                ),
        });

        const orgYearIds = orgYears.map((y) => y.id);
        if (orgYearIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Fetch users in these years
        const orgUsers = await db.query.users.findMany({
            where: (u, { inArray }) => inArray(u.organizationYearId, orgYearIds),
        });

        const userIds = orgUsers.map((u) => u.id);
        if (userIds.length === 0) {
            return NextResponse.json({ data: [] });
        }

        // Aggregate wrong questions by category and topic type
        // Join user_wrong_questions -> questions -> lesson_category to access categoryType and topicType
        const rows = await db
            .select({
                categoryId: questions.categoryId,
                categoryType: lessonCategory.categoryType,
                topicType: questions.topicType,
                count: sql<number>`COUNT(*)`,
            })
            .from(userWrongQuestions)
            .leftJoin(questions, eq(userWrongQuestions.questionId, questions.id))
            .leftJoin(lessonCategory, eq(questions.categoryId, lessonCategory.id))
            .where(inArray(userWrongQuestions.userId, userIds))
            .groupBy(questions.categoryId, lessonCategory.categoryType, questions.topicType);

        // Shape response
        const data = rows.map((r) => ({
            categoryId: r.categoryId,
            categoryType: r.categoryType ?? null,
            topicType: r.topicType ?? "UNKNOWN",
            wrongCount: Number(r.count) || 0,
        }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching mistakes analytics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


