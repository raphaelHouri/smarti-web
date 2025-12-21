import { ModeToggle } from "@/components/mode-toggle";
import { Progress } from "@/components/ui/progress";
import { useExitModal } from "@/store/use-exit-modal";
import { Infinity, InfinityIcon, X } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

interface HeaderProps {
    percentage: number;
    feedback?: ReactNode;
    onExit?: () => void;
}

const Header = ({
    percentage,
    feedback,
    onExit
}: HeaderProps) => {
    const { open } = useExitModal();
    const handleExit = onExit || (() => open());
    return (
        <div className="lg:pt-[50px] pt-[20px] max-w-[1140px] xl:pr-48 2xl:pr-0 
        items-center justify-between mx-auto px-10 flex gap-x-7 w-full">
            <X
                onClick={handleExit}
                className="text-slate-500 hover:opacity-75 transition cursor-pointer w-16 h-16 sm:w-6 sm:h-6"
            />
            <Progress value={percentage} />

            <div className="ml-4 hidden sm:block">
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