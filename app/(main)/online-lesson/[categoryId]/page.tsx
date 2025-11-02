import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getOnlineLessonsWithCategory, getCategoriesForOnlineLessons, getUserProgress, getUserSubscriptions } from "@/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { LinkPreview } from "../_components/LinkPreview";
import { redirect } from "next/navigation";
import Image from "next/image";
import OnlineLessonAnimation from "../_components/lottie";

interface OnlineLessonCategoryPageProps {
    params: Promise<{ categoryId: string }>;
}

const OnlineLessonCategoryPage = async ({ params }: OnlineLessonCategoryPageProps) => {
    const { categoryId } = await params;
    const [userProgress, userSubscription, items, categories] = await Promise.all([
        getUserProgress(),
        getUserSubscriptions(),
        getOnlineLessonsWithCategory(categoryId),
        getCategoriesForOnlineLessons(),
    ]);

    const isPro = userSubscription?.isPro;
    const currentCategory = categories.find(c => c.id === categoryId);

    if (!currentCategory && categories.length > 0) {
        redirect(`/online-lesson/${categories[0].id}`);
    }

    // Group by topicType
    const topics = items.reduce((acc: Record<string, any[]>, curr) => {
        const topic = curr.topicType || "General";
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(curr);
        return acc;
    }, {});

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
                <div className="w-full max-w-5xl flex flex-col items-center" dir="rtl">
                    <OnlineLessonAnimation />
                    <h1 className="text-center font-bold text-neutral-800 dark:text-slate-200 text-xl sm:text-2xl my-4 sm:my-6">
                        שיעורים מקוונים
                    </h1>
                    <Separator className="mb-4 sm:mb-6 h-0.5 rounded-full w-full" />

                    {/* Category Navigation Tabs */}
                    {categories.length > 0 && (
                        <div className="w-full mb-6 sm:mb-8">
                            <div className="w-full overflow-x-auto pb-2">
                                <div className="flex gap-3 min-w-fit" dir="rtl">
                                    {categories.map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/online-lesson/${cat.id}`}
                                            className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${cat.id === categoryId
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 dark:border-indigo-500 text-white shadow-lg scale-105'
                                                    : 'bg-card border-border hover:border-indigo-300 dark:hover:border-indigo-600 text-foreground hover:bg-indigo-50 dark:hover:bg-indigo-950/30'
                                                }`}
                                        >
                                            <div className={`relative flex-shrink-0 ${cat.id === categoryId ? 'ring-2 ring-white/50' : ''} rounded-lg overflow-hidden`}>
                                                <Image
                                                    src={cat.imageSrc}
                                                    alt={cat.categoryType}
                                                    width={32}
                                                    height={32}
                                                    className="rounded-lg object-cover"
                                                />
                                            </div>
                                            <span className={`font-semibold text-base whitespace-nowrap ${cat.id === categoryId ? 'text-white' : 'text-neutral-800 dark:text-slate-200'}`}>
                                                {cat.categoryType}
                                            </span>
                                            {cat.id === categoryId && (
                                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse" />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {Object.keys(topics).length === 0 ? (
                        <Card className="w-full p-8 text-center">
                            <p className="text-muted-foreground">אין שיעורים זמינים בקטגוריה זו</p>
                        </Card>
                    ) : (
                        <div className="w-full space-y-4">
                            {(Object.entries(topics) as Array<[string, any[]]>).map(([topic, list]) => {
                                const sortedList = list.sort(
                                    (a: any, b: any) => (a.order - b.order) || a.title.localeCompare(b.title)
                                );

                                return (
                                    <div key={topic} className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-sm font-semibold text-neutral-800 dark:text-slate-200">
                                                {topic}
                                            </h3>
                                            <span className="text-xs text-muted-foreground">
                                                ({sortedList.length} שיעורים)
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" dir="rtl">
                                            {sortedList.map((item: any, index: number) => (
                                                index === 0 ? (
                                                    <LinkPreview
                                                        key={item.id}
                                                        url={item.link}
                                                        title={item.title}
                                                        description={item.description}
                                                    />
                                                ) : (
                                                    <Card key={item.id} className="group relative overflow-hidden border-2 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-200 hover:shadow-lg cursor-pointer h-full" dir="rtl">
                                                        <Link
                                                            href={item.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block h-full"
                                                        >
                                                            <CardContent className="p-3 sm:p-4">
                                                                <div className="flex items-start gap-2.5 flex-row-reverse">
                                                                    <div className="flex-shrink-0 mt-0.5">
                                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                                            <ExternalLink className="w-4 h-4 text-white" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 space-y-1">
                                                                        <div className="flex items-start justify-between gap-2 flex-row-reverse">
                                                                            <h4 className="font-semibold text-sm leading-tight text-neutral-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-right">
                                                                                {item.title}
                                                                            </h4>
                                                                        </div>
                                                                        {item.description && (
                                                                            <p className="text-xs text-muted-foreground line-clamp-2 text-right">
                                                                                {item.description}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </CardContent>
                                                        </Link>
                                                    </Card>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default OnlineLessonCategoryPage;

