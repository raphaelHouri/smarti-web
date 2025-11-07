import BookPage from "../_components/BookPage";
import { getProductById } from "@/db/queries";

export default async function BookById({ params }: { params: { productId: string } }) {
    const { productId } = params;
    const product = await getProductById(productId);
    return <BookPage product={product} />;
}


