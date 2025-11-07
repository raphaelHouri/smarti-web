import BookPage from "../_components/BookPage";
import { getProductById } from "@/db/queries";

export default async function BookById({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const product = await getProductById(productId);
    return <BookPage product={product} />;
}


