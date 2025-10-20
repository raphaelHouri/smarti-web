import Image from "next/image";
import dynamic from "next/dynamic";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
const Lottie = dynamic(() => import("./lottie"), {
  ssr: false,
  loading: () => null,
});


export default async function Home() {
  const { userId } = await auth();
  return (
    <div className="max-w-[998px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-2 gap-2">
      {/* container to hold image */}
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image
          src="/hero.svg"
          alt="hero"
          fill
          priority
          sizes="(max-width: 1024px) 240px, 424px"
        />
      </div>
      <div className="flex flex-col items-center gap-y-6">

        <h1 className="font-bold text-xl lg:text-3xl text-neutral-600 max-w-[600px] text-center dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-tr from-slate-500 to-neutral-300/90">
          <Lottie />
          Master and refine in learning new languages through Linguify.
        </h1>
        <div className="flex flex-col items-center justify-center gap-y-3 max-w-[330px] w-full">
          <ClerkLoading>
            <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
          </ClerkLoading>
          <ClerkLoaded>
            <SignedOut>
              <SignUpButton
                mode="modal"
                forceRedirectUrl="/learn"
              >
                <Button size="lg" variant="secondary" className="w-full">
                  Get Started
                </Button>
              </SignUpButton>
              <SignInButton
                mode="modal"
                forceRedirectUrl="/learn"
              >
                <Button size="lg" variant="primaryOutline" className="w-full">
                  I already have an account
                </Button>

              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button variant="secondary" size="lg" className="w-full" asChild>
                <Link href="/learn">
                  Continue Learning
                </Link>
              </Button>
            </SignedIn>
          </ClerkLoaded>
          {/* divider */}

          {!userId ? <><div className="w-full h-[1px] bg-slate-300 dark:bg-slate-700" /><Button variant="primaryOutline" size="lg" className="w-full" asChild>
            <Link href="/learn">
              Continue as a guest 👨🏻‍💻
            </Link>
          </Button></> : null}
        </div>
      </div>
      {/* <LottieJson/> */}
    </div>
  );
}
