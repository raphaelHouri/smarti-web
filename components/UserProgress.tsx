import Link from "next/link"
import { Button } from "./ui/button"
import Image from "next/image"
import { InfinityIcon } from "lucide-react"


interface ActiveCourse {
    id: string;
    title: string;
    imageSrc: string;
}

interface UserProgressProps {
    title: string;
    imageSrc: string;
    geniusScore: number;
    experience: number;
    hasActiveSubscription: boolean;
}


export const UserProgress = ({
    title,
    imageSrc,
    experience,
    geniusScore,
    hasActiveSubscription
}: UserProgressProps) => {
    return (
        <div className="flex items-center justify-between gap-x-2
        w-full">
            <Link href="/courses">
                <Button
                    variant="ghost"
                >
                    <Image
                        src={imageSrc}
                        alt={title || "course"}
                        className="rounded-md border"
                        height={32}
                        width={32}
                    />
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="ghost" className="text-orange-500">
                    <Image src="/points.svg" alt="experience" height={28} width={28}
                        className="mr-2"
                    />
                    {experience}
                </Button>
            </Link>
            <Link href="/shop">
                <Button variant="ghost" className="text-rose-500">
                    <Image src="/heart.svg" alt="geniusScore" height={22} width={22}
                        className="mr-2"
                    />
                    {hasActiveSubscription ? <InfinityIcon className="h-4 w-4 stroke-[3]" /> : geniusScore}
                </Button>
            </Link>
        </div>
    )
}