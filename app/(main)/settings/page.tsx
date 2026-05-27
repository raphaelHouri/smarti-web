// app/settings/page.tsx
import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getUserProgress, getUserSubscriptions, getUserSettingsById, getUserByAuthId, getUserSystemStep, getUserSubscriptionDetails, getUserBookPurchases } from "@/db/queries";
import { checkIsPro } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import SettingsAnimation from "./_components/lottie";
import PromoSection from "../learn/_components/promo";
import QuestsSection from "../quests/_components/quests";
import { ProfileSettingsForm } from "./_components/ProfileSettingsForm";
import { SubscriptionInfoCard } from "./_components/SubscriptionInfoCard";
import { auth } from "@clerk/nextjs/server";
import FeedbackButton from "@/components/feedbackButton";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ModeToggle } from "@/components/mode-toggle";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "נהלו פרופיל, בחירת כיתה ומדדים אישיים כדי לדייק את הלמידה.",
    keywords: ["הגדרות משתמש", "העדפות למידה", "פרופיל לומד"],
});

const SettingsPage = async () => {
    const { userId } = await auth(); // Get userId from Clerk

    if (!userId) {
        redirect("/sign-in"); // Redirect if not authenticated
    }

    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscriptions();
    const currentUserData = getUserByAuthId(userId);
    const currentUserSettingsData = getUserSettingsById(userId);
    const subscriptionDetailsData = getUserSubscriptionDetails();
    const bookPurchasesData = getUserBookPurchases();

    const [userProgress, userSubscription, currentUser, currentUserSettings, subscriptionDetails, bookPurchases] = await Promise.all([
        userProgressData,
        userSubscriptionData,
        currentUserData,
        currentUserSettingsData,
        subscriptionDetailsData,
        bookPurchasesData,
    ]);

    if (!userProgress || !userProgress.settings?.lessonCategoryId) {
        redirect("/learn");
    }

    if (!currentUser) {
        // This case should ideally not happen if userProgress exists for the same user,
        // but good for safety.
        redirect("/learn");
    }

    const systemStep = await getUserSystemStep(userId);
    const isPro = await checkIsPro(userSubscription, systemStep);

    return (
        <div className="flex flex-row-reverse gap-[42px] px-6">
            <StickyWrapper>
                <UserProgress
                    imageSrc={userProgress.settings?.avatar || "/fr.svg"} // Make sure activeCourse is defined or fetched
                    title={userProgress.settings?.avatar || "Math"} // Make sure activeCourse is defined or fetched
                    experience={userProgress.experience}
                    geniusScore={userProgress.geniusScore}
                />
                {!isPro && (
                    <PromoSection />
                )}
                <QuestsSection experience={userProgress.experience} />
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center" dir="rtl">
                    <div className="flex flex-row items-start justify-end w-full mb-4">

                        <ModeToggle />
                        <FeedbackButton screenName="settings" />
                    </div>
                    <SettingsAnimation />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-2xl my-6">
                        הגדרות ⚙️
                    </h1>
                    <p className="text-muted-foreground text-center text-lg mb-4">
                        נהלו את הפרופיל שלכם, העדפות הלמידה ועוד.
                    </p>
                    <Separator className="mb-4 h-0.5 rounded-full" />

                    <div className="w-full max-w-2xl">
                        <ProfileSettingsForm
                            initialName={currentUser.name || ""}
                            initialLessonClock={currentUserSettings?.lessonClock ?? true}
                            initialQuizClock={currentUserSettings?.quizClock ?? true}
                            initialGradeClass={currentUserSettings?.grade_class}
                            initialGender={currentUserSettings?.gender}
                            initialAvatar={currentUserSettings?.avatar}
                        />
                        <div className="mt-6">
                            <SubscriptionInfoCard
                                subscriptions={subscriptionDetails}
                                bookPurchases={bookPurchases}
                            />
                        </div>
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
}

export default SettingsPage;