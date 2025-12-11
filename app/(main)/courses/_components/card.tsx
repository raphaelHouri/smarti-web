import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import Image from "next/image"

interface CardProps {
    title: string,
    id: string,
    imageSrc: string,
    onClick: (id: string) => void
    disabled?: boolean,
    active?: boolean
}


export const CardPage = ({
    title,
    id,
    imageSrc,
    onClick,
    disabled,
    active
}: CardProps) => {
    return (
        <div
            onClick={() => onClick(id)}
            className={cn
                (` relative border-b-8 border rounded-xl hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-row items-center gap-4 sm:p-3  sm:min-h-[50px] min-h-[44px] min-w-[180px]
        dark:border-b-8 dark:border dark:hover:bg-black/5 dark:active:border-b-2`,
                    disabled && "pointer-events-none opacity-50")
            }
        >

            <Avatar className="border bg-slate-100 h-8 w-8 mr-6 p-0.5 cursor-pointer">
                <AvatarImage
                    className="object-cover"
                    src={`${imageSrc}`}
                />
            </Avatar>
            {/* <Image
                    src={imageSrc || "/fr.svg"}
                    alt={title}
                    height={40}
                    width={40}
                    className="object-cover rounded-lg drop-shadow-md border"
                /> */}
            {active && (
                <div className="absolute -top-2 -right-2 rounded-md bg-green-600 flex items-center justify-center p-1">
                    <Check className="text-white stroke-[4] h-3 w-3" />
                </div>
            )}
            <p className="dark:text-slate-200 text-neutral-700 font-bold">
                {title}
            </p>
        </div>
    )
}