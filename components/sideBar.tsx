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
    { href: '/learn', label: 'Learn', iconSrc: '/learn.svg', registerOnly: true },
    { href: '/leaderboard', label: 'Leaderboard', iconSrc: '/leaderboard.svg', registerOnly: true },
    { href: '/quests', label: 'Quests', iconSrc: '/quests.svg', registerOnly: true },
    { href: '/settings', label: 'Settings', iconSrc: '/setting-profile.svg', registerOnly: true },
    { href: '/shop', label: 'Shop', iconSrc: '/shop.svg', registerOnly: true },
];

export const SideBar = ({
    className
}: SideBarProps) => {
    return (
        <div className={cn("flex h-full lg:w-[256px] lg:fixed right-0 top-0 px-4 border-l-2 flex-col", className)}>
            <Link href="/">
                <div className="pt-8 pb-7 pl-4 flex items-center gap-x-3">
                    <Image
                        src="/mascot.svg"
                        alt="Mascot"
                        height={40} width={40}
                    />
                    <h1 className="uppercase text-xl font-extrabold text-green-600
            tracking-wide cursor-pointer">
                        Linguify
                    </h1>
                </div>
            </Link>
            <div className="flex flex-col flex-1 gap-y-4">
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
            <div className="py-2">
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