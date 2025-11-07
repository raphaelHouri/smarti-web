import SystemPage from "../_components/SystemPage";
import { getProductById } from "@/db/queries";

export default async function SystemById({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const product = await getProductById(productId);
    return <SystemPage product={product} />;
}


