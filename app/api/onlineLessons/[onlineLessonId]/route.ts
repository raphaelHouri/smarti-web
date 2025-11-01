import db from "@/db/drizzle";
import { onlineLessons } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ onlineLessonId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { onlineLessonId } = await params;
    const data = await db.query.onlineLessons.findFirst({
        where: eq(onlineLessons.id, onlineLessonId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ onlineLessonId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { onlineLessonId } = await params;
    const body = await req.json();
    const updatePayload: any = { ...body };
    if (typeof updatePayload.createdAt === "string") {
        const d = new Date(updatePayload.createdAt);
        updatePayload.createdAt = isNaN(d.getTime()) ? undefined : d;
    }
    const data = await db.update(onlineLessons).set(updatePayload).where(
        eq(onlineLessons.id, onlineLessonId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ onlineLessonId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { onlineLessonId } = await params;
    const data = await db.delete(onlineLessons).
        where(eq(onlineLessons.id, onlineLessonId)).returning()
    return NextResponse.json(data[0]);
}


