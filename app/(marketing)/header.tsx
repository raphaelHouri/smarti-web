
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import FeedbackButton from "@/components/feedbackButton";


const HeaderPage = () => {
  return (
    <header className="h-20 w-full border-b-2 border-slate-100
    dark:border-none
    px-4">
      <div className="h-full lg:max-w-screen-lg mx-auto items-center
    justify-between flex">
        <div className="pt-8 pb-7 flex items-center gap-x-1">
          <Link href="/">
            <Image
              src="/smartiLogo.png"
              alt="Smarti mascot"
              width={240}
              height={65}
              className="mr-2"
              priority
            />
            

          </Link>
          <p className="text-lg font-bold text-[#00C950] tracking-wide">
            כיתה ב' - שלב א'
          </p>
        </div>
        <div className="inline-flex gap-x-4 mt-2 ms:ml-0 ml-4">
          <div className="mt-2">
            <ClerkLoading>
              <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
            </ClerkLoading>
          </div>
          <ClerkLoaded>
            <SignedIn>
              <div className="mt-1">
                <UserButton />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton
                forceRedirectUrl="/learn"
                signUpForceRedirectUrl="/learn"
                mode="modal"
              >
                <Button variant="ghost">
                  Login 👨🏻‍💻
                </Button>
              </SignInButton>
            </SignedOut>
          </ClerkLoaded>
          <div className="hidden lg:flex">
            <ModeToggle />
          </div>
          <div className="hidden sm:flex mt-1">
            <FeedbackButton screenName="header" />
          </div>
        </div>
      </div>
    </header >
  );
}

export default HeaderPage;









