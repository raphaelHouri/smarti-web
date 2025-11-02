import { getCategories, getOrCreateUserFromGuest } from "@/db/queries";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google"
import { List } from "./_components/List";


const font = Poppins({ subsets: ["latin"], weight: ["600"] })

const LessonCategoryPage = async () => {
    const lessonCategoriesPromise = getCategories();
    const userPromise = getOrCreateUserFromGuest();

    const [lessonCategory, user] = await Promise.all([lessonCategoriesPromise, userPromise]);
    let lessonCategoryId = null;
    if (user && 'lessonCategoryId' in user) {
        lessonCategoryId = user.lessonCategoryId;
    }
    return (
        <div className="mx-auto px-2 max-w-[768px]">

            <List
                lessonCategories={lessonCategory}
                lessonCategoryId={lessonCategoryId}
            />
        </div>
    );
};

export default async function Page() {
    return await LessonCategoryPage();
}