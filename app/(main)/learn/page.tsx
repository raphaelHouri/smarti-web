import { redirect } from "next/navigation";
import { getFirstCategory, getOrCreateUserFromGuest } from "@/db/queries";
import Image from "next/image";

import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "התחילו ללמוד עם מסלולים מותאמים אישית, תרגולים חכמים ומעקב התקדמות.",
    keywords: ["תרגול אונליין", "מסלולי למידה", "מחוננים כיתה ב-ג"],
});

const LoadFallback = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center" dir="rtl">
        <Image src="/mascot.svg" alt="סמארטי" width={100} height={100} className="animate-bounce" />
        <div className="space-y-2">
            <h2 className="text-2xl font-bold text-neutral-700 dark:text-neutral-200">
                אוי! משהו השתבש 😅
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-base max-w-xs">
                הדף לא עלה בגלל שיבוש בטעינת הנתונים.
                <br />
                לחצו על הכפתור ונסה שוב!
            </p>
        </div>
        <a
            href="/learn"
            className="px-6 py-3 rounded-2xl bg-purple-500 text-white text-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all shadow-md"
        >
            🔄 נסה שוב
        </a>
    </div>
);

const LearnPage = async () => {

    const user = await getOrCreateUserFromGuest();





    // For guests or users without a saved category, redirect to first category
    if (!user || !user.settings?.lessonCategoryId) {
        const firstCategory = await getFirstCategory();
        if (!firstCategory) {
            return <LoadFallback />;
        }
        redirect(`/learn/${firstCategory.id}`);
    }
    // For authenticated users with a saved category, redirect to that category
    if (user.settings.lessonCategoryId) {
        redirect(`/learn/${user.settings.lessonCategoryId}`);
    }
    return <LoadFallback />;

}

export default LearnPage;
