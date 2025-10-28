import db from "@/db/drizzle"
import { organizationYears } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ organizationYearId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { organizationYearId } = await params;
    const data = await db.query.organizationYears.findFirst({
        where: eq(organizationYears.id, organizationYearId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ organizationYearId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { organizationYearId } = await params;
    const body = await req.json();
    const data = await db.update(organizationYears).set({
        ...body
    }).where(
        eq(organizationYears.id, organizationYearId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ organizationYearId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { organizationYearId } = await params;
    const data = await db.delete(organizationYears).
        where(eq(organizationYears.id, organizationYearId)).returning()
    return NextResponse.json(data[0]);
}
