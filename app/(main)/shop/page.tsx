import PurchasePageShop from "./_components/PurchasePageShop";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "רכשו חוברות תרגול וסימולציות מודפסות להכנה יעילה למבחני מחוננים.",
    keywords: ["חוברות מחוננים", "סימולציות מודפסות", "תרגול בבית"],
});

export default function ShopPage() {
    return <PurchasePageShop />;
}
