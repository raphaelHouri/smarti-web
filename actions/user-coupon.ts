"use server";

import { auth } from "@clerk/nextjs/server";
import { validateCoupon, getUserSavedCoupon, saveUserCoupon, clearUserCoupon, getUserSystemStep } from "@/db/queries";
import { revalidatePath } from "next/cache";

export async function getUserCoupon() {
    const { userId } = await auth();
    if (!userId) {
        return { coupon: null, error: "Unauthorized" };
    }

    try {
        const systemStep = await getUserSystemStep(userId);
        const coupon = await getUserSavedCoupon(userId, systemStep);
        return { coupon, error: null };
    } catch (error) {
        console.error("Failed to get user coupon:", error);
        return { coupon: null, error: "Failed to load coupon" };
    }
}

export async function validateAndSaveCoupon(code: string) {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized", coupon: null };
    }

    if (!code || typeof code !== "string") {
        return { success: false, error: "Invalid coupon code", coupon: null };
    }

    try {
        const systemStep = await getUserSystemStep(userId);
        const validation = await validateCoupon(code.trim());

        if (!validation.valid || !validation.coupon) {
            return {
                success: false,
                error: validation.error ?? "Invalid coupon",
                coupon: validation.coupon
            };
        }

        const result = await saveUserCoupon(userId, validation.coupon.id, systemStep);

        if (!result.success) {
            return { success: false, error: result.error ?? "Failed to save coupon", coupon: validation.coupon };
        }
        // Revalidate all shop pages to reflect coupon changes
        revalidatePath("/shop/system");
        revalidatePath("/shop/book");
        revalidatePath("/shop");
        return { success: true, error: null, coupon: validation.coupon };
    } catch (error) {
        console.error("Failed to validate and save coupon:", error);
        return { success: false, error: "Failed to process coupon", coupon: null };
    }
}

export async function removeUserCoupon() {
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const systemStep = await getUserSystemStep(userId);
        await clearUserCoupon(userId, systemStep);
        // Revalidate all shop pages to reflect coupon removal
        revalidatePath("/shop/system");
        revalidatePath("/shop/book");
        revalidatePath("/shop");
        return { success: true, error: null };
    } catch (error) {
        console.error("Failed to remove coupon:", error);
        return { success: false, error: "Failed to remove coupon" };
    }
}

export async function validateCouponCode(code: string) {
    if (!code || typeof code !== "string") {
        return { valid: false, coupon: null, error: "Invalid coupon code" };
    }

    try {
        const validation = await validateCoupon(code.trim());
        return validation;
    } catch (error) {
        console.error("Failed to validate coupon:", error);
        return { valid: false, coupon: null, error: "Failed to validate coupon" };
    }
}

