import PurchasePageShop from "./_components/PurchasePageShop";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getPlansForShop } from "@/db/queries";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "רכשו חוברות תרגול וסימולציות מודפסות להכנה יעילה למבחני מחוננים.",
    keywords: ["חוברות מחוננים", "סימולציות מודפסות", "תרגול בבית"],
});

export default async function ShopPage() {
    const plansByType = await getPlansForShop();
    return <PurchasePageShop plansByType={plansByType} />;
}
