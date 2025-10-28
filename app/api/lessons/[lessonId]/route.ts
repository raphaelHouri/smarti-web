import db from "@/db/drizzle"
import { lessons } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { lessonId } = await params;
    const data = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { lessonId } = await params;
    const body = await req.json();
    const data = await db.update(lessons).set({
        ...body
    }).where(
        eq(lessons.id, lessonId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { lessonId } = await params;
    const data = await db.delete(lessons).
        where(eq(lessons.id, lessonId)).returning()
    return NextResponse.json(data[0]);
}
