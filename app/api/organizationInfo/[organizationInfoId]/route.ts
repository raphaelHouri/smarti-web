import db from "@/db/drizzle"
import { organizationInfo } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: { organizationInfoId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const data = await db.query.organizationInfo.findFirst({
        where: eq(organizationInfo.id, params.organizationInfoId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: { organizationInfoId: string } }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const body = await req.json();
    const data = await db.update(organizationInfo).set({
        ...body
    }).where(
        eq(organizationInfo.id, params.organizationInfoId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: { organizationInfoId: string } },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const data = await db.delete(organizationInfo).
        where(eq(organizationInfo.id, params.organizationInfoId)).returning()
    return NextResponse.json(data[0]);
}
