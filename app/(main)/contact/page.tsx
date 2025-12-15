import FeedWrapper from "@/components/FeedWrapper";
import StickyWrapper from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/UserProgress";
import { getUserProgress, getUserSubscriptions, getUserSystemStep } from "@/db/queries";
import { checkIsPro } from "@/lib/server-utils";
import { Separator } from "@/components/ui/separator";
import PromoSection from "../learn/_components/promo";
import QuestsSection from "../quests/_components/quests";
import { auth } from "@clerk/nextjs/server";
import FeedbackButton from "@/components/feedbackButton";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";
import Link from "next/link";
import ContactAnimation from "./_components/lottie";
import CopyLinkButton from "./_components/CopyLinkButton";
import { redirect } from "next/navigation";

export const metadata: Metadata = buildMetadata({
    title: "צור קשר | סמארטי",
    description: "צרו קשר עם צוות סמארטי לקבלת עזרה, תמיכה או שאלות בנושא הכנה למבחני מחוננים.",
    keywords: ["צור קשר", "תמיכה", "עזרה", "סמארטי"],
});

interface ContactPageProps {
    searchParams: Promise<{ section?: string }>;
}

const ContactPage = async ({ searchParams }: ContactPageProps) => {
    const { userId } = await auth();
    const params = await searchParams;

    // Auto-redirect to WhatsApp group if section is directLinkGroup
    if (params.section === "directLinkGroup") {
        redirect("https://chat.whatsapp.com/FThYvpNBjFkH5epoEOJ7PH");
    }

    const section = params.section === "group" ? "group" : "contact";

    const userProgressData = userId ? getUserProgress() : null;
    const userSubscriptionData = userId ? getUserSubscriptions() : null;
    const systemStepData = userId ? getUserSystemStep(userId) : null;

    const [userProgress, userSubscription, systemStep] = await Promise.all([
        userProgressData,
        userSubscriptionData,
        systemStepData,
    ]);

    const isPro = userId && userSubscription && systemStep ? await checkIsPro(userSubscription, systemStep) : false;

    const whatsappMessage = encodeURIComponent("שלום, אשמח לקבל עזרה במערכת סמארטי...");
    const whatsappUrl = `https://wa.me/972586519423?text=${whatsappMessage}`;
    const whatsappGroupUrl = "https://chat.whatsapp.com/FThYvpNBjFkH5epoEOJ7PH";

    return (
        <div className="flex flex-row-reverse gap-[42px] px-6">
            {userId && userProgress && (
                <StickyWrapper>
                    <UserProgress
                        imageSrc={userProgress.settings?.avatar || "/fr.svg"}
                        title={userProgress.settings?.avatar || "Math"}
                        experience={userProgress.experience}
                        geniusScore={userProgress.geniusScore}
                    />
                    {!isPro && (
                        <PromoSection />
                    )}
                    <QuestsSection experience={userProgress.experience} />
                </StickyWrapper>
            )}
            <FeedWrapper>
                <div className="w-full flex flex-col items-center" dir="rtl">
                    <div className="flex flex-row items-start justify-end w-full mb-4">
                        <FeedbackButton screenName="contact" />
                    </div>

                    <div className="w-full max-w-4xl">
                        {/* Animation */}
                        <ContactAnimation section={section} />

                        {section === "group" ? (
                            <>
                                {/* Header Section - Group */}
                                <div className="text-center mb-4">
                                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-slate-200 mb-2">
                                        הצטרפו לקבוצת הווצאפ שלנו
                                    </h1>
                                    <p className="text-muted-foreground text-base">
                                        הצטרפו לקהילה שלנו וקבלו עדכונים, טיפים ותמיכה בתוכנית ההכנה לבחינה
                                    </p>
                                </div>

                                <Separator className="mb-4 h-0.5 rounded-full" />

                                {/* Main Group Card - Priority */}
                                <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 rounded-2xl p-4 md:p-6 shadow-lg border border-green-100 dark:border-green-900/30 mb-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                <Users className="w-10 h-10 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-slate-200 mb-2">
                                                הצטרפו לקבוצת הווצאפ
                                            </h2>
                                            <p className="text-muted-foreground mb-4 text-base">
                                                הצטרפו לקהילה פעילה של תלמידים והורים המכינים את עצמם לבחינת המחוננים. קבלו עדכונים, טיפים, תמיכה ומידע חשוב
                                            </p>
                                            <a
                                                href={whatsappGroupUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            >
                                                <Users className="w-5 h-5" />
                                                הצטרף לקבוצה עכשיו
                                            </a>
                                            <div className="w-full flex justify-center mt-2">
                                                <CopyLinkButton url={whatsappGroupUrl} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Card - Secondary - Compact */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-2 border border-green-100 dark:border-green-900/30">
                                    <div className="flex flex-col items-center text-center gap-3">
                                        {/* <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" /> */}
                                        <div>
                                            <h3 className="font-semibold text-neutral-800 dark:text-slate-200 mb-2 text-base">
                                                צריכים עזרה אישית?
                                            </h3>
                                            <p className="text-muted-foreground text-sm mb-3">
                                                ניתן ליצור קשר ישיר עם צוות התמיכה שלנו בווצאפ
                                            </p>
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                צור קשר בווצאפ
                                            </a>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                058-651-9423
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Header Section - Contact */}
                                <div className="text-center mb-4">
                                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-slate-200 mb-2">
                                        צור קשר עם סמארטי
                                    </h1>
                                    <p className="text-muted-foreground text-base">
                                        אנחנו כאן כדי לעזור! צרו קשר איתנו בווצאפ בכל שאלה, בקשה או הערה.
                                    </p>
                                </div>

                                <Separator className="mb-4 h-0.5 rounded-full" />

                                {/* Main Contact Card - WhatsApp Only */}
                                <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 dark:from-gray-900 dark:via-green-900/10 dark:to-emerald-900/10 rounded-2xl p-4 md:p-6 shadow-lg border border-green-100 dark:border-green-900/30 mb-6">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                <Image
                                                    src="/whatsapp.svg"
                                                    alt="WhatsApp"
                                                    width={40}
                                                    height={40}
                                                    className="w-10 h-10"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <h2 className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-slate-200 mb-2">
                                                צור קשר בווצאפ
                                            </h2>
                                            <p className="text-muted-foreground mb-4 text-base">
                                                הדרך המהירה והנוחה ביותר לקבל תמיכה ותשובות לשאלות שלכם
                                            </p>
                                            <a
                                                href={whatsappUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                פתח שיחה בווצאפ
                                            </a>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex flex-col items-center">
                                                <span>
                                                    058-651-9423 &nbsp;—&nbsp; <span className="font-medium">ליצירת קשר בווצאפ בלבד</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp Group Invitation */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-100 dark:border-green-900/30">
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                                        <div>
                                            <h3 className="font-semibold text-neutral-800 dark:text-slate-200 mb-2">
                                                הצטרפו לתפוצת בווצאפ
                                            </h3>
                                            <p className="text-muted-foreground text-base mb-4">
                                                הצטרפו לתפוצת בווצאפ לקבל עדכונים שותפים בתוכנית ההכנה לבחינה
                                            </p>
                                            <a
                                                href={whatsappGroupUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                            >
                                                <Users className="w-5 h-5" />
                                                הצטרף לקבוצה
                                            </a>
                                            <div className="w-full flex justify-center mt-2">
                                                <CopyLinkButton url={whatsappGroupUrl} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Back to Home */}
                        <div className="mt-8 text-center">
                            <Button variant="ghost" asChild>
                                <Link href="/">
                                    חזרה לדף הבית
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </FeedWrapper>
        </div>
    );
};

export default ContactPage;

