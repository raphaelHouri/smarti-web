"use server";

import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";
import { getCouponSummaryByOrganizationYear, type CouponSummary } from "@/db/queries";

export async function getCouponSummary(
    organizationId: string,
    organizationYearId: string
): Promise<{ couponSummary: CouponSummary | null; error: string | null }> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { couponSummary: null, error: "Unauthorized" };
        }

        // Get the current user to check their managed organizations
        const currentUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!currentUser || !currentUser.managedOrganization || currentUser.managedOrganization.length === 0) {
            return { couponSummary: null, error: "No managed organizations found" };
        }

        // Verify the user manages this organization
        if (!currentUser.managedOrganization.includes(organizationId)) {
            return { couponSummary: null, error: "Forbidden" };
        }

        // Fetch coupon summary
        const couponSummary = await getCouponSummaryByOrganizationYear(organizationYearId);

        if (!couponSummary) {
            return { couponSummary: null, error: "No coupon found for this organization year" };
        }

        return { couponSummary, error: null };
    } catch (error) {
        console.error("Error fetching coupon summary:", error);
        return { couponSummary: null, error: "Internal Server Error" };
    }
}
