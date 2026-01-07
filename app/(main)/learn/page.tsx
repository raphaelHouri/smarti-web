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
    try {
        const user = await getOrCreateUserFromGuest();





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
        return <LoadingPage />;
    } catch (error) {
        console.error("[LearnPage] Error loading page:", error);
        // On error, try to redirect to first category as fallback
        try {
            const firstCategory = await getFirstCategory();
            if (firstCategory?.id) {
                redirect(`/learn/${firstCategory.id}`);
            }
        } catch (fallbackError) {
            console.error("[LearnPage] Fallback error:", fallbackError);
        }
        // If all else fails, show loading page
        return <LoadingPage />;
    }
}

export default LearnPage;
