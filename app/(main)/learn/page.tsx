import { redirect } from "next/navigation";
import LoadingPage from "./loading";
import { getFirstCategory, getOrCreateUserFromGuest } from "@/db/queries";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "התחילו ללמוד עם מסלולים מותאמים אישית, תרגולים חכמים ומעקב התקדמות.",
    keywords: ["תרגול אונליין", "מסלולי למידה", "מחוננים כיתה ב-ג"],
});

const LearnPage = async () => {

    const userData = await getOrCreateUserFromGuest();


    const [user] = await Promise.all([userData]);





    // For guests or users without a saved category, redirect to first category
    if (!user || !user.settings?.lessonCategoryId) {
        const firstCategory = await getFirstCategory();
        if (!firstCategory || !firstCategory.id) {
            // If no categories exist at all, show loading page
            return <LoadingPage />;
        }
        redirect(`/learn/${firstCategory.id}`);
    }
    // For authenticated users with a saved category, redirect to that category
    if (user.settings.lessonCategoryId) {
        redirect(`/learn/${user.settings.lessonCategoryId}`);
    }
    return <LoadingPage />

}

export default LearnPage;
