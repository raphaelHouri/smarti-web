import { NextResponse } from "next/server";
import { validateCoupon } from "@/db/queries";

// POST - Validate coupon code (public endpoint, no auth required)
export async function POST(req: Request) {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const validation = await validateCoupon(code);

    return NextResponse.json({
        valid: validation.valid,
        coupon: validation.coupon,
        error: validation.error
    });
}

