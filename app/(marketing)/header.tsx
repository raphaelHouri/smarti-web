
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import FeedbackButton from "@/components/feedbackButton";
import { getSystemStep } from "@/actions/get-system-step";
import { getSystemStepLabel } from "@/lib/utils";
import { AuthButtons } from "@/components/auth-buttons";

const HeaderPage = async () => {
  const currentStep = await getSystemStep();
  const label = getSystemStepLabel(currentStep);

  return (
    <header
      className="h-20 w-full border-b-2 border-slate-100
    dark:border-none
    px-4"
    >
      <div
        className="h-full lg:max-w-screen-lg mx-auto items-center
    justify-between flex"
      >
        <div className="pt-8 pb-7 flex items-center gap-x-1">
          <Link href="/">
            <Image
              src="/smartiLogo.png"
              alt="Smarti mascot"
              width={200}
              height={50}
              className="mr-2"
              priority
            />
          </Link>
          {/* {currentStep && [1, 2, 3].includes(currentStep) ? (
            <Image
              src={`/step${currentStep}.png`}
              alt="Smarti step"
              width={200}
              height={50}
              className="mr-2"
              priority
            />
          ) : (
            <p className="text-lg font-bold text-[#00C950] tracking-wide sm:block hidden">
              {label}
            </p>
          )} */}
        </div>
        <div className="inline-flex gap-x-4 mt-2 ms:ml-0 ml-4">
          <AuthButtons />
          <div className="hidden lg:flex">
            <ModeToggle />
          </div>
          <div className="hidden sm:flex mt-1">
            <FeedbackButton screenName="header" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderPage;









