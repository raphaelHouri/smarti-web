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

    if (!data) {
        return NextResponse.json(null);
    }

    // Transform type to couponType for react-admin
    const transformed = {
        ...data,
        couponType: data.type,
    };
    delete (transformed as any).type;

    return NextResponse.json(transformed);
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

    // Transform couponType to type for database schema
    if ('couponType' in updatePayload) {
        updatePayload.type = updatePayload.couponType;
        delete updatePayload.couponType;
    }

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
