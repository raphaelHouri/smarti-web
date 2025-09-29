// app/settings/page.tsx
import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getUserProgress, getUserSubscriptions, getUserSettingsById, getUserByAuthId } from "@/db/queries"; // Add getUserSettingsById and getUserByAuthId
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import SettingsAnimation from "./_components/lottie";
import PromoSection from "../learn/_components/promo";
import QuestsSection from "../quests/_components/quests";
import { ProfileSettingsForm } from "./_components/ProfileSettingsForm"; // Import the new form component
import { auth } from "@clerk/nextjs/server";


const SettingsPage = async () => {
    const { userId } = await auth(); // Get userId from Clerk

    if (!userId) {
        redirect("/sign-in"); // Redirect if not authenticated
    }

    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscriptions();
    const currentUserData = getUserByAuthId(userId); // Fetch current user's data
    const currentUserSettingsData = getUserSettingsById(userId); // Fetch current user's settings

    const [userProgress, userSubscription, currentUser, currentUserSettings] = await Promise.all([
        userProgressData,
        userSubscriptionData,
        currentUserData,
        currentUserSettingsData,
    ]);

    if (!userProgress || !userProgress.lessonCategoryId) {
        redirect("/learn");
    }

    if (!currentUser) {
        // This case should ideally not happen if userProgress exists for the same user,
        // but good for safety.
        redirect("/learn");
    }

    const isPro = userSubscription?.isPro;

    return (
        <div className="flex flex-row-reverse gap-[42px] px-6">
            <StickyWrapper>
                <UserProgress
                    imageSrc={"activeCourse.imageSrc"} // Make sure activeCourse is defined or fetched
                    title={"activeCourse.title"} // Make sure activeCourse is defined or fetched
                    experience={userProgress.experience}
                    geniusScore={userProgress.geniusScore}
                    hasActiveSubscription={isPro}
                />
                {!isPro && (
                    <PromoSection />
                )}
                <QuestsSection experience={userProgress.experience} />
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <SettingsAnimation />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-2xl my-6">
                        Your Settings ⚙️
                    </h1>
                    <p className="text-muted-foreground text-center text-lg mb-4">
                        Manage your profile, learning preferences, and more.
                    </p>
                    <Separator className="mb-4 h-0.5 rounded-full" />

                    <div className="w-full max-w-2xl"> {/* Adjusted width for the form */}
                        <ProfileSettingsForm
                            initialName={currentUser.name || ""}
                            initialLessonClock={currentUserSettings?.lessonClock ?? true}
                            initialQuizClock={currentUserSettings?.quizClock ?? true}
                            initialGradeClass={currentUserSettings?.grade_class}
                            initialGender={currentUserSettings?.gender}
                            initialAvatar={currentUserSettings?.avatar}
                        />
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
}

export default SettingsPage;