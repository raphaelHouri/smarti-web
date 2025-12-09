import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
// import { Header } from "../_components/Header";
import { UserProgress } from "@/components/UserProgress";
import { redirect } from "next/navigation";
import Unit from "../_components/Unit";
import PromoSection from "../_components/promo";
import QuestsSection from "../../quests/_components/quests";
import { getCategories, getFirstCategory, getLessonCategoryById, getLessonCategoryWithLessonsById, getOrCreateUserFromGuest, getUserProgress, getUserSubscriptions, getUserSystemStep, type UserWithSettings } from "@/db/queries";
import LessonCategoryPage from "../../courses/page";
import FeedbackButton from "@/components/feedbackButton";
import { checkIsPro } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

// כל הטקסטים, פרופס וכו' יתורגמו לעברית

const LearnPage = async ({
    params,
}: {
    params: Promise<{ categoryId: string }>
}) => {
    let { categoryId } = await params
    const userData = getOrCreateUserFromGuest();
    const userProgressData = getUserProgress();
    const categories = getCategories();
    const lessonCategories = getLessonCategoryById(categoryId);
    const lessonCategoryWithLessons = await getLessonCategoryWithLessonsById(categoryId);
    const userSubscriptionData = getUserSubscriptions();
    const [user, userProgress, lessonsCategory, categoriesData, userSubscription] = await Promise.all([userData, userProgressData, lessonCategories, categories, userSubscriptionData]);

    // Get systemStep from user or cookie
    const { userId } = await auth();
    const systemStep = await getUserSystemStep(userId);
    const isPro = checkIsPro(userSubscription, systemStep);

    // יצירת מערך חדש עם שדה 'הושלם'
    const lessonsCategoryWithCompleted = lessonsCategory.map((lessonCategoryItem) => {
        const matchedLesson = lessonCategoryWithLessons.find(
            (lesson: any) => lesson.lessonId === lessonCategoryItem.id
        );
        const completed = !!matchedLesson;
        const rightQuestions = completed ? matchedLesson.rightQuestions : undefined;
        const totalQuestions = completed ? matchedLesson.totalQuestions : undefined;
        return {
            ...lessonCategoryItem,
            completed,
            rightQuestions,
            totalQuestions,
        };
    });

    if (!user) {
        if (categoryId) {
            // אין צורך בלוגיקה נוספת, categoryId כבר קיים
        } else {
            const category = await getFirstCategory();
            if (!category || !category.id) {
                throw new Error("לא נמצאו קטגוריות");
            }
            categoryId = category.id;
        }
    } else if (user?.settings?.lessonCategoryId) {
        categoryId = user.settings.lessonCategoryId;
    } else {
        redirect("/courses");
    }

    const categoryDetails = categoriesData.find(cat => cat.id === categoryId)
    if (!categoryDetails) {
        redirect("/courses");
    }

    return (
        <div className="flex gap-[48px] px-2">

            <FeedWrapper>
                <div className="flex flex-row items-start justify-end ">
                    <FeedbackButton screenName="learn" identifier={categoryDetails.categoryType} />
                </div>
                <LessonCategoryPage />
                {/* <Header title={categoryDetails.categoryType || ""} /> */}

                <div key={categoryDetails.id} className="mb-10">
                    <Unit
                        id={categoryDetails.id}
                        title={categoryDetails.title || "שם היחידה לא מוגדר"}
                        description={categoryDetails.description || "אין תיאור"}
                        lessons={lessonsCategoryWithCompleted}
                        isPro={isPro}
                    />
                </div>
            </FeedWrapper>
            <StickyWrapper>

                <UserProgress
                    imageSrc={userProgress?.settings?.avatar || categoryDetails.imageSrc || "/fr.svg"}
                    title={categoryDetails.categoryType || "שם הקטגוריה לא נמצא"}
                    experience={userProgress?.experience || 0}
                    geniusScore={userProgress?.geniusScore || 0}
                />
                {!isPro && (
                    <PromoSection
                    />
                )}
                <QuestsSection
                    experience={userProgress?.experience || 0}
                />
            </StickyWrapper>
        </div>
    );
}

export default LearnPage;

