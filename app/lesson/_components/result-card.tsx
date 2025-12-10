import { cn } from "@/lib/utils";
import Image from "next/image";

interface ResultCardProps {
    variant: "stars" | "coins"
    value: number
}

const ResultCard = ({
    variant,
    value
}: ResultCardProps) => {
    const imageSrc = variant === "coins" ? "/coin.svg" : "/stars.svg";
    return (
        <div className={cn("rounded-2xl border-2 w-full",
            variant === "stars" && "bg-orange-400 border-orange-400",
            variant === "coins" && "bg-rose-400 border-rose-400"
        )}>
            <div className={cn(
                `p-1.5 text-white rounded-t-xl font-bold text-lg tracking-wide text-center uppercase`,
                variant === "stars" && "bg-orange-400",
                variant === "coins" && "bg-rose-400"
            )}>
                {variant === "coins" ? "מטבעות" : "כוכבים"}
            </div>
            <div className={cn
                (`rounded-2xl bg-white items-center 
                flex justify-center font-bold p-6 text-lg`,
                    variant === "stars" && "text-orange-400",
                    variant === "coins" && "text-rose-400"
                )}>
                <Image
                    src={imageSrc}
                    alt="Icon"
                    height={30}
                    width={30}
                    className="mr-2"
                />
                {value}
            </div>
        </div>
    );
}

export default ResultCard;