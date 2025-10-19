import db from "@/db/drizzle"
import { users } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: { userId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const data = await db.query.users.findFirst({
        where: eq(users.id, params.userId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: { userId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const body = await req.json();
    const data = await db.update(users).set({
        ...body
    }).where(
        eq(users.id, params.userId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: { userId: string } },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const data = await db.delete(users).
        where(eq(users.id, params.userId)).returning()
    return NextResponse.json(data[0]);
}
