import db from "@/db/drizzle"
import { subscriptions } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ subscriptionId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { subscriptionId } = await params;
    const data = await db.query.subscriptions.findFirst({
        where: eq(subscriptions.id, subscriptionId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ subscriptionId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { subscriptionId } = await params;
    const body = await req.json();
    const data = await db.update(subscriptions).set({
        ...body
    }).where(
        eq(subscriptions.id, subscriptionId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ subscriptionId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { subscriptionId } = await params;
    const data = await db.delete(subscriptions).
        where(eq(subscriptions.id, subscriptionId)).returning()
    return NextResponse.json(data[0]);
}
