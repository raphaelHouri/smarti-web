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
        const sanitized = sanitizeDates(body);

        // Validate required fields first
        if (!sanitized.code || typeof sanitized.code !== 'string' || sanitized.code.trim() === '') {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }
        if (!sanitized.planId || sanitized.planId === '' || sanitized.planId === null) {
            return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
        }

        if (!sanitized.value || typeof sanitized.value !== 'number') {
            return NextResponse.json({ error: "Value is required and must be a number" }, { status: 400 });
        }
        if (!sanitized.validFrom) {
            return NextResponse.json({ error: "Valid From date is required" }, { status: 400 });
        }
        if (!sanitized.validUntil) {
            return NextResponse.json({ error: "Valid Until date is required" }, { status: 400 });
        }
        if (typeof sanitized.maxUses !== 'number') {
            return NextResponse.json({ error: "Max Uses is required and must be a number" }, { status: 400 });
        }

        // Determine coupon type
        const couponType = sanitized.couponType || sanitized.type || 'percentage';

        // Explicitly construct the values object with all required fields
        const values = {
            id: crypto.randomUUID(),
            code: sanitized.code.trim(),
            type: couponType as 'percentage' | 'fixed',
            value: sanitized.value,
            validFrom: sanitized.validFrom,
            validUntil: sanitized.validUntil,
            isActive: sanitized.isActive !== undefined ? sanitized.isActive : true,
            maxUses: sanitized.maxUses,
            uses: 0, // Initialize uses to 0
            planId: sanitized.planId,
            organizationYearId: sanitized.organizationYearId,
        };

        const data = await db.insert(coupons).values(values).returning()

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
