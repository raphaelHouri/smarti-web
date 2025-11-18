import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { validateCoupon, getUserSavedCoupon, saveUserCoupon, clearUserCoupon, getCoupon } from "@/db/queries";

// GET - Get user's saved coupon
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupon = await getUserSavedCoupon(userId);
    return NextResponse.json({ coupon });
}

// POST - Validate and save coupon
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    const validation = await validateCoupon(code);

    if (!validation.valid || !validation.coupon) {
        return NextResponse.json({
            error: validation.error ?? "Invalid coupon",
            coupon: validation.coupon
        }, { status: 400 });
    }

    const result = await saveUserCoupon(userId, validation.coupon.id);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
        success: true,
        coupon: validation.coupon
    });
}

// DELETE - Clear user's saved coupon
export async function DELETE() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clearUserCoupon(userId);
    return NextResponse.json({ success: true });
}

