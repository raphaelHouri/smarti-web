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





    if (!user || ('user' in user && !(user as any)?.user?.lessonCategoryId)) {
        const firstCategory = await getFirstCategory();
        redirect(`/learn/${firstCategory?.id}`);
    }
    if (user && 'lessonCategoryId' in user && user.lessonCategoryId) {
        redirect(`/learn/${user.lessonCategoryId}`);
    }
    return <LoadingPage />

}

export default LearnPage;
