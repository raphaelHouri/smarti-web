import db from "@/db/drizzle"
import { userLessonResults } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: { userLessonResultId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const data = await db.query.userLessonResults.findFirst({
        where: eq(userLessonResults.id, params.userLessonResultId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: { userLessonResultId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const body = await req.json();
    const data = await db.update(userLessonResults).set({
        ...body
    }).where(
        eq(userLessonResults.id, params.userLessonResultId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: { userLessonResultId: string } },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const data = await db.delete(userLessonResults).
        where(eq(userLessonResults.id, params.userLessonResultId)).returning()
    return NextResponse.json(data[0]);
}
