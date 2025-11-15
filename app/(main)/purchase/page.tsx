import PurchasePageShop from "../shop/_components/PurchasePageShop";
import { getPlansForShop } from "@/db/queries";

export default async function PurchasePage() {
    const plansByType = await getPlansForShop();
    return <PurchasePageShop plansByType={plansByType} />;
}
