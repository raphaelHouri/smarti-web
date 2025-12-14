import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getAllWrongQuestionsWithDetails, getUserProgress, getUserSubscriptions, getUserSystemStep } from "@/db/queries";
import { checkIsPro } from "@/lib/server-utils";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PracticeAnimation from "./_components/lottie";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PromoSection from "../learn/_components/promo";
import QuestsSection from "../quests/_components/quests";
import FormatPieChart from "./_components/format-pie-chart";
import TopicBarChart from "./_components/topic-bar-chart";
import FeedbackButton from "@/components/feedbackButton";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
    description: "תרגלו שאלות שחזרו ונעשו טעויות, קבלו ניתוח אישי ושפרו ביצועים.",
    keywords: ["תרגול שאלות", "שיפור ביצועים", "מחוננים תרגול"],
});

type GroupedSummaryType = {
    [format: string]: {
        totalWrong: number;
        categoryId: string;
        categoryType: string;
        topics: { topicType: string | null; count: number }[];
    };
};

const PracticePage = async () => {
    const [userProgress, userSubscription, wrongQuestionsWithDetails] = await Promise.all([
        getUserProgress(),
        getUserSubscriptions(),
        getAllWrongQuestionsWithDetails(),
    ]);

    if (!userProgress || !userProgress.settings?.lessonCategoryId) {
        redirect("/learn");
    }

    const { userId } = await auth();
    const systemStep = await getUserSystemStep(userId);
    const isPro = await checkIsPro(userSubscription, systemStep);

    const groupedSummary: GroupedSummaryType = wrongQuestionsWithDetails.reduce((acc, wrongQuestionEntry) => {
        const question = wrongQuestionEntry.question;
        const lessonCategory = wrongQuestionEntry.lessonCategory;
        const lessonCategoryId = wrongQuestionEntry.lessonCategoryId;
        if (!question || !lessonCategory || !lessonCategoryId) return acc;

        const { topicType } = question;
        const categoryId = lessonCategoryId;
        const categoryType = lessonCategory.categoryType;

        if (!acc[categoryId]) {
            acc[categoryId] = {
                totalWrong: 0,
                topics: [],
                categoryId,
                categoryType,
            };
        }

        acc[categoryId].totalWrong += 1;

        const topicEntry = acc[categoryId].topics.find((t) => t.topicType === topicType);
        if (topicEntry) {
            topicEntry.count += 1;
        } else {
            acc[categoryId].topics.push({ topicType, count: 1 });
        }

        return acc;
    }, {} as GroupedSummaryType);

    const totalWrongQuestions = wrongQuestionsWithDetails.length;

    const categoryIdLabels = Object.keys(groupedSummary)
    const categoryTypes = Object.values(groupedSummary).map(data => data.categoryType);
    const categoryIdDataCounts = categoryIdLabels.map((categoryId) => groupedSummary[categoryId].totalWrong);

    const categoryIdPieChartProps = {
        labels: categoryTypes,
        data: categoryIdDataCounts,
    };

    const allTopics: { [key: string]: number } = {};
    Object.values(groupedSummary).forEach((category) => {
        category.topics.forEach((topic) => {
            const topicName = topic.topicType || "General";
            allTopics[topicName] = (allTopics[topicName] || 0) + topic.count;
        });
    });

    const sortedTopics = Object.entries(allTopics).sort(([, countA], [, countB]) => countB - countA);
    const topicBarChartProps = {
        labels: sortedTopics.map(([topicName]) => topicName),
        data: sortedTopics.map(([, count]) => count),
    };

    return (
        <div className="flex flex-col-reverse md:flex-row-reverse gap-6 md:gap-[42px] px-4 sm:px-6">
            <StickyWrapper>
                <UserProgress
                    experience={userProgress.experience}
                    geniusScore={userProgress.geniusScore}
                    imageSrc={userProgress.settings?.avatar || "/fr.svg"}
                    title={userProgress.settings?.lessonCategory?.title || "Active Course"}
                />
                {!isPro && <PromoSection />}
                <QuestsSection experience={userProgress.experience} />
            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center" dir="rtl">
                    <div className="flex flex-row items-start justify-end w-full mb-4">
                        <FeedbackButton screenName="practice" />
                    </div>
                    <PracticeAnimation />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-xl sm:text-2xl my-6">
                        תרגול מביא לשלמות! 🏋️‍♂️
                    </h1>
                    <p className="text-muted-foreground text-center text-base sm:text-lg mb-4">
                        חזרה על שאלות שטעית בהן ונסה שוב.
                    </p>
                    <Separator className="mb-6 h-0.5 rounded-full" />

                    {totalWrongQuestions === 0 ? (
                        <Card className="w-full max-w-xl text-center p-8 bg-gradient-to-r from-green-50 to-emerald-150 dark:from-green-900 dark:to-emerald-950 border-green-200 dark:border-green-800 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-green-700 dark:text-green-300">אין טעויות (בינתיים)</CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-400">
                                    המשך כך! לא זיהינו טעויות לתרגול.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                                    <Link href="/learn">התחל ללמוד</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="w-full max-w-3xl space-y-6">
                            <Card className="w-full shadow-lg dark:bg-gray-800">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-950 rounded-t-lg p-4">
                                    <CardTitle className="text-purple-800 dark:text-purple-200 text-xl font-bold flex items-center gap-2">
                                        ניתוח טעויות שלך 📊
                                    </CardTitle>
                                    <CardDescription className="text-purple-700 dark:text-purple-300">
                                        תובנות חזותיות על אתגרי הלמידה שלך.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 space-y-6">
                                    <div className="flex flex-col lg:flex-row lg:justify-around lg:items-start lg:gap-8">
                                        <div className="flex flex-col items-center lg:w-1/2">
                                            <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-slate-200">
                                                טעויות לפי קטגוריה
                                            </h3>
                                            <div className="relative h-[150px] w-[150px] sm:h-[200px] sm:w-[200px]">
                                                <FormatPieChart {...categoryIdPieChartProps} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center mt-6 lg:mt-0 lg:w-1/2">
                                            <h3 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-slate-200">
                                                הנושאים שבהם הכי טעית
                                            </h3>
                                            <div className="relative h-[180px] w-full max-w-xs">
                                                <TopicBarChart {...topicBarChartProps} />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Separator className="my-6 h-0.5 rounded-full" />
                            {Object.entries(groupedSummary).map(([format, data]) => (
                                <Card key={format} className="w-full shadow-lg dark:bg-gray-800">
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-950 rounded-t-lg p-4">

                                        <CardTitle className="text-blue-800 dark:text-blue-200 text-lg font-regular flex items-center gap-2">
                                            <strong className="font-bold text-lg">{data.categoryType} - </strong> נושאים שכדאי לחזרה עליהן.
                                            <span className="text-sm font-normal text-blue-600 dark:text-blue-400">
                                                ({data.totalWrong} טעויות)
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                        {data.topics.length === 0 ? (
                                            <p className="text-muted-foreground italic">
                                                אין נושאים ספציפיים עם טעויות בקטגוריה זו.
                                            </p>
                                        ) : (
                                            data.topics
                                                .sort((a, b) => b.count - a.count)
                                                .map((topic, index) => (
                                                    <div
                                                        key={`${format}-${topic.topicType}-${index}`}
                                                        className="flex items-center justify-between p-2   rounded-md"
                                                    >
                                                        <p className="font-medium text-neutral-700 dark:text-slate-200">
                                                            {topic.topicType || "נושא כללי"}
                                                        </p>
                                                        <div className="flex items-center gap-x-2">
                                                            <span className="text-red-500 font-semibold">{topic.count}</span>
                                                            <span className="text-muted-foreground">טעויות</span>
                                                        </div>
                                                    </div>
                                                ))
                                        )}
                                    </CardContent>
                                    <CardFooter className="p-4 border-t dark:border-gray-700 flex justify-end">
                                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                            <Link href={`/practice/${data.categoryId}`}>
                                                חזרו על שאלות {data.categoryType}
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default PracticePage;
