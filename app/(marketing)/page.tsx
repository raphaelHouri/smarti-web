import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { cookies } from "next/headers";
// LottieJson is a client component that already lazy-loads lottie-react.
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { SystemStepTabs } from "@/components/system-step-tabs";
import { SystemStepHandler } from "@/components/system-step-handler";
import { AndroidStoreHandlerWrapper } from "@/components/android-store-handler-wrapper";
import { MarketingAuthButtons } from "@/components/marketing-auth-buttons";
import { getUserSystemStep } from "@/db/queries";
import { HomePageTracker } from "./_components/HomePageTracker";

export const metadata: Metadata = buildMetadata({
  title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
  description:
    "סמארטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  keywords: ["מבחני מחוננים", "סימולציות מחוננים", "הורי מחוננים"],
});

export default async function Home() {
  const { userId } = await auth();
  // Get systemStep for both authenticated and guest users (from cookie or user record)
  const currentStep = await getUserSystemStep(userId);

  return (
    <>
      <HomePageTracker />
      <Suspense fallback={null}>
        <SystemStepHandler />
      </Suspense>
      <AndroidStoreHandlerWrapper />
      <div className="max-w-[998px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-2 gap-2 relative" dir="rtl">

        {/* container to hold image */}
        <div className=" hidden  sm:block relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
          <Image
            src="/hero.png"
            alt="hero"
            fill
            priority
            sizes="(max-width: 1024px) 240px, 424px"
          />
        </div>
        <div className="flex flex-col items-center gap-y-6">


          <div className="flex flex-col items-center gap-2 mb-2">





            <Suspense fallback={null}>
              <SystemStepTabs isAuthenticated={!!userId} initialStep={currentStep} />
            </Suspense>

          </div>

          {/* System step selector for guests and signed-in users */}
          {/* <div className="w-full max-w-[380px]">

          <SystemStepTabs isAuthenticated={!!userId} />
        </div> */}

          <MarketingAuthButtons />
          {/* divider */}
          {!userId ? (
            <>
              <div className="w-full h-[1px] bg-slate-300 dark:bg-slate-700" />
              <Button variant="primaryOutline" size="lg" className="w-full" asChild>
                <Link href="/learn">
                  המשך כאורח
                </Link>
              </Button>
            </>
          ) : null}
        </div>
        {/* <LottieJson/> */}
      </div>
    </>
  );
}
