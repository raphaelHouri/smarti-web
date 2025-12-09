import { MobileHeader } from "@/components/mobile-header";
import { SideBar } from "@/components/sideBar";
import { AnimatedBackground } from "./shop/_components/AnimatedBackground";
import { getSystemStep } from "@/actions/get-system-step";

interface Props {
    children: React.ReactNode
}

const MainLayout = async ({
    children
}: Props) => {
    const currentStep = await getSystemStep();

    return (
        <div className="min-h-screen flex relative">
            <AnimatedBackground />
            <MobileHeader />
            <SideBar className="hidden lg:flex" systemStep={currentStep} />
            <main className="w-full lg:pr-[256px]  h-full pt-[50px] lg:pt-0">
                <div className="w-full sm:max-w-[1650px] mx-auto p-6   ">

                    {children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;