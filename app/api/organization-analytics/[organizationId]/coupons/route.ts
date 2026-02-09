import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { auth } from "@clerk/nextjs/server";
import { getCouponSummaryByOrganizationYear } from "@/db/queries";

export async function GET(
    req: Request,
    { params }: { params: { organizationId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get the current user to check their managed organizations
        const currentUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
        });

        if (!currentUser || !currentUser.managedOrganization || currentUser.managedOrganization.length === 0) {
            return new NextResponse("No managed organizations found", { status: 403 });
        }

        // Verify the user manages this organization
        if (!currentUser.managedOrganization.includes(params.organizationId)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Get organizationYearId from query params
        const url = new URL(req.url);
        const organizationYearId = url.searchParams.get('organizationYearId');

        if (!organizationYearId) {
            return new NextResponse("organizationYearId is required", { status: 400 });
        }

        // Fetch coupon summary
        const couponSummary = await getCouponSummaryByOrganizationYear(organizationYearId);

        if (!couponSummary) {
            return new NextResponse("No coupon found for this organization year", { status: 404 });
        }

        return NextResponse.json(couponSummary);
    } catch (error) {
        console.error("Error fetching coupon summary:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
