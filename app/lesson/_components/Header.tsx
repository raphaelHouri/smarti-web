import { ModeToggle } from "@/components/mode-toggle";
import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { Infinity, InfinityIcon, X } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

interface HeaderProps {
    percentage: number;
    feedback?: ReactNode;
}

const Header = ({
    percentage,
    feedback
}: HeaderProps) => {
    const { open } = useExitModal();
    return (
        <div className="lg:pt-[50px] pt-[20px] max-w-[1140px]
        items-center justify-between mx-auto px-10 flex gap-x-7 w-full">
            <X
                onClick={open} //Todo:Add exit modal
                className="text-slate-500 hover:opacity-75 transition cursor-pointer w-8 h-8 sm:w-8 sm:h-8"
            />
            <Progress value={percentage} />

            <div className="ml-4">
                <ModeToggle />
            </div>
            {feedback && (
                <div >
                    {feedback}
                </div>
            )}

        </div>
    );
}

export default Header;