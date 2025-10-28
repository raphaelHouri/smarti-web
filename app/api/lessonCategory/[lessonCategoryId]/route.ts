import db from "@/db/drizzle"
import { lessonCategory } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ lessonCategoryId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { lessonCategoryId } = await params;
    const data = await db.query.lessonCategory.findFirst({
        where: eq(lessonCategory.id, lessonCategoryId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ lessonCategoryId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { lessonCategoryId } = await params;
    const body = await req.json();
    const data = await db.update(lessonCategory).set({
        ...body
    }).where(
        eq(lessonCategory.id, lessonCategoryId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ lessonCategoryId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { lessonCategoryId } = await params;
    const data = await db.delete(lessonCategory).
        where(eq(lessonCategory.id, lessonCategoryId)).returning()
    return NextResponse.json(data[0]);
}
