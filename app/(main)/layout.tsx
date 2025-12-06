import { MobileHeader } from "@/components/mobile-header";
import { SideBar } from "@/components/sideBar";
import { AnimatedBackground } from "./shop/_components/AnimatedBackground";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { users } from "@/db/schemaSmarti";
import { eq } from "drizzle-orm";
import { getSystemStepLabel } from "@/lib/utils";

interface Props {
    children: React.ReactNode
}

const MainLayout = async ({
    children
}: Props) => {
    const { userId } = await auth();
    let currentStep: number | null = null;

    if (userId) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { systemStep: true },
        });
        currentStep = user?.systemStep ?? null;
    }

    if (!currentStep) {
        const cookieValue = (await cookies()).get("systemStep")?.value;
        const cookieNumber = cookieValue ? Number(cookieValue) : NaN;
        if ([1, 2, 3].includes(cookieNumber)) {
            currentStep = cookieNumber;
        }
    }

    const systemStepLabel = getSystemStepLabel(currentStep);

    return (
        <div className="min-h-screen flex relative">
            <AnimatedBackground />
            <MobileHeader />
            <SideBar className="hidden lg:flex" systemStepLabel={systemStepLabel} />
            <main className="w-full lg:pr-[256px]  h-full pt-[50px] lg:pt-0">
                <div className="w-full sm:max-w-[1650px] mx-auto p-6   ">

                    {children}
                </div>
            </main>
        </div>
    );
}

export default MainLayout;