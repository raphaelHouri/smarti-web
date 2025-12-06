import Image from "next/image";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
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
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";

export const metadata: Metadata = buildMetadata({
  title: "סמארטי | הכנה למבחני מחוננים ומצטיינים",
  description:
    "סמרטי - פלטפורמה להכנה למבחני מחוננים בעיקר לכיתות ב–ג: תרגולים אונליין, חוברות וסימולציות מודפסות, פעילויות פרונטליות והדרכת הורים מותאמת בכל הארץ.",
  keywords: ["מבחני מחוננים", "סימולציות מחוננים", "הורי מחוננים"],
});

async function getCurrentSystemStep(userId: string | null): Promise<number> {
  if (userId) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { systemStep: true },
    });
    if (user?.systemStep && [1, 2, 3].includes(user.systemStep)) {
      return user.systemStep;
    }
  }

  const cookieValue = (await cookies()).get("systemStep")?.value;
  const cookieNumber = cookieValue ? Number(cookieValue) : NaN;
  if ([1, 2, 3].includes(cookieNumber)) {
    return cookieNumber;
  }
  const currentMonth = new Date().getMonth() + 1;
  if (currentMonth >= 12 || currentMonth <= 4) {
    return 2;
  } else {
    return 1;
  }

}

export default async function Home() {
  const { userId } = await auth();
  const currentStep = await getCurrentSystemStep(userId);

  return (
    <>
      <Suspense fallback={null}>
        <SystemStepHandler />
      </Suspense>
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

          <div className="flex flex-col items-center justify-center gap-y-3 max-w-[330px] w-full">
            <ClerkLoading>
              <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/learn">
                  <Button size="lg" variant="secondary" className="w-full">
                    בואו נלמד ביחד
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Button variant="secondary" size="lg" className="w-full" asChild>
                  <Link href="/learn">
                    התחל ללמוד
                  </Link>
                </Button>
              </SignedIn>
            </ClerkLoaded>
            {/* divider */}

            {!userId ?
              <>
                <div className="w-full h-[1px] bg-slate-300 dark:bg-slate-700" />
                <Button variant="primaryOutline" size="lg" className="w-full" asChild>
                  <Link href="/learn">
                    המשך כאורח 👨🏻‍💻
                  </Link>
                </Button></> : null}
          </div>
        </div>
        {/* <LottieJson/> */}
      </div>
    </>
  );
}
