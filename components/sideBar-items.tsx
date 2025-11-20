"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
import { useRegisterModal } from "@/store/use-register-modal";
import { useAuth } from "@clerk/nextjs";


interface SideBarItemsProps {
    label: string,
    iconSrc: string,
    href: string,
    registerOnly: boolean
}

export const SideBarItems = ({
    label,
    iconSrc,
    href,
    registerOnly
}: SideBarItemsProps) => {
    //usePathname to manage the routes whether active or not

    const pathname = usePathname();
    const active = pathname === href || (href === '/online-lesson' && pathname?.startsWith('/online-lesson'));
    const { open: OpenRegisterModal } = useRegisterModal();
    const { userId } = useAuth();

    if (registerOnly && !userId) {
        return (
            <Button
                variant="ghost"
                className="justify-start h-[52px]"
                onClick={OpenRegisterModal}
            >
                <span className="mr-2 ml-auto">{label}</span>
                <Image
                    src={iconSrc}
                    alt="label"
                    height={32}
                    width={32}
                />
            </Button>
        );
    }
    return (
        <Button
            variant={active ? 'sidebarOutline' : 'ghost'}
            className="justify-start h-[52px]"
            asChild
        >
            <Link href={href} className="dark:text-slate-200">
                <span className="mr-2 ml-auto">{label}</span>
                <Image
                    src={iconSrc}
                    alt="label"
                    height={32}
                    width={32}
                />
            </Link>
        </Button>
    )
}