import { NextResponse } from "next/server";
import { validateCoupon } from "@/db/queries";
import { auth } from "@clerk/nextjs/server";
import { getUserSystemStep } from "@/db/queries";

// POST - Validate coupon code (public endpoint, no auth required, but validates systemStep if user is authenticated)
export async function POST(req: Request) {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
        return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    // Try to get systemStep if user is authenticated
    let systemStep: number | undefined;
    try {
        const { userId } = await auth();
        if (userId) {
            systemStep = await getUserSystemStep(userId);
        }
    } catch (error) {
        // If auth fails, continue without systemStep validation
    }

    const validation = await validateCoupon(code, systemStep);

    return NextResponse.json({
        valid: validation.valid,
        coupon: validation.coupon,
        error: validation.error
    });
}

