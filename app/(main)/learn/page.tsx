import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import LoadingPage from "./loading";
import { getFirstCategory, getOrCreateUserFromGuest } from "@/db/queries";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "התחילו ללמוד עם מסלולים מותאמים אישית, תרגולים חכמים ומעקב התקדמות.",
    keywords: ["תרגול אונליין", "מסלולי למידה", "מחוננים כיתה ב-ג"],
});

// Separate async component that handles redirect logic
// Suspense will show LoadingPage while this async component completes
async function LearnRedirect(): Promise<ReactNode> {
    try {
        const user = await getOrCreateUserFromGuest();





        // For guests or users without a saved category, redirect to first category
        if (!user || !user.settings?.lessonCategoryId) {
            const firstCategory = await getFirstCategory();
            if (!firstCategory || !firstCategory.id) {
                // If no categories exist at all, redirect to marketing page
                redirect("/learn");
                return null;
            }
            redirect(`/learn/${firstCategory.id}`);
            return null;
        }

        // For authenticated users with a saved category, redirect to that category
        if (user.settings.lessonCategoryId) {
            redirect(`/learn/${user.settings.lessonCategoryId}`);
            return null;
        }

        // Fallback: redirect to marketing page
        redirect("/");
        return null;
    } catch (error) {
        console.error("[LearnPage] Error loading page:", error);
        // On error, try to redirect to first category as fallback
        try {
            const firstCategory = await getFirstCategory();
            if (firstCategory?.id) {
                redirect(`/learn/${firstCategory.id}`);
                return null;
            }
        } catch (fallbackError) {
            console.error("[LearnPage] Fallback error:", fallbackError);
        }
        // If all else fails, redirect to marketing page
        redirect("/learn");
        return null;
    }
}

const LearnPage = () => {
    return (
        <Suspense fallback={<LoadingPage />}>
            <LearnRedirect />
        </Suspense>
    );
}

export default LearnPage;
