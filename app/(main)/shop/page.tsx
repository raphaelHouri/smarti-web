import { redirect } from "next/navigation";

// Force this route to render dynamically
export const dynamic = "force-dynamic";

// Redirect /shop to /shop/system by default
export default async function ShopPage() {
    redirect("/shop/system");
}
