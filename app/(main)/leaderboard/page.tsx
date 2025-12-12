import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getTopUsers, getUserProgress, getUserSubscriptions, getUserSystemStep } from "@/db/queries";
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
    const topTenUsersData = getTopUsers();


    const [userProgress, userSubscription, topTenUsers] = await Promise.all([userProgressData, userSubscriptionData, topTenUsersData])
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
                    <p className="text-muted-foreground text-center text-lg mb-4">
                        בדקו את המיקום שלכם בין לומדים אחרים.
                    </p>
                    <Separator className="mb-4 h-0.5 rounded-full" />
                    {topTenUsers.map((userDetail, index) => (
                        <div key={userDetail.id}
                            className="items-center justify-center px-4
                    flex w-full p-2 hover:bg-gray-200/50 dark:hover:bg-accent rounded-xl cursor-pointer"
                        >
                            <p className="font-bold text-slate-700 mr-4 dark:text-slate-200">{index + 1}</p>
                            <Avatar className="border bg-slate-100 h-8 w-8 mr-6 cursor-pointer">
                                <AvatarImage className="object-cover" src={userDetail.avatar || "/default-avatar.png"} />
                            </Avatar>
                            <p className="font-bold text-neutral-800 flex-1 dark:text-slate-200">
                                {userDetail.email.split("@")[0]}
                            </p>
                            <p className="text-muted-foreground dark:text-slate-200">
                                <span className="inline-flex items-center gap-1">
                                    <img src="/stars.svg" alt="נקודות" width={20} height={20} className="inline-block" />
                                    {userDetail.experience}
                                    <span className="ml-1">כוכבים</span>
                                </span>
                            </p>
                        </div>
                    ))}
                    <div className="flex mt-4 items-center justify-center mb-10 w-full cursor-pointer">
                        <AnimatedTooltip
                            items={topTenUsers.map((u) => ({
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