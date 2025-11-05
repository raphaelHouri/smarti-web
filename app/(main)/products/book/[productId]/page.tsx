import BookPage from "../_components/BookPage";

export default async function BookById({ params }: { params: Promise<{ productId: string }> }) {
    await params; // Await params even though we don't use it yet
    return <BookPage />;
}


