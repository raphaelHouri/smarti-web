import PurchasePageShop from "../_components/PurchasePageShop";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getOrCreateUserFromGuest, getPlansForShop, type PackageType } from "@/db/queries";
import { notFound } from "next/navigation";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "רכשו חוברות תרגול וסימולציות מודפסות להכנה יעילה למבחני מחוננים.",
    keywords: ["חוברות מחוננים", "סימולציות מודפסות", "תרגול בבית"],
});

// Force this route to render dynamically so we can safely call the database at request-time
export const dynamic = "force-dynamic";

type ShopPackageTypePageProps = {
    params: Promise<{ packageType: string }>;
};

export default async function ShopPackageTypePage({ params }: ShopPackageTypePageProps) {
    const { packageType } = await params;
    const userData = getOrCreateUserFromGuest(undefined, false);
    const [user] = await Promise.all([userData]);

    // Validate packageType
    if (packageType !== "system" && packageType !== "book") {
        notFound();
    }

    const packageTypeTyped: PackageType = packageType;
    const plansByType = await getPlansForShop();

    // Extract user info for BookPurchaseModal
    const userInfo = user ? {
        name: user.name,
        email: user.email
    } : {
        name: null,
        email: null
    };

    return <PurchasePageShop plansByType={plansByType} packageType={packageTypeTyped} userInfo={userInfo} />;
}

