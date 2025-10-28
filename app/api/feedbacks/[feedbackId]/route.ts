import db from "@/db/drizzle"
import { feedbacks } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ feedbackId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { feedbackId } = await params;
    const data = await db.query.feedbacks.findFirst({
        where: eq(feedbacks.id, feedbackId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ feedbackId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { feedbackId } = await params;
    const body = await req.json();
    const data = await db.update(feedbacks).set({
        ...body
    }).where(
        eq(feedbacks.id, feedbackId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ feedbackId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { feedbackId } = await params;
    const data = await db.delete(feedbacks).
        where(eq(feedbacks.id, feedbackId)).returning()
    return NextResponse.json(data[0]);
}
