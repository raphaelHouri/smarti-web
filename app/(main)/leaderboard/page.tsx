import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getLeaderboardWindowForUser, getUserProgress, getUserSubscriptions, getUserSystemStep } from "@/db/queries";
import { checkIsPro } from "@/lib/server-utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TrophyJson from "./_components/lottie";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { AnimatedTooltip } from "@/components/animated-tooltip";
import PromoSection from "../learn/_components/promo";
import QuestsSection from "../quests/_components/quests";
import FeedbackButton from "@/components/feedbackButton";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "גלו את המצטיינים וצפו בדירוג הלומדים לפי נקודות וניסיון.",
    keywords: ["טבלת מובילים", "דירוג לומדים", "כוכבים"],
});

const LeaderBoardPage = async () => {
    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscriptions();
    const leaderboardWindowData = getLeaderboardWindowForUser();

    const [userProgress, userSubscription, leaderboardWindow] = await Promise.all([
        userProgressData,
        userSubscriptionData,
        leaderboardWindowData,
    ]);
    const { userId } = await auth();
    const systemStep = await getUserSystemStep(userId);
    const isPro = await checkIsPro(userSubscription, systemStep);

    if (!userProgress || !userProgress.settings?.lessonCategoryId) {
        redirect("/learn");
    }


    return (
        <div className="flex flex-row-reverse gap-[42px] px-6" dir="rtl">
            <StickyWrapper>
                <UserProgress
                    imageSrc={userProgress.settings?.avatar || "/fr.svg"}
                    title={userProgress.settings?.lessonCategory?.categoryType || "Math"}
                    experience={userProgress.experience}
                    geniusScore={userProgress.geniusScore}
                />
                {!isPro && (
                    <PromoSection
                    />
                )}
                <QuestsSection experience={userProgress.experience} />
            </StickyWrapper>
            <FeedWrapper
            >
                <div className="w-full flex flex-col items-center">
                    <div className="flex flex-row items-start justify-end w-full mb-4">
                        <FeedbackButton screenName="leaderboard" />
                    </div>
                    <TrophyJson />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-2xl my-6">
                        טבלת המובילים 🥇
                    </h1>
                    <p className="text-center text-base text-muted-foreground mb-2">
                        המיקום שלך:{" "}
                        <span className="font-semibold text-neutral-900 dark:text-slate-100">
                            {leaderboardWindow.userRank ?? "-"}
                        </span>
                    </p>
                    <p className="text-muted-foreground text-center text-lg mb-4">
                        בדקו את המיקום שלכם בין לומדים אחרים.
                    </p>
                    <Separator className="mb-4 h-0.5 rounded-full" />
                    {leaderboardWindow.users.map((userDetail, index) => {
                        const place = leaderboardWindow.startRank + index;
                        const isCurrentUser = userDetail.id === userId;

                        return (
                            <div
                                key={userDetail.id}
                                className={cn(
                                    "items-center justify-center px-4 flex w-full p-2 rounded-xl cursor-pointer transition-all",
                                    isCurrentUser
                                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-500/30 dark:to-pink-500/30 border-2 border-purple-500 dark:border-purple-400 shadow-lg scale-[1.02]"
                                        : "hover:bg-gray-200/50 dark:hover:bg-accent"
                                )}
                            >
                                <p className={cn(
                                    "font-bold mr-4",
                                    isCurrentUser
                                        ? "text-purple-700 dark:text-purple-300 text-lg"
                                        : "text-slate-700 dark:text-slate-200"
                                )}>
                                    {place}
                                </p>
                                <Avatar className={cn(
                                    "border h-8 w-8 mr-6 cursor-pointer",
                                    isCurrentUser
                                        ? "border-purple-500 dark:border-purple-400 ring-2 ring-purple-300 dark:ring-purple-600"
                                        : "bg-slate-100"
                                )}>
                                    <AvatarImage className="object-cover" src={userDetail.avatar || "/default-avatar.png"} />
                                </Avatar>
                                <p className={cn(
                                    "font-bold flex-1",
                                    isCurrentUser
                                        ? "text-purple-800 dark:text-purple-200 text-lg"
                                        : "text-neutral-800 dark:text-slate-200"
                                )}>
                                    {userDetail.email.split("@")[0]}
                                    {isCurrentUser && <span className="ml-2 text-sm">(אתה)</span>}
                                </p>
                                <p className={cn(
                                    isCurrentUser
                                        ? "text-purple-700 dark:text-purple-300 font-semibold"
                                        : "text-muted-foreground dark:text-slate-200"
                                )}>
                                    <span className="inline-flex items-center gap-1">
                                        <img src="/stars.svg" alt="נקודות" width={20} height={20} className="inline-block" />
                                        {userDetail.experience}
                                        <span className="ml-1">כוכבים</span>
                                    </span>
                                </p>
                            </div>
                        );
                    })}
                    <div className="flex mt-4 items-center justify-center mb-10 w-full cursor-pointer">
                        <AnimatedTooltip
                            items={leaderboardWindow.users.map((u) => ({
                                id: u.id,
                                userName: u.email,
                                stars: u.experience,
                                avatar: u.avatar ?? "/default-avatar.png",
                            }))}
                        />
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
}

export default LeaderBoardPage;