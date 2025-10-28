import db from "@/db/drizzle"
import { userSettings } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ userSettingId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { userSettingId } = await params;
    const data = await db.query.userSettings.findFirst({
        where: eq(userSettings.id, userSettingId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ userSettingId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { userSettingId } = await params;
    const body = await req.json();
    const data = await db.update(userSettings).set({
        ...body
    }).where(
        eq(userSettings.id, userSettingId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ userSettingId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { userSettingId } = await params;
    const data = await db.delete(userSettings).
        where(eq(userSettings.id, userSettingId)).returning()
    return NextResponse.json(data[0]);
}
