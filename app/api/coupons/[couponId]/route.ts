import db from "@/db/drizzle"
import { coupons } from "@/db/schemaSmarti"
import { IsAdmin } from "@/lib/admin"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { sanitizeDates } from "@/lib/api/sanitize"


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ couponId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }

    const { couponId } = await params;
    const data = await db.query.coupons.findFirst({
        where: eq(coupons.id, couponId)
    })
    return NextResponse.json(data);
}

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ couponId: string }> }
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { couponId } = await params;
    const body = await req.json();
    const updatePayload = sanitizeDates(body);
    const data = await db.update(coupons).set(updatePayload).where(
        eq(coupons.id, couponId)
    ).returning()
    return NextResponse.json(data[0]);
}

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ couponId: string }> },
) => {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 403 })
    }
    const { couponId } = await params;
    const data = await db.delete(coupons).
        where(eq(coupons.id, couponId)).returning()
    return NextResponse.json(data[0]);
}
