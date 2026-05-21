import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import {
  getOrCreateUserFromGuest,
  getPlansForShop,
  type ShopPlansByType,
} from "@/db/queries";
import MobilePricingClient from "./_components/MobilePricingClient";

export const metadata: Metadata = {
  ...buildMetadata({
    title: "סמארטי | רכישה (מובייל)",
    description: "בחרו מסלול מערכת למידה והוסיפו חוברת — מסך רכישה מותאם למובייל.",
  }),
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function TempShopPage() {
  let plansByType: ShopPlansByType = { system: [], book: [] };
  try {
    plansByType = await getPlansForShop();
  } catch (error) {
    console.error("[temp/shop] getPlansForShop failed:", error);
  }

  const user = await getOrCreateUserFromGuest(undefined, false).catch(() => null);
  const userInfo = user
    ? { name: user.name, email: user.email }
    : { name: null, email: null };

  return <MobilePricingClient plansByType={plansByType} userInfo={userInfo} />;
}
