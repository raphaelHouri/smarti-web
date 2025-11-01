import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getOnlineLessonsWithCategory, getUserProgress, getUserSubscriptions } from "@/db/queries";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { LinkPreview } from "./_components/LinkPreview";

const OnlineLessonPage = async () => {
    const [userProgress, userSubscription, items] = await Promise.all([
        getUserProgress(),
        getUserSubscriptions(),
        getOnlineLessonsWithCategory(),
    ]);

    const isPro = userSubscription?.isPro;

    // Group by categoryType then by topicType
    const categories = items.reduce((acc: Record<string, any>, curr) => {
        const cat = curr.categoryType || "Other";
        if (!acc[cat]) acc[cat] = {} as Record<string, Array<typeof curr>>;
        const topic = curr.topicType || "General";
        if (!acc[cat][topic]) acc[cat][topic] = [];
        acc[cat][topic].push(curr);
        return acc;
    }, {});

    const categoryTabs = Object.keys(categories).sort();

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

                    {categoryTabs.length === 0 ? (
                        <Card className="w-full p-8 text-center">
                            <p className="text-muted-foreground">אין שיעורים זמינים כרגע</p>
                        </Card>
                    ) : (
                        <Tabs defaultValue={categoryTabs[0]} className="w-full">
                            <TabsList className="mb-4 sm:mb-6 flex-wrap justify-start">
                                {categoryTabs.map((cat) => (
                                    <TabsTrigger key={cat} value={cat} className="text-sm">
                                        {cat}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {categoryTabs.map((cat) => (
                                <TabsContent key={cat} value={cat} className="space-y-4 mt-0">
                                    {/* Groups by topicType */}
                                    {(Object.entries(categories[cat]) as Array<[string, any[]]>).map(([topic, list]) => {
                                        const sortedList = list.sort(
                                            (a: any, b: any) => (a.order - b.order) || a.title.localeCompare(b.title)
                                        );

                                        return (
                                            <div key={`${cat}-${topic}`} className="space-y-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-slate-200">
                                                        {topic}
                                                    </h3>
                                                    <span className="text-xs text-muted-foreground">
                                                        ({sortedList.length} שיעורים)
                                                    </span>
                                                </div>

                                                {/* All lessons together - first one gets link preview, rest in grid */}
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
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>
            </FeedWrapper>
        </div>
    );
};

export default OnlineLessonPage;


