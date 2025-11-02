import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getOnlineLessonsWithCategory, getCategoriesForOnlineLessons, getUserProgress, getUserSubscriptions } from "@/db/queries";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

const OnlineLessonPage = async () => {
    const [userProgress, userSubscription, categories] = await Promise.all([
        getUserProgress(),
        getUserSubscriptions(),
        getCategoriesForOnlineLessons(),
    ]);

    const isPro = userSubscription?.isPro;

    // Check if user's lessonCategoryId has online lessons
    if (userProgress?.lessonCategoryId) {
        const userCategoryExists = categories.find(c => c.id === userProgress.lessonCategoryId);
        if (userCategoryExists) {
            redirect(`/online-lesson/${userProgress.lessonCategoryId}`);
        }
    }

    // Redirect to first category if categories exist
    if (categories.length > 0) {
        redirect(`/online-lesson/${categories[0].id}`);
    }

    return (
        <div className="flex flex-col-reverse md:flex-row-reverse gap-6 md:gap-[42px] px-4 sm:px-6">
            <StickyWrapper>
                <UserProgress
                    experience={userProgress?.experience || 0}
                    geniusScore={userProgress?.geniusScore || 0}
                    imageSrc={userProgress?.settings?.avatar || "/fr.svg"}
                    title={userProgress?.lessonCategory?.title || "Online Lessons"}
                    hasActiveSubscription={isPro}
                />
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full max-w-5xl" dir="rtl">
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-xl sm:text-2xl my-4 sm:my-6">
                        שיעורים מקוונים
                    </h1>
                    <Separator className="mb-4 sm:mb-6 h-0.5 rounded-full" />

                    {categories.length === 0 ? (
                        <Card className="w-full p-8 text-center">
                            <p className="text-muted-foreground">אין שיעורים זמינים כרגע</p>
                        </Card>
                    ) : (
                        <Card className="w-full p-8 text-center">
                            <p className="text-muted-foreground">מעבר לקטגוריה...</p>
                        </Card>
                    )}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default OnlineLessonPage;


