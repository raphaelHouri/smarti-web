import db from "@/db/drizzle"
import { plans } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ planId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { planId } = await params;
    const data = await db.query.plans.findFirst({
        where: eq(plans.id, planId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ planId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { planId } = await params;
    const body = await req.json();
    const data = await db.update(plans).set({
        ...body
    }).where(
        eq(plans.id, planId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ planId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { planId } = await params;
    const data = await db.delete(plans).
        where(eq(plans.id, planId)).returning()
    return NextResponse.json(data[0]);
}
