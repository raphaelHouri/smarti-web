import SystemPage from "../_components/SystemPage";

export default async function SystemById({ params }: { params: Promise<{ productId: string }> }) {
    await params; // Await params even though we don't use it yet
    return <SystemPage />;
}


