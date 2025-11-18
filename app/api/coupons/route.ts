import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { coupons } from "@/db/schemaSmarti";
import { IsAdmin } from "@/lib/admin";
import { sanitizeDates } from "@/lib/api/sanitize";
import crypto from "crypto";

export async function GET() {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }
    const data = await db.query.coupons.findMany();
    // Transform type to couponType for react-admin
    const transformedData = data.map(coupon => {
        const { type, ...rest } = coupon;
        return {
            ...rest,
            couponType: type,
        };
    });
    return NextResponse.json(transformedData);
}

export async function POST(req: Request) {
    if (!IsAdmin()) {
        return new NextResponse("UnAuthorized", { status: 401 })
    }

    try {
        const body = await req.json();
        const insertPayload = sanitizeDates(body);

        // Always generate UUID for id
        insertPayload.id = crypto.randomUUID();

        // Transform couponType to type for database schema
        if ('couponType' in insertPayload) {
            insertPayload.type = insertPayload.couponType;
            delete insertPayload.couponType;
        }

        // Validate required fields with better checks
        if (!insertPayload.code || typeof insertPayload.code !== 'string' || insertPayload.code.trim() === '') {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }
        if (!insertPayload.planId || insertPayload.planId === '' || insertPayload.planId === null) {
            return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
        }
        if (!insertPayload.organizationYearId || insertPayload.organizationYearId === '' || insertPayload.organizationYearId === null) {
            return NextResponse.json({ error: "Organization Year ID is required" }, { status: 400 });
        }
        if (!insertPayload.value || typeof insertPayload.value !== 'number') {
            return NextResponse.json({ error: "Value is required and must be a number" }, { status: 400 });
        }
        if (!insertPayload.validFrom) {
            return NextResponse.json({ error: "Valid From date is required" }, { status: 400 });
        }
        if (!insertPayload.validUntil) {
            return NextResponse.json({ error: "Valid Until date is required" }, { status: 400 });
        }
        if (typeof insertPayload.maxUses !== 'number') {
            return NextResponse.json({ error: "Max Uses is required and must be a number" }, { status: 400 });
        }

        const data = await db.insert(coupons).values(insertPayload).returning()

        // Transform type to couponType for response
        const transformed = {
            ...data[0],
            couponType: data[0].type,
        };
        delete (transformed as any).type;

        return NextResponse.json(transformed);
    } catch (error: any) {
        console.error("Error creating coupon:", error);
        return NextResponse.json({
            error: error.message || "Failed to create coupon",
            details: error.detail || error.cause?.detail
        }, { status: 500 });
    }
}
