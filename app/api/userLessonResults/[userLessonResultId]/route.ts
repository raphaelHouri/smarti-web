import db from "@/db/drizzle"
import { userLessonResults } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { sanitizeDates } from "@/lib/api/sanitize"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ userLessonResultId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { userLessonResultId } = await params;
    const data = await db.query.userLessonResults.findFirst({
        where: eq(userLessonResults.id, userLessonResultId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ userLessonResultId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { userLessonResultId } = await params;
    const body = await req.json();
    const updatePayload = sanitizeDates(body);
    const data = await db.update(userLessonResults).set(updatePayload).where(
        eq(userLessonResults.id, userLessonResultId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ userLessonResultId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { userLessonResultId } = await params;
    const data = await db.delete(userLessonResults).
        where(eq(userLessonResults.id, userLessonResultId)).returning()
    return NextResponse.json(data[0]);
}
