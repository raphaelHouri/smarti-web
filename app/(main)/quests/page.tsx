import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getUserProgress, getUserSubscriptions, getUserSystemStep } from "@/db/queries";
import { checkIsPro } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Award, Flame, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import PromoSection from "../learn/_components/promo";
import { quests } from "@/constants";
import QuestIcon from "@/components/QuestIcon";
import QuestsJson from "./_components/lottie";
import FeedbackButton from "@/components/feedbackButton";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "השלימו משימות, צברו נקודות ופתחו שלבים כדי לשמור על מוטיבציה.",
    keywords: ["גיימיפיקציה", "משימות למידה", "נקודות ופרסים"],
});

const QuestsPage = async () => {
    const userProgressData = getUserProgress();
    const userSubscriptionData = getUserSubscriptions();

    const [userProgress, userSubscription] = await Promise.all([userProgressData, userSubscriptionData])

    if (!userProgress || !userProgress.settings?.lessonCategoryId) {
        redirect("/courses");
    }

    const { userId } = await auth();
    const systemStep = await getUserSystemStep(userId);
    const isPro = checkIsPro(userSubscription, systemStep);




    return (
        <div className="flex flex-row-reverse gap-[42px] px-6">
            <StickyWrapper>
                <UserProgress
                    experience={userProgress.experience}
                    geniusScore={userProgress.geniusScore}
                    imageSrc={userProgress.settings?.avatar || "/fr.svg"}
                    title={userProgress.settings?.lessonCategory?.title || "French"}
                />
                {!isPro && (
                    <PromoSection
                    />
                )}
            </StickyWrapper>
            <FeedWrapper
            >
                <div className="w-full flex flex-col items-center" dir="rtl">
                    <div className="flex flex-row items-start justify-end w-full mb-4">
                        <FeedbackButton screenName="quests" />
                    </div>
                    <QuestsJson />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-2xl my-6">
                        🎯 שלבים
                    </h1>
                    <p className="text-muted-foreground text-center text-lg mb-4">
                        השלם משימות על ידי צבירת נקודות.
                    </p>
                    <ul className="w-full cursor-pointer">
                        <Link href="/learn">
                            {quests.map((quest) => {
                                const progress = Math.max(0, Math.min(100, (userProgress.experience / quest.value) * 100));

                                // Pick an icon and styling based on progress state
                                const state =
                                    progress >= 100 ? "completed" :
                                        progress >= 75 ? "on_fire" :
                                            progress >= 40 ? "improving" : "starting";

                                const Icon = state === "completed" ? Award
                                    : state === "on_fire" ? Flame
                                        : state === "improving" ? TrendingUp
                                            : Star;

                                const iconClasses = state === "completed" ? "text-amber-500"
                                    : state === "on_fire" ? "text-rose-500"
                                        : state === "improving" ? "text-emerald-500"
                                            : "text-sky-500";

                                const pill = state === "completed" ? { text: "עלית שלב", cls: "bg-amber-100 text-amber-700" }
                                    : state === "on_fire" ? { text: "במומנטום", cls: "bg-rose-100 text-rose-700" }
                                        : state === "improving" ? { text: "מתקדמים", cls: "bg-emerald-100 text-emerald-700" }
                                            : { text: "קדימה!", cls: "bg-sky-100 text-sky-700" };

                                return (
                                    <div key={quest.title}
                                        className="w-full flex items-center p-4 gap-x-4 border-t-2 hover:bg-muted/40 transition-colors"
                                    >
                                        <div className="relative">
                                            <QuestIcon
                                                animationPath={quest.animation}
                                                width={56}
                                                height={56}
                                            />
                                            <div className="absolute -top-2 -right-2 size-7 rounded-full bg-background ring-1 ring-border grid place-items-center">
                                                <Icon className={`size-4 ${iconClasses}`} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-y-2 w-full">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="font-bold text-xl text-neutral-700 dark:text-slate-200">
                                                    {quest.title}
                                                </p>
                                                <span className={`text-xs px-2 py-1 rounded-full ${pill.cls}`}>
                                                    {pill.text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Progress value={progress} className="h-2 flex-1" />
                                                <span className="text-sm text-muted-foreground min-w-[40px] text-left">
                                                    {Math.round(progress)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </Link>
                    </ul>
                </div>
            </FeedWrapper>
        </div>
    );
}

export default QuestsPage;