import { getCategories, getOrCreateUserFromGuest } from "@/db/queries";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google"
import { List } from "./_components/List";


const font = Poppins({ subsets: ["latin"], weight: ["600"] })

 export const LessonCategoryPage = async () => {
    const lessonCategoriesPromise = getCategories();
    const userPromise = getOrCreateUserFromGuest();

    const [lessonCategory, user] = await Promise.all([lessonCategoriesPromise, userPromise]);
    let lessonCategoryId = null;
    if (user && 'lessonCategoryId' in user) {
        lessonCategoryId = user.lessonCategoryId;
    }
    return (
        <div className="h-full max-w-[912px] mx-auto px-3">
            <h1 className={cn("dark:text-slate-200 text-neutral-600 tracking-wide text-2xl font-bold", font.className)}>
                Language courses
            </h1>
            <List
                lessonCategories={lessonCategory}
                lessonCategoryId={lessonCategoryId}
            />
        </div>
    );
}

export default LessonCategoryPage;