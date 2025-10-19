import db from "@/db/drizzle"
import { userWrongQuestions } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: { userWrongQuestionId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const data = await db.query.userWrongQuestions.findFirst({
        where: eq(userWrongQuestions.id, params.userWrongQuestionId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: { userWrongQuestionId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const body = await req.json();
    const data = await db.update(userWrongQuestions).set({
        ...body
    }).where(
        eq(userWrongQuestions.id, params.userWrongQuestionId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: { userWrongQuestionId: string } },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const data = await db.delete(userWrongQuestions).
        where(eq(userWrongQuestions.id, params.userWrongQuestionId)).returning()
    return NextResponse.json(data[0]);
}
