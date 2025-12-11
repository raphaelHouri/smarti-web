// reusable component

import { cn, getSystemStepLabel } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SideBarItems } from "./sideBar-items";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import { UserEmail } from "./user-email";

interface SideBarProps {
    className?: string;
    systemStep?: number;
    onNavigate?: () => void;
}

const sidebarItems = [
    { href: '/learn', label: 'למידה', iconSrc: '/learn.svg', registerOnly: false },
    { href: '/online-lesson', label: 'שיעורי אונליין', iconSrc: '/online-lesson.svg', registerOnly: false },
    { href: '/practice', label: 'תרגול טעויות', iconSrc: '/practice.svg', registerOnly: true },
    { href: '/shop', label: 'חנות השירותים', iconSrc: '/shop.svg', registerOnly: true },
    { href: '/leaderboard', label: 'לוח דירוגים', iconSrc: '/leaderboard.svg', registerOnly: true },
    { href: '/quests', label: 'שלבים', iconSrc: '/quests.svg', registerOnly: true },
    { href: '/settings', label: 'הגדרות', iconSrc: '/setting-profile.svg', registerOnly: true },
];

export const SideBar = ({
    className,
    systemStep = 1,
    onNavigate
}: SideBarProps) => {
    const systemStepLabel = getSystemStepLabel(systemStep);

    return (
        <div className={cn("flex h-full lg:w-[256px] lg:fixed right-0 top-0 px-4 border-l-2 flex-col overflow-hidden", className)}>
            <Link href="/" onClick={onNavigate}>
                <div className="pt-8 pb-7 pl-4 flex items-center gap-x-3 flex-shrink-0 flex-col">
                    <Image
                        src="/smartiLogo.png"
                        alt="Smarti logo"
                        height={65}
                        width={240}
                        priority
                    />
                    {systemStep && [1, 2, 3].includes(systemStep) ? (
                        <Image
                            src={`/step${systemStep}.png`}
                            alt="Smarti step"
                            width={200}
                            height={50}
                            className="mr-2"
                            priority
                        />
                    ) : (
                        <p className="text-lg font-bold text-[#00C950] tracking-wide text-center">
                            {systemStepLabel}
                        </p>
                    )}
                </div>
            </Link>
            <div className="flex flex-col flex-1 gap-y-4 overflow-y-auto min-h-0">
                {sidebarItems.map((item, index) => (
                    <SideBarItems
                        key={index}
                        label={item.label}
                        iconSrc={item.iconSrc}
                        href={item.href}
                        registerOnly={item.registerOnly}
                        onNavigate={onNavigate}
                    />
                ))}
            </div>
            <div className="py-2 flex-shrink-0 flex flex-col gap-2">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <div className="flex items-center gap-2">
                        <UserButton
                            afterSignOutUrl="/"
                        />
                        <UserEmail />
                    </div>
                </ClerkLoaded>
            </div>
        </div>
    )
}