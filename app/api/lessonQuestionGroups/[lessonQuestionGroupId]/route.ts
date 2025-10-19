import db from "@/db/drizzle"
import { lessonQuestionGroups } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: { lessonQuestionGroupId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const data = await db.query.lessonQuestionGroups.findFirst({
        where: eq(lessonQuestionGroups.id, params.lessonQuestionGroupId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: { lessonQuestionGroupId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const body = await req.json();
    const data = await db.update(lessonQuestionGroups).set({
        ...body
    }).where(
        eq(lessonQuestionGroups.id, params.lessonQuestionGroupId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: { lessonQuestionGroupId: string } },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const data = await db.delete(lessonQuestionGroups).
        where(eq(lessonQuestionGroups.id, params.lessonQuestionGroupId)).returning()
    return NextResponse.json(data[0]);
}
