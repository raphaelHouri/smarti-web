import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { auth } from "@clerk/nextjs/server";
import { users, userWrongQuestions, questions, lessonCategory, organizationYears } from "@/db/schemaSmarti";
import { eq, sql } from "drizzle-orm";

export async function GET(
    req: Request,
    ctx: { params: Promise<{ organizationId: string; userId: string }> }
) {
    try {
        const { organizationId: orgId, userId: targetUserId } = await ctx.params;
        const { userId: clerkUserId } = await auth();
        if (!clerkUserId) return new NextResponse("Unauthorized", { status: 401 });

        const url = new URL(req.url);
        const organizationYearId = url.searchParams.get("organizationYearId");

        // Authorization: ensure requester manages this organization
        const currentUser = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, clerkUserId) });
        if (!currentUser || !currentUser.managedOrganization?.includes(orgId)) {
            return new NextResponse("Access denied", { status: 403 });
        }

        // Ensure target user belongs to this organization (via org year)
        const target = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, targetUserId) });
        if (!target) return NextResponse.json({ data: [] });

        const orgYear = target.organizationYearId
            ? await db.query.organizationYears.findFirst({ where: (oy, { eq }) => eq(oy.id, target.organizationYearId!) })
            : null;
        if (!orgYear || orgYear.organizationId !== orgId) return NextResponse.json({ data: [] });

        // Optional year filter: if provided and doesn't match the target's year, short-circuit
        if (organizationYearId && organizationYearId !== target.organizationYearId) {
            return NextResponse.json({ data: [] });
        }

        // Aggregate wrong questions for this user
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
            .where(eq(userWrongQuestions.userId, targetUserId))
            .groupBy(questions.categoryId, lessonCategory.categoryType, questions.topicType);

        const data = rows.map((r) => ({
            categoryId: r.categoryId,
            categoryType: r.categoryType ?? null,
            topicType: r.topicType ?? "UNKNOWN",
            wrongCount: Number(r.count) || 0,
        }));

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Error fetching user mistakes:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


