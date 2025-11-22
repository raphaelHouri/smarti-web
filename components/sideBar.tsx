// reusable component

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SideBarItems } from "./sideBar-items";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { ChevronFirst, Loader } from "lucide-react";

interface SideBarProps {
    className?: string;
}

const sidebarItems = [
    { href: '/learn', label: 'למידה', iconSrc: '/learn.svg', registerOnly: false },
    { href: '/online-lesson', label: 'שיעורי אונליין', iconSrc: '/online-lesson.svg', registerOnly: false },
    { href: '/practice', label: 'תרגול טעויות', iconSrc: '/practice.svg', registerOnly: true },
    { href: '/shop', label: 'שירותים ומוצרים', iconSrc: '/shop.svg', registerOnly: true },
    { href: '/leaderboard', label: 'לוח דירוגים', iconSrc: '/leaderboard.svg', registerOnly: true },
    { href: '/quests', label: 'שלבים', iconSrc: '/quests.svg', registerOnly: true },
    { href: '/settings', label: 'הגדרות', iconSrc: '/setting-profile.svg', registerOnly: true },
];

export const SideBar = ({
    className
}: SideBarProps) => {
    return (
        <div className={cn("flex h-full lg:w-[256px] lg:fixed right-0 top-0 px-4 border-l-2 flex-col overflow-hidden", className)}>
            <Link href="/">
                <div className="pt-8 pb-7 pl-4 flex items-center gap-x-3 flex-shrink-0 flex-col">
                    <Image
                        src="/smartiLogo.png"
                        alt="Smarti logo"
                        height={65}
                        width={240}
                        priority
                    />
                    <p className="text-lg font-bold text-[#00C950] tracking-wide text-center">
                        כיתה ב' - שלב א'
                    </p>
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
                    />
                ))}
            </div>
            <div className="py-2 flex-shrink-0">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton
                        afterSignOutUrl="/"
                    />
                </ClerkLoaded>
            </div>
        </div>
    )
}