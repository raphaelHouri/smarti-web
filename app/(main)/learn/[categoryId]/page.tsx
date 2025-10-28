import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
// import { Header } from "../_components/Header";
import { UserProgress } from "@/components/UserProgress";
import { redirect } from "next/navigation";
import Unit from "../_components/Unit";
import PromoSection from "../_components/promo";
import QuestsSection from "../../quests/_components/quests";
import { getCategories, getFirstCategory, getLessonCategoryById, getLessonCategoryWithLessonsById, getOrCreateUserFromGuest, getUserSubscriptions } from "@/db/queries";
import LessonCategoryPage from "../../courses/page";
import { tr } from "zod/v4/locales";
import FeedbackButton from "@/components/feedbackButton";

const LearnPage = async ({
    params,
}: {
    params: Promise<{ categoryId: string }>
}) => {
    let { categoryId } = await params
    const userData = getOrCreateUserFromGuest();
    const categories = getCategories();
    const lessonCategories = getLessonCategoryById(categoryId);
    const lessonCategoryWithLessons = await getLessonCategoryWithLessonsById(categoryId);

    const [user, lessonsCategory, categoriesData] = await Promise.all([userData, lessonCategories, categories]);

    // Create a new array with 'completed' field
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
            // No additional logic needed, categoryId is already set
        } else {
            const category = await getFirstCategory();
            if (!category || !category.id) {
                throw new Error("No categories found");
            }
            categoryId = category.id;
        }
    } else if (user.lessonCategoryId) {
        categoryId = user.lessonCategoryId;
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
                        title={categoryDetails.title}
                        description={categoryDetails.description}
                        lessons={lessonsCategoryWithCompleted}

                    />
                </div>
            </FeedWrapper>
            <StickyWrapper>

                <UserProgress
                    imageSrc={categoryDetails.imageSrc || "/fr.svg"}
                    title={categoryDetails.categoryType}
                    geniusScore={
                        user && "geniusScore" in user && typeof user.geniusScore === "number"
                            ? user.geniusScore
                            : 0
                    }
                    experience={
                        user && "experience" in user && typeof user.experience === "number"
                            ? user.experience
                            : 0
                    }
                    hasActiveSubscription={false}
                />
                {!false && (
                    <PromoSection
                    />
                )}
                <QuestsSection experience={user && "experience" in user && typeof user.experience === "number" ? user.experience : 0} />
            </StickyWrapper>
        </div>
    );
}

export default LearnPage;

